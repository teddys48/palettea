import { describe, it, expect } from 'bun:test';
import {
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  hsvToRgb,
  rgbToCmyk,
  cmykToRgb,
  parseHexInput,
  parseRgbInput,
  parseHslInput,
  parseHsvInput,
  parseCmykInput,
  parseColorInput,
  convertAllFormats,
  convertColorInput,
} from './color-utils';

describe('color-converter engine', () => {
  describe('HEX conversions & parsing', () => {
    it('converts RGB to canonical #RRGGBB', () => {
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
      expect(rgbToHex(255, 255, 255)).toBe('#FFFFFF');
      expect(rgbToHex(255, 0, 0)).toBe('#FF0000');
      expect(rgbToHex(0, 255, 0)).toBe('#00FF00');
      expect(rgbToHex(0, 0, 255)).toBe('#0000FF');
      expect(rgbToHex(124, 131, 253)).toBe('#7C83FD');
    });

    it('parses valid 6-character hex with and without #', () => {
      const withHash = parseHexInput('#7C83FD');
      expect(withHash.success).toBe(true);
      if (withHash.success) {
        expect(withHash.rgb).toEqual({ r: 124, g: 131, b: 253 });
      }

      const withoutHash = parseHexInput('7C83FD');
      expect(withoutHash.success).toBe(true);
      if (withoutHash.success) {
        expect(withoutHash.rgb).toEqual({ r: 124, g: 131, b: 253 });
      }
    });

    it('parses lowercase hex correctly', () => {
      const res = parseHexInput('#ff00aa');
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.rgb).toEqual({ r: 255, g: 0, b: 170 });
      }
    });

    it('parses 3-character shorthand hex', () => {
      const res = parseHexInput('#FFF');
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.rgb).toEqual({ r: 255, g: 255, b: 255 });
      }

      const resNoHash = parseHexInput('000');
      expect(resNoHash.success).toBe(true);
      if (resNoHash.success) {
        expect(resNoHash.rgb).toEqual({ r: 0, g: 0, b: 0 });
      }
    });

    it('rejects invalid hex characters and lengths', () => {
      expect(parseHexInput('#GGGGGG').success).toBe(false);
      expect(parseHexInput('#12345').success).toBe(false);
      expect(parseHexInput('#1234567').success).toBe(false);
      expect(parseHexInput('').success).toBe(false);
      expect(parseHexInput('   ').success).toBe(false);
    });
  });

  describe('RGB conversions & parsing', () => {
    it('parses bare RGB channel values', () => {
      const res = parseRgbInput('124, 131, 253');
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.rgb).toEqual({ r: 124, g: 131, b: 253 });
      }

      const spaceRes = parseRgbInput('124 131 253');
      expect(spaceRes.success).toBe(true);
      if (spaceRes.success) {
        expect(spaceRes.rgb).toEqual({ r: 124, g: 131, b: 253 });
      }
    });

    it('parses CSS rgb(...) and rgba(...) syntax', () => {
      const res = parseRgbInput('rgb(124, 131, 253)');
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.rgb).toEqual({ r: 124, g: 131, b: 253 });
      }

      const spaceRes = parseRgbInput('rgb(0 255 0)');
      expect(spaceRes.success).toBe(true);
      if (spaceRes.success) {
        expect(spaceRes.rgb).toEqual({ r: 0, g: 255, b: 0 });
      }
    });

    it('handles decimal values by rounding to integer', () => {
      const res = parseRgbInput('123.6, 200.4, 50');
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.rgb).toEqual({ r: 124, g: 200, b: 50 });
      }
    });

    it('rejects RGB channels below 0 or above 255', () => {
      expect(parseRgbInput('-1, 100, 100').success).toBe(false);
      expect(parseRgbInput('256, 100, 100').success).toBe(false);
      expect(parseRgbInput('100, 300, 100').success).toBe(false);
      expect(parseRgbInput('100, 100, -10').success).toBe(false);
    });

    it('rejects invalid RGB text format', () => {
      expect(parseRgbInput('100, 200').success).toBe(false);
      expect(parseRgbInput('foo, bar, baz').success).toBe(false);
      expect(parseRgbInput('').success).toBe(false);
    });
  });

  describe('HSL & HSV conversions & parsing', () => {
    it('accurately converts primary colors to HSL and HSV', () => {
      // Red
      expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 });
      expect(rgbToHsv(255, 0, 0)).toEqual({ h: 0, s: 100, v: 100 });

      // Green
      expect(rgbToHsl(0, 255, 0)).toEqual({ h: 120, s: 100, l: 50 });
      expect(rgbToHsv(0, 255, 0)).toEqual({ h: 120, s: 100, v: 100 });

      // Blue
      expect(rgbToHsl(0, 0, 255)).toEqual({ h: 240, s: 100, l: 50 });
      expect(rgbToHsv(0, 0, 255)).toEqual({ h: 240, s: 100, v: 100 });
    });

    it('handles black, white, and grayscale correctly', () => {
      // Black
      expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 });
      expect(rgbToHsv(0, 0, 0)).toEqual({ h: 0, s: 0, v: 0 });

      // White
      expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 });
      expect(rgbToHsv(255, 255, 255)).toEqual({ h: 0, s: 0, v: 100 });

      // Grayscale 128
      expect(rgbToHsl(128, 128, 128)).toEqual({ h: 0, s: 0, l: 50 });
      expect(rgbToHsv(128, 128, 128)).toEqual({ h: 0, s: 0, v: 50 });
    });

    it('reverses HSL to RGB accurately', () => {
      expect(hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 });
      expect(hslToRgb(120, 100, 50)).toEqual({ r: 0, g: 255, b: 0 });
      expect(hslToRgb(240, 100, 50)).toEqual({ r: 0, g: 0, b: 255 });
      expect(hslToRgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 });
      expect(hslToRgb(0, 0, 100)).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('reverses HSV to RGB accurately', () => {
      expect(hsvToRgb(0, 100, 100)).toEqual({ r: 255, g: 0, b: 0 });
      expect(hsvToRgb(120, 100, 100)).toEqual({ r: 0, g: 255, b: 0 });
      expect(hsvToRgb(240, 100, 100)).toEqual({ r: 0, g: 0, b: 255 });
      expect(hsvToRgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 });
      expect(hsvToRgb(0, 0, 100)).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('handles hue boundary at 0° and 360°', () => {
      const at0 = hslToRgb(0, 100, 50);
      const at360 = hslToRgb(360, 100, 50);
      expect(at0).toEqual(at360);
      expect(at0).toEqual({ r: 255, g: 0, b: 0 });

      const hsvAt0 = hsvToRgb(0, 100, 100);
      const hsvAt360 = hsvToRgb(360, 100, 100);
      expect(hsvAt0).toEqual(hsvAt360);
      expect(hsvAt0).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('parses HSL input with % signs and css syntax', () => {
      const resCss = parseHslInput('hsl(237, 98%, 74%)');
      expect(resCss.success).toBe(true);
      if (resCss.success) {
        expect(resCss.rgb.r).toBeCloseTo(124, -1);
        expect(resCss.rgb.g).toBeCloseTo(131, -1);
        expect(resCss.rgb.b).toBeCloseTo(253, -1);
      }

      const resBare = parseHslInput('237, 98%, 74%');
      expect(resBare.success).toBe(true);

      const resDeg = parseHslInput('hsl(237deg, 98%, 74%)');
      expect(resDeg.success).toBe(true);
    });

    it('parses HSV input with css and bare syntax', () => {
      const resCss = parseHsvInput('hsv(237, 51%, 99%)');
      expect(resCss.success).toBe(true);
      if (resCss.success) {
        expect(resCss.rgb.r).toBeCloseTo(124, -1);
        expect(resCss.rgb.g).toBeCloseTo(131, -1);
        expect(resCss.rgb.b).toBeCloseTo(253, -1);
      }

      const resBare = parseHsvInput('237, 51%, 99%');
      expect(resBare.success).toBe(true);

      const resHsb = parseHsvInput('hsb(237, 51%, 99%)');
      expect(resHsb.success).toBe(true);
    });

    it('rejects out of range HSL/HSV inputs', () => {
      expect(parseHslInput('361, 50%, 50%').success).toBe(false);
      expect(parseHslInput('-5, 50%, 50%').success).toBe(false);
      expect(parseHslInput('180, 101%, 50%').success).toBe(false);
      expect(parseHslInput('180, 50%, 101%').success).toBe(false);

      expect(parseHsvInput('361, 50%, 50%').success).toBe(false);
      expect(parseHsvInput('180, 101%, 50%').success).toBe(false);
      expect(parseHsvInput('180, 50%, 105%').success).toBe(false);
    });
  });

  describe('CMYK conversions & parsing', () => {
    it('converts black and white correctly', () => {
      // Black
      expect(rgbToCmyk(0, 0, 0)).toEqual({ c: 0, m: 0, y: 0, k: 100 });
      expect(cmykToRgb(0, 0, 0, 100)).toEqual({ r: 0, g: 0, b: 0 });

      // White
      expect(rgbToCmyk(255, 255, 255)).toEqual({ c: 0, m: 0, y: 0, k: 0 });
      expect(cmykToRgb(0, 0, 0, 0)).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('converts pure cyan, magenta, and yellow correctly', () => {
      // Pure Cyan (#00FFFF)
      expect(rgbToCmyk(0, 255, 255)).toEqual({ c: 100, m: 0, y: 0, k: 0 });
      expect(cmykToRgb(100, 0, 0, 0)).toEqual({ r: 0, g: 255, b: 255 });

      // Pure Magenta (#FF00FF)
      expect(rgbToCmyk(255, 0, 255)).toEqual({ c: 0, m: 100, y: 0, k: 0 });
      expect(cmykToRgb(0, 100, 0, 0)).toEqual({ r: 255, g: 0, b: 255 });

      // Pure Yellow (#FFFF00)
      expect(rgbToCmyk(255, 255, 0)).toEqual({ c: 0, m: 0, y: 100, k: 0 });
      expect(cmykToRgb(0, 0, 100, 0)).toEqual({ r: 255, g: 255, b: 0 });
    });

    it('handles black channel 0% and 100%', () => {
      const k0 = cmykToRgb(0, 0, 0, 0);
      expect(k0).toEqual({ r: 255, g: 255, b: 255 });

      const k100 = cmykToRgb(0, 0, 0, 100);
      expect(k100).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('parses CMYK css and bare formats', () => {
      const resCss = parseCmykInput('cmyk(51%, 48%, 0%, 1%)');
      expect(resCss.success).toBe(true);
      if (resCss.success) {
        expect(resCss.rgb.r).toBeCloseTo(124, -1);
        expect(resCss.rgb.g).toBeCloseTo(131, -1);
        expect(resCss.rgb.b).toBeCloseTo(253, -1);
      }

      const resBare = parseCmykInput('51%, 48%, 0%, 1%');
      expect(resBare.success).toBe(true);

      const resSpaces = parseCmykInput('51 48 0 1');
      expect(resSpaces.success).toBe(true);
    });

    it('rejects out of range CMYK values', () => {
      expect(parseCmykInput('105%, 0%, 0%, 0%').success).toBe(false);
      expect(parseCmykInput('0%, -5%, 0%, 0%').success).toBe(false);
      expect(parseCmykInput('0%, 0%, 120%, 0%').success).toBe(false);
      expect(parseCmykInput('0%, 0%, 0%, 101%').success).toBe(false);
      expect(parseCmykInput('10%, 20%, 30%').success).toBe(false); // missing 4th channel
    });
  });

  describe('Full converter pipeline and consistency', () => {
    it('produces the exact expected representation for Palettea example #7C83FD', () => {
      const res = convertColorInput('hex', '#7C83FD');
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.hex.value).toBe('#7C83FD');
        expect(res.data.rgb.value).toBe('124, 131, 253');
        expect(res.data.rgb.css).toBe('rgb(124, 131, 253)');

        expect(res.data.hsl.channels.h).toBe(237);
        expect(res.data.hsl.channels.l).toBe(74);

        expect(res.data.hsv.channels.h).toBe(237);
        expect(res.data.hsv.channels.s).toBe(51);
        expect(res.data.hsv.channels.v).toBe(99);

        expect(res.data.cmyk.channels.c).toBe(51);
        expect(res.data.cmyk.channels.m).toBe(48);
        expect(res.data.cmyk.channels.y).toBe(0);
        expect(res.data.cmyk.channels.k).toBe(1);
      }
    });

    it('works directly with convertAllFormats', () => {
      const all = convertAllFormats({ r: 255, g: 0, b: 0 });
      expect(all.hex.value).toBe('#FF0000');
      expect(all.rgb.value).toBe('255, 0, 0');
      expect(all.hsl.value).toBe('0, 100%, 50%');
      expect(all.hsv.value).toBe('0, 100%, 100%');
      expect(all.cmyk.value).toBe('0%, 100%, 100%, 0%');
    });

    it('dispatches formats correctly through parseColorInput', () => {
      const hexParsed = parseColorInput('hex', '#4F46E5');
      expect(hexParsed.success).toBe(true);

      const rgbParsed = parseColorInput('rgb', '79, 70, 229');
      expect(rgbParsed.success).toBe(true);

      const hslParsed = parseColorInput('hsl', '243, 75%, 59%');
      expect(hslParsed.success).toBe(true);

      const hsvParsed = parseColorInput('hsv', '243, 69%, 90%');
      expect(hsvParsed.success).toBe(true);

      const cmykParsed = parseColorInput('cmyk', '66%, 69%, 0%, 10%');
      expect(cmykParsed.success).toBe(true);
    });

    it('maintains round-trip consistency across all formats', () => {
      const originalHex = '#4F46E5';
      const fromHex = convertColorInput('hex', originalHex);
      expect(fromHex.success).toBe(true);
      if (!fromHex.success) return;

      // Convert from RGB string back
      const fromRgb = convertColorInput('rgb', fromHex.data.rgb.value);
      expect(fromRgb.success).toBe(true);
      if (fromRgb.success) {
        expect(fromRgb.data.hex.value).toBe(originalHex);
      }

      // Convert from HSL string back
      const fromHsl = convertColorInput('hsl', fromHex.data.hsl.css);
      expect(fromHsl.success).toBe(true);
      if (fromHsl.success) {
        // Tolerating small rounding differences in intermediate sRGB mapping
        expect(fromHsl.data.rgb.channels.r).toBeCloseTo(79, -1);
        expect(fromHsl.data.rgb.channels.g).toBeCloseTo(70, -1);
        expect(fromHsl.data.rgb.channels.b).toBeCloseTo(229, -1);
      }

      // Convert from HSV string back
      const fromHsv = convertColorInput('hsv', fromHex.data.hsv.css);
      expect(fromHsv.success).toBe(true);
      if (fromHsv.success) {
        expect(fromHsv.data.rgb.channels.r).toBeCloseTo(79, -1);
        expect(fromHsv.data.rgb.channels.g).toBeCloseTo(70, -1);
        expect(fromHsv.data.rgb.channels.b).toBeCloseTo(229, -1);
      }

      // Convert from CMYK string back
      const fromCmyk = convertColorInput('cmyk', fromHex.data.cmyk.css);
      expect(fromCmyk.success).toBe(true);
      if (fromCmyk.success) {
        expect(fromCmyk.data.rgb.channels.r).toBeCloseTo(79, -1);
        expect(fromCmyk.data.rgb.channels.g).toBeCloseTo(70, -1);
        expect(fromCmyk.data.rgb.channels.b).toBeCloseTo(229, -1);
      }
    });

    it('returns informative error messages for all invalid formats', () => {
      expect(convertColorInput('hex', 'zzz').success).toBe(false);
      expect(convertColorInput('rgb', '999, 999, 999').success).toBe(false);
      expect(convertColorInput('hsl', '500, 100%, 50%').success).toBe(false);
      expect(convertColorInput('hsv', '100, 200%, 50%').success).toBe(false);
      expect(convertColorInput('cmyk', '200%, 0%, 0%, 0%').success).toBe(false);
    });
  });
});
