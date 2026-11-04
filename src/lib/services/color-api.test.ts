import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import {
  fetchColorInfo,
  fetchColorScheme,
  clearColorCache,
  InvalidHexError,
  ColorApiError,
} from './color-api';
import type { ColorApiResponse } from '../types/color';
import type { SchemeApiResponse } from '../types/scheme';

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

function createMockSchemeData(mode = 'complement', count = 5): SchemeApiResponse {
  const colors: ColorApiResponse[] = [];
  for (let i = 0; i < count; i++) {
    colors.push({
      ...mockResponseData,
      hex: { value: `#4F46E${i}`, clean: `4F46E${i}` },
      name: { ...mockResponseData.name, value: `Harmonious Color ${i + 1}` },
    });
  }

  return {
    mode,
    count: String(count),
    colors,
    seed: mockResponseData,
    image: {
      bare: 'https://www.thecolorapi.com/scheme/bare',
      named: 'https://www.thecolorapi.com/scheme/named',
    },
  };
}

describe('color-api service', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    clearColorCache();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('fetchColorInfo (Phase 2)', () => {
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

  describe('fetchColorScheme (Phase 3)', () => {
    it('rejects invalid base hex before sending request', async () => {
      let fetchCalled = false;
      globalThis.fetch = mock(async () => {
        fetchCalled = true;
        return new Response('{}');
      });

      await expect(fetchColorScheme('invalid-hex')).rejects.toThrow(InvalidHexError);
      expect(fetchCalled).toBe(false);

      await expect(fetchColorScheme('')).rejects.toThrow(InvalidHexError);
      expect(fetchCalled).toBe(false);
    });

    it('fetches color scheme successfully with expected parameters', async () => {
      globalThis.fetch = mock(async (url: string | URL | Request) => {
        const urlStr = String(url);
        expect(urlStr).toContain('/scheme?');
        expect(urlStr).toContain('hex=4F46E5');
        expect(urlStr).toContain('mode=complement');
        expect(urlStr).toContain('count=5');
        expect(urlStr).toContain('format=json');

        return new Response(JSON.stringify(createMockSchemeData('complement', 5)), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      const result = await fetchColorScheme('#4F46E5', 'complement', 5);
      expect(result.mode).toBe('complement');
      expect(result.colors.length).toBe(5);
      expect(result.seed.hex.clean).toBe('4F46E5');
    });

    it('supports all required harmony modes: complement, analogic, triad, analogic-complement, monochrome, quad', async () => {
      const modes = ['complement', 'analogic', 'triad', 'analogic-complement', 'monochrome', 'quad'] as const;

      for (const mode of modes) {
        clearColorCache();
        globalThis.fetch = mock(async (url: string | URL | Request) => {
          expect(String(url)).toContain(`mode=${encodeURIComponent(mode)}`);
          return new Response(JSON.stringify(createMockSchemeData(mode, 5)));
        });

        const scheme = await fetchColorScheme('#4F46E5', mode, 5);
        expect(scheme.mode).toBe(mode);
      }
    });

    it('clamps color count to reasonable limits (min: 2, max: 10)', async () => {
      globalThis.fetch = mock(async (url: string | URL | Request) => {
        const urlStr = String(url);
        if (urlStr.includes('hex=111111')) {
          expect(urlStr).toContain('count=2'); // Clamped min
        }
        if (urlStr.includes('hex=222222')) {
          expect(urlStr).toContain('count=10'); // Clamped max
        }
        return new Response(JSON.stringify(createMockSchemeData('complement', 5)));
      });

      await fetchColorScheme('111111', 'complement', 1);
      await fetchColorScheme('222222', 'complement', 99);
    });

    it('caches scheme responses by hex, mode, and count to prevent duplicate network calls', async () => {
      let callCount = 0;
      globalThis.fetch = mock(async () => {
        callCount++;
        return new Response(JSON.stringify(createMockSchemeData('analogic', 5)));
      });

      const call1 = await fetchColorScheme('#4F46E5', 'analogic', 5);
      const call2 = await fetchColorScheme('4F46E5', 'analogic', 5); // same cached

      expect(callCount).toBe(1);
      expect(call1).toEqual(call2);

      // Different mode calls network again
      await fetchColorScheme('#4F46E5', 'triad', 5);
      expect(callCount).toBe(2);

      // Different count calls network again
      await fetchColorScheme('#4F46E5', 'analogic', 6);
      expect(callCount).toBe(3);
    });

    it('handles non-2xx scheme API response gracefully', async () => {
      globalThis.fetch = mock(async () => {
        return new Response('Internal Server Error', {
          status: 500,
          statusText: 'Internal Server Error',
        });
      });

      await expect(fetchColorScheme('#4F46E5')).rejects.toThrow(ColorApiError);
    });

    it('handles network disconnection/failure during scheme fetch', async () => {
      globalThis.fetch = mock(async () => {
        throw new Error('Network offline');
      });

      await expect(fetchColorScheme('#4F46E5')).rejects.toThrow(ColorApiError);
    });

    it('handles scheme request cancellation via AbortSignal', async () => {
      const controller = new AbortController();
      controller.abort();

      globalThis.fetch = mock(async (_: string | URL | Request, init?: RequestInit) => {
        if (init?.signal?.aborted) {
          throw new DOMException('User aborted request', 'AbortError');
        }
        return new Response(JSON.stringify(createMockSchemeData()));
      });

      await expect(fetchColorScheme('#4F46E5', 'complement', 5, controller.signal)).rejects.toThrow(DOMException);
    });

    it('throws ColorApiError when scheme response is malformed or missing colors array', async () => {
      globalThis.fetch = mock(async () => {
        return new Response(
          JSON.stringify({
            mode: 'complement',
            colors: [], // empty colors
            seed: null,
          }),
          { status: 200 }
        );
      });

      await expect(fetchColorScheme('#4F46E5')).rejects.toThrow(ColorApiError);
    });
  });
});
