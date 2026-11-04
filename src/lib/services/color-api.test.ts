import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import {
  fetchColorInfo,
  clearColorCache,
  InvalidHexError,
  ColorApiError,
} from './color-api';
import type { ColorApiResponse } from '../types/color';

const mockResponseData: ColorApiResponse = {
  hex: { value: '#4F46E5', clean: '4F46E5' },
  rgb: { r: 79, g: 70, b: 229, value: 'rgb(79, 70, 229)' },
  hsl: { h: 243, s: 75, l: 59, value: 'hsl(243, 75%, 59%)' },
  hsv: { h: 243, s: 69, v: 90, value: 'hsv(243, 69%, 90%)' },
  cmyk: { c: 66, m: 69, y: 0, k: 10, value: 'cmyk(66, 69, 0, 10)' },
  XYZ: { X: 39, Y: 33, Z: 89, value: 'XYZ(39, 33, 89)' },
  name: {
    value: 'Royal Blue',
    closest_named_hex: '#4169E1',
    exact_match_name: false,
    distance: 1905,
  },
  contrast: { value: '#ffffff' },
};

describe('color-api service', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    clearColorCache();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('rejects invalid hex before sending a network request', async () => {
    let fetchCalled = false;
    globalThis.fetch = mock(async () => {
      fetchCalled = true;
      return new Response('{}');
    });

    await expect(fetchColorInfo('not-a-hex')).rejects.toThrow(InvalidHexError);
    expect(fetchCalled).toBe(false);

    await expect(fetchColorInfo('')).rejects.toThrow(InvalidHexError);
    expect(fetchCalled).toBe(false);
  });

  it('fetches color info successfully for valid hex', async () => {
    globalThis.fetch = mock(async (url: string | URL | Request) => {
      expect(String(url)).toContain('hex=4F46E5');
      return new Response(JSON.stringify(mockResponseData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const result = await fetchColorInfo('#4F46E5');
    expect(result.name.value).toBe('Royal Blue');
    expect(result.hex.clean).toBe('4F46E5');
    expect(result.rgb.value).toBe('rgb(79, 70, 229)');
  });

  it('reuses in-memory cached responses to prevent duplicate network calls', async () => {
    let callCount = 0;
    globalThis.fetch = mock(async () => {
      callCount++;
      return new Response(JSON.stringify(mockResponseData), { status: 200 });
    });

    const first = await fetchColorInfo('#4F46E5');
    const second = await fetchColorInfo('4F46E5'); // without hash

    expect(callCount).toBe(1);
    expect(first).toEqual(second);
  });

  it('handles non-2xx HTTP error status', async () => {
    globalThis.fetch = mock(async () => {
      return new Response('Service Unavailable', {
        status: 503,
        statusText: 'Service Unavailable',
      });
    });

    await expect(fetchColorInfo('#10B981')).rejects.toThrow(ColorApiError);
  });

  it('handles network failure', async () => {
    globalThis.fetch = mock(async () => {
      throw new Error('Failed to fetch (offline)');
    });

    await expect(fetchColorInfo('#10B981')).rejects.toThrow(ColorApiError);
  });

  it('handles aborted requests', async () => {
    const controller = new AbortController();
    controller.abort();

    globalThis.fetch = mock(async (_: string | URL | Request, init?: RequestInit) => {
      if (init?.signal?.aborted) {
        throw new DOMException('The user aborted a request.', 'AbortError');
      }
      return new Response(JSON.stringify(mockResponseData));
    });

    await expect(fetchColorInfo('#10B981', controller.signal)).rejects.toThrow(DOMException);
  });

  it('throws ColorApiError when API returns a malformed or NaN payload', async () => {
    globalThis.fetch = mock(async () => {
      return new Response(
        JSON.stringify({
          hex: { value: 'ZZZZ', clean: 'ZZZZ' },
          rgb: { value: 'rgb(NaN, NaN, NaN)' },
          name: { value: 'Black' },
        }),
        { status: 200 }
      );
    });

    await expect(fetchColorInfo('#123456')).rejects.toThrow(ColorApiError);
  });
});
