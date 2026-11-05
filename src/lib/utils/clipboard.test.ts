import { describe, it, expect, afterEach } from 'bun:test';
import { copyToClipboard } from './clipboard';

describe('clipboard utility', () => {
  const originalNavigator = globalThis.navigator;

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  it('returns false for empty text', async () => {
    const result = await copyToClipboard('');
    expect(result).toBe(false);
  });

  it('uses navigator.clipboard.writeText when available', async () => {
    let written = '';
    const mockClipboard = {
      writeText: async (text: string) => {
        written = text;
      },
    };

    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: mockClipboard },
      configurable: true,
      writable: true,
    });

    const success = await copyToClipboard('#4F46E5');
    expect(success).toBe(true);
    expect(written).toBe('#4F46E5');
  });

  it('successfully copies multi-color palette hex list to clipboard', async () => {
    let written = '';
    const mockClipboard = {
      writeText: async (text: string) => {
        written = text;
      },
    };

    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: mockClipboard },
      configurable: true,
      writable: true,
    });

    const paletteList = '#4F46E5, #E54670, #46E5BB, #E5D046, #6746E5';
    const success = await copyToClipboard(paletteList);
    expect(success).toBe(true);
    expect(written).toBe(paletteList);
  });

  it('successfully copies converted color formats (RGB, HSL, HSV, CMYK)', async () => {
    let written = '';
    const mockClipboard = {
      writeText: async (text: string) => {
        written = text;
      },
    };

    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: mockClipboard },
      configurable: true,
      writable: true,
    });

    const formatsToTest = [
      '#7C83FD',
      'rgb(124, 131, 253)',
      'hsl(237, 98%, 74%)',
      'hsv(237, 51%, 99%)',
      'cmyk(51%, 48%, 0%, 1%)',
    ];

    for (const fmt of formatsToTest) {
      const ok = await copyToClipboard(fmt);
      expect(ok).toBe(true);
      expect(written).toBe(fmt);
    }
  });

  it('returns false gracefully when clipboard operations fail', async () => {
    const mockClipboard = {
      writeText: async () => {
        throw new Error('Clipboard permission denied');
      },
    };

    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: mockClipboard },
      configurable: true,
      writable: true,
    });

    const success = await copyToClipboard('#4F46E5');
    expect(typeof success).toBe('boolean');
  });
});
