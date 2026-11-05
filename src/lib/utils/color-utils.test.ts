import { describe, it, expect } from 'bun:test';
import {
  normalizeHex,
  formatHex,
  isValidHex,
  getRandomHex,
  hexToRgb,
  getRelativeLuminance,
  getContrastColor,
  isLightColor,
  calculateContrastRatio,
  getContrastRatio,
  formatContrastRatio,
} from './color-utils';

describe('color-utils', () => {
  describe('normalizeHex', () => {
    it('normalizes valid 6-digit hex with #', () => {
      expect(normalizeHex('#4F46E5')).toBe('4F46E5');
      expect(normalizeHex('#7c83fd')).toBe('7C83FD');
      expect(normalizeHex('#000000')).toBe('000000');
      expect(normalizeHex('#ffffff')).toBe('FFFFFF');
    });

    it('normalizes valid 6-digit hex without #', () => {
      expect(normalizeHex('4F46E5')).toBe('4F46E5');
      expect(normalizeHex('7c83fd')).toBe('7C83FD');
      expect(normalizeHex('123456')).toBe('123456');
    });

    it('expands 3-digit shorthand hex with #', () => {
      expect(normalizeHex('#fff')).toBe('FFFFFF');
      expect(normalizeHex('#000')).toBe('000000');
      expect(normalizeHex('#f0a')).toBe('FF00AA');
      expect(normalizeHex('#123')).toBe('112233');
    });

    it('expands 3-digit shorthand hex without #', () => {
      expect(normalizeHex('fff')).toBe('FFFFFF');
      expect(normalizeHex('abc')).toBe('AABBCC');
    });

    it('handles whitespace around input', () => {
      expect(normalizeHex('   #4F46E5   ')).toBe('4F46E5');
      expect(normalizeHex('  abc  ')).toBe('AABBCC');
    });

    it('returns null for empty or null/undefined inputs', () => {
      expect(normalizeHex('')).toBeNull();
      expect(normalizeHex('   ')).toBeNull();
      expect(normalizeHex(null)).toBeNull();
      expect(normalizeHex(undefined)).toBeNull();
    });

    it('returns null for invalid hex characters or lengths', () => {
      expect(normalizeHex('zzzzzz')).toBeNull();
      expect(normalizeHex('#12')).toBeNull();
      expect(normalizeHex('1234')).toBeNull();
      expect(normalizeHex('#12345')).toBeNull();
      expect(normalizeHex('#1234567')).toBeNull();
      expect(normalizeHex('not-a-color')).toBeNull();
      expect(normalizeHex('#ggg')).toBeNull();
    });
  });

  describe('formatHex', () => {
    it('prepends # to clean hex', () => {
      expect(formatHex('4F46E5')).toBe('#4F46E5');
      expect(formatHex('#4F46E5')).toBe('#4F46E5');
      expect(formatHex('fff')).toBe('#FFFFFF');
    });
  });

  describe('isValidHex', () => {
    it('returns true for valid hex strings', () => {
      expect(isValidHex('#4F46E5')).toBe(true);
      expect(isValidHex('4F46E5')).toBe(true);
      expect(isValidHex('#FFF')).toBe(true);
      expect(isValidHex('abc')).toBe(true);
    });

    it('returns false for invalid hex strings', () => {
      expect(isValidHex('')).toBe(false);
      expect(isValidHex(null)).toBe(false);
      expect(isValidHex('#12345')).toBe(false);
      expect(isValidHex('xyz123')).toBe(false);
    });
  });

  describe('getRandomHex', () => {
    it('generates a valid 6-character hex string without leading #', () => {
      for (let i = 0; i < 20; i++) {
        const hex = getRandomHex();
        expect(hex).toMatch(/^[0-9A-F]{6}$/);
        expect(isValidHex(hex)).toBe(true);
      }
    });
  });

  describe('hexToRgb', () => {
    it('parses valid hex to RGB', () => {
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('00FF00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb('#4F46E5')).toEqual({ r: 79, g: 70, b: 229 });
    });

    it('returns null for invalid hex', () => {
      expect(hexToRgb('invalid')).toBeNull();
    });
  });

  describe('getRelativeLuminance & contrast', () => {
    it('calculates expected luminance values', () => {
      expect(getRelativeLuminance(0, 0, 0)).toBe(0);
      expect(getRelativeLuminance(255, 255, 255)).toBeCloseTo(1, 4);
    });

    it('calculates and formats WCAG contrast ratios', () => {
      // (1.0 + 0.05) / (0.0 + 0.05) = 21.0
      expect(calculateContrastRatio(1.0, 0.0)).toBe(21.0);
      expect(calculateContrastRatio(0.0, 1.0)).toBe(21.0);
      expect(calculateContrastRatio(0.5, 0.5)).toBe(1.0);

      const bwRatio = getContrastRatio('#000000', '#FFFFFF');
      expect(bwRatio).toBe(21.0);
      expect(formatContrastRatio(bwRatio!)).toBe('21.00:1');

      const sameRatio = getContrastRatio('#4F46E5', '#4F46E5');
      expect(sameRatio).toBe(1.0);
      expect(formatContrastRatio(sameRatio!)).toBe('1.00:1');

      expect(getContrastRatio('invalid', '#FFFFFF')).toBeNull();
    });

    it('returns high contrast color (#FFFFFF or #000000)', () => {
      // Pure white background needs black text
      expect(getContrastColor('#FFFFFF')).toBe('#000000');
      expect(isLightColor('#FFFFFF')).toBe(true);

      // Pure black background needs white text
      expect(getContrastColor('#000000')).toBe('#FFFFFF');
      expect(isLightColor('#000000')).toBe(false);

      // Deep indigo needs white text
      expect(getContrastColor('#4F46E5')).toBe('#FFFFFF');
      expect(isLightColor('#4F46E5')).toBe(false);

      // Warm off-white canvas needs black text
      expect(getContrastColor('#FAF9F6')).toBe('#000000');
      expect(isLightColor('#FAF9F6')).toBe(true);

      // Bright yellow needs black text
      expect(getContrastColor('#FFEB3B')).toBe('#000000');
      expect(isLightColor('#FFEB3B')).toBe(true);
    });
  });
});
