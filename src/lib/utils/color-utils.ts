import type {
  SupportedColorFormat,
  RgbColor,
  HslColor,
  HsvColor,
  CmykColor,
  ConvertedColorResult,
  ParseColorResult,
  ConvertColorResult,
} from '../types/color';

/**
 * Normalizes a hex color string to a standard 6-character uppercase hex code without a leading hash.
 * Supports:
 * - 6-digit hex with or without '#' (e.g. '#4F46E5', '4F46E5')
 * - 3-digit shorthand hex with or without '#' (e.g. '#fff' -> 'FFFFFF', 'f0a' -> 'FF00AA')
 *
 * Returns null if the input is empty or not a valid hexadecimal color.
 */
export function normalizeHex(input: string | null | undefined): string | null {
  if (!input) return null;

  const trimmed = input.trim();
  const withoutHash = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;

  if (/^[0-9A-Fa-f]{3}$/.test(withoutHash)) {
    return withoutHash
      .split('')
      .map((char) => char + char)
      .join('')
      .toUpperCase();
  }

  if (/^[0-9A-Fa-f]{6}$/.test(withoutHash)) {
    return withoutHash.toUpperCase();
  }

  return null;
}

/**
 * Ensures a valid clean hex is formatted with a leading hash '#'.
 */
export function formatHex(cleanHex: string): string {
  const normalized = normalizeHex(cleanHex);
  return normalized ? `#${normalized}` : `#${cleanHex.replace(/^#/, '').toUpperCase()}`;
}

/**
 * Checks whether the given string is a valid 3-digit or 6-digit hex color code.
 */
export function isValidHex(input: string | null | undefined): boolean {
  return normalizeHex(input) !== null;
}

/**
 * Generates a random valid 6-character uppercase hex string (without '#').
 */
export function getRandomHex(): string {
  const hexChars = '0123456789ABCDEF';
  let hex = '';
  for (let i = 0; i < 6; i++) {
    hex += hexChars[Math.floor(Math.random() * 16)];
  }
  return hex;
}

/**
 * Parses a clean 6-digit hex into integer RGB components.
 */
export function hexToRgb(hexInput: string): RgbColor | null {
  const cleanHex = normalizeHex(hexInput);
  if (!cleanHex) return null;

  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Calculates WCAG relative luminance for given RGB values (0-255).
 * Luminance ranges from 0 (darkest black) to 1 (brightest white).
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const transformChannel = (c: number): number => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const R = transformChannel(r);
  const G = transformChannel(g);
  const B = transformChannel(b);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Returns either '#FFFFFF' or '#000000' to guarantee high readability and contrast.
 */
export function getContrastColor(hexInput: string): '#FFFFFF' | '#000000' {
  const rgb = hexToRgb(hexInput);
  if (!rgb) return '#000000';

  const luminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b);
  return luminance > 0.179 ? '#000000' : '#FFFFFF';
}

/**
 * Helper to determine if a color is considered light based on relative luminance.
 */
export function isLightColor(hexInput: string): boolean {
  return getContrastColor(hexInput) === '#000000';
}

/* =========================================================================
   Phase 4: Color Conversion Mathematical Engine
   ========================================================================= */

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Converts RGB channels (0-255) to canonical uppercase '#RRGGBB'.
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const rClamped = clamp(Math.round(r), 0, 255);
  const gClamped = clamp(Math.round(g), 0, 255);
  const bClamped = clamp(Math.round(b), 0, 255);

  const toHex = (c: number) => c.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(rClamped)}${toHex(gClamped)}${toHex(bClamped)}`;
}

/**
 * Converts RGB channels (0-255) to HSL values (h: 0-360, s: 0-100%, l: 0-100%).
 */
export function rgbToHsl(r: number, g: number, b: number): HslColor {
  const rNorm = clamp(r, 0, 255) / 255;
  const gNorm = clamp(g, 0, 255) / 255;
  const bNorm = clamp(b, 0, 255) / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) * 60;
    } else if (max === gNorm) {
      h = ((bNorm - rNorm) / delta + 2) * 60;
    } else {
      h = ((rNorm - gNorm) / delta + 4) * 60;
    }
  }

  const roundedH = Math.round(h) % 360;
  return {
    h: roundedH < 0 ? roundedH + 360 : roundedH,
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converts HSL values (h: 0-360, s: 0-100%, l: 0-100%) to RGB channels (0-255).
 */
export function hslToRgb(h: number, s: number, l: number): RgbColor {
  const hNorm = ((h % 360) + 360) % 360;
  const sNorm = clamp(s, 0, 100) / 100;
  const lNorm = clamp(l, 0, 100) / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((hNorm / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hNorm < 60) {
    r1 = c; g1 = x; b1 = 0;
  } else if (hNorm < 120) {
    r1 = x; g1 = c; b1 = 0;
  } else if (hNorm < 180) {
    r1 = 0; g1 = c; b1 = x;
  } else if (hNorm < 240) {
    r1 = 0; g1 = x; b1 = c;
  } else if (hNorm < 300) {
    r1 = x; g1 = 0; b1 = c;
  } else {
    r1 = c; g1 = 0; b1 = x;
  }

  return {
    r: clamp(Math.round((r1 + m) * 255), 0, 255),
    g: clamp(Math.round((g1 + m) * 255), 0, 255),
    b: clamp(Math.round((b1 + m) * 255), 0, 255),
  };
}

/**
 * Converts RGB channels (0-255) to HSV values (h: 0-360, s: 0-100%, v: 0-100%).
 */
export function rgbToHsv(r: number, g: number, b: number): HsvColor {
  const rNorm = clamp(r, 0, 255) / 255;
  const gNorm = clamp(g, 0, 255) / 255;
  const bNorm = clamp(b, 0, 255) / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  const v = max;
  const s = max === 0 ? 0 : delta / max;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) * 60;
    } else if (max === gNorm) {
      h = ((bNorm - rNorm) / delta + 2) * 60;
    } else {
      h = ((rNorm - gNorm) / delta + 4) * 60;
    }
  }

  const roundedH = Math.round(h) % 360;
  return {
    h: roundedH < 0 ? roundedH + 360 : roundedH,
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

/**
 * Converts HSV values (h: 0-360, s: 0-100%, v: 0-100%) to RGB channels (0-255).
 */
export function hsvToRgb(h: number, s: number, v: number): RgbColor {
  const hNorm = ((h % 360) + 360) % 360;
  const sNorm = clamp(s, 0, 100) / 100;
  const vNorm = clamp(v, 0, 100) / 100;

  const c = vNorm * sNorm;
  const x = c * (1 - Math.abs(((hNorm / 60) % 2) - 1));
  const m = vNorm - c;

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hNorm < 60) {
    r1 = c; g1 = x; b1 = 0;
  } else if (hNorm < 120) {
    r1 = x; g1 = c; b1 = 0;
  } else if (hNorm < 180) {
    r1 = 0; g1 = c; b1 = x;
  } else if (hNorm < 240) {
    r1 = 0; g1 = x; b1 = c;
  } else if (hNorm < 300) {
    r1 = x; g1 = 0; b1 = c;
  } else {
    r1 = c; g1 = 0; b1 = x;
  }

  return {
    r: clamp(Math.round((r1 + m) * 255), 0, 255),
    g: clamp(Math.round((g1 + m) * 255), 0, 255),
    b: clamp(Math.round((b1 + m) * 255), 0, 255),
  };
}

/**
 * Converts RGB channels (0-255) to standard CMYK values (0-100%).
 */
export function rgbToCmyk(r: number, g: number, b: number): CmykColor {
  const rNorm = clamp(r, 0, 255) / 255;
  const gNorm = clamp(g, 0, 255) / 255;
  const bNorm = clamp(b, 0, 255) / 255;

  const k = 1 - Math.max(rNorm, gNorm, bNorm);

  if (k >= 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = (1 - rNorm - k) / (1 - k);
  const m = (1 - gNorm - k) / (1 - k);
  const y = (1 - bNorm - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

/**
 * Converts standard CMYK values (0-100%) to RGB channels (0-255).
 */
export function cmykToRgb(c: number, m: number, y: number, k: number): RgbColor {
  const cNorm = clamp(c, 0, 100) / 100;
  const mNorm = clamp(m, 0, 100) / 100;
  const yNorm = clamp(y, 0, 100) / 100;
  const kNorm = clamp(k, 0, 100) / 100;

  return {
    r: clamp(Math.round(255 * (1 - cNorm) * (1 - kNorm)), 0, 255),
    g: clamp(Math.round(255 * (1 - mNorm) * (1 - kNorm)), 0, 255),
    b: clamp(Math.round(255 * (1 - yNorm) * (1 - kNorm)), 0, 255),
  };
}

/* =========================================================================
   Phase 4: Input Parsers & Normalizers
   ========================================================================= */

/**
 * Parses user input in HEX format (#RRGGBB, #RGB, RRGGBB, or RGB).
 */
export function parseHexInput(input: string): ParseColorResult {
  if (!input || !input.trim()) {
    return { success: false, error: 'Please enter a HEX color code.' };
  }

  const clean = normalizeHex(input);
  if (!clean) {
    return {
      success: false,
      error: 'Invalid HEX format. Enter 3 or 6 hex characters (e.g. #7C83FD or #FFF).',
    };
  }

  const rgb = hexToRgb(clean);
  if (!rgb) {
    return { success: false, error: 'Failed to parse HEX color.' };
  }

  return { success: true, rgb };
}

/**
 * Parses RGB input from CSS `rgb(r, g, b)` or bare numbers `r, g, b`.
 */
export function parseRgbInput(input: string): ParseColorResult {
  if (!input || !input.trim()) {
    return { success: false, error: 'Please enter an RGB color value.' };
  }

  let text = input.trim();
  const cssMatch = /^rgba?\s*\(\s*(.*?)\s*\)$/i.exec(text);
  if (cssMatch && cssMatch[1]) {
    text = cssMatch[1];
  }

  // Split by comma or whitespace
  const tokens = text.split(/[\s,]+/).filter(Boolean);
  if (tokens.length < 3) {
    return {
      success: false,
      error: 'RGB requires 3 values: Red, Green, Blue (e.g. 124, 131, 253 or rgb(124, 131, 253)).',
    };
  }

  const rNum = Number(tokens[0]);
  const gNum = Number(tokens[1]);
  const bNum = Number(tokens[2]);

  if (Number.isNaN(rNum) || Number.isNaN(gNum) || Number.isNaN(bNum)) {
    return {
      success: false,
      error: 'RGB channels must be numbers (e.g. 124, 131, 253).',
    };
  }

  if (rNum < 0 || rNum > 255 || gNum < 0 || gNum > 255 || bNum < 0 || bNum > 255) {
    return {
      success: false,
      error: 'RGB channels must be in the range 0 to 255.',
    };
  }

  return {
    success: true,
    rgb: {
      r: Math.round(rNum),
      g: Math.round(gNum),
      b: Math.round(bNum),
    },
  };
}

/**
 * Parses HSL input from CSS `hsl(h, s%, l%)` or bare numbers `h, s%, l%`.
 */
export function parseHslInput(input: string): ParseColorResult {
  if (!input || !input.trim()) {
    return { success: false, error: 'Please enter an HSL color value.' };
  }

  let text = input.trim();
  const cssMatch = /^hsla?\s*\(\s*(.*?)\s*\)$/i.exec(text);
  if (cssMatch && cssMatch[1]) {
    text = cssMatch[1];
  }

  const tokens = text.split(/[\s,]+/).filter(Boolean);
  if (tokens.length < 3) {
    return {
      success: false,
      error: 'HSL requires 3 values: Hue (0-360), Saturation (0-100%), Lightness (0-100%).',
    };
  }

  const hStr = tokens[0]!.replace(/deg$/i, '');
  const sStr = tokens[1]!.replace(/%$/, '');
  const lStr = tokens[2]!.replace(/%$/, '');

  const hNum = Number(hStr);
  const sNum = Number(sStr);
  const lNum = Number(lStr);

  if (Number.isNaN(hNum) || Number.isNaN(sNum) || Number.isNaN(lNum)) {
    return {
      success: false,
      error: 'HSL values must be valid numbers (e.g. 237, 98%, 74%).',
    };
  }

  if (hNum < 0 || hNum > 360) {
    return {
      success: false,
      error: 'HSL Hue must be between 0 and 360 degrees.',
    };
  }

  if (sNum < 0 || sNum > 100) {
    return {
      success: false,
      error: 'HSL Saturation must be between 0% and 100%.',
    };
  }

  if (lNum < 0 || lNum > 100) {
    return {
      success: false,
      error: 'HSL Lightness must be between 0% and 100%.',
    };
  }

  const rgb = hslToRgb(hNum, sNum, lNum);
  return { success: true, rgb };
}

/**
 * Parses HSV / HSB input from CSS `hsv(h, s%, v%)` or bare numbers `h, s%, v%`.
 */
export function parseHsvInput(input: string): ParseColorResult {
  if (!input || !input.trim()) {
    return { success: false, error: 'Please enter an HSV color value.' };
  }

  let text = input.trim();
  const cssMatch = /^(?:hsv|hsb)a?\s*\(\s*(.*?)\s*\)$/i.exec(text);
  if (cssMatch && cssMatch[1]) {
    text = cssMatch[1];
  }

  const tokens = text.split(/[\s,]+/).filter(Boolean);
  if (tokens.length < 3) {
    return {
      success: false,
      error: 'HSV requires 3 values: Hue (0-360), Saturation (0-100%), Value (0-100%).',
    };
  }

  const hStr = tokens[0]!.replace(/deg$/i, '');
  const sStr = tokens[1]!.replace(/%$/, '');
  const vStr = tokens[2]!.replace(/%$/, '');

  const hNum = Number(hStr);
  const sNum = Number(sStr);
  const vNum = Number(vStr);

  if (Number.isNaN(hNum) || Number.isNaN(sNum) || Number.isNaN(vNum)) {
    return {
      success: false,
      error: 'HSV values must be valid numbers (e.g. 237, 51%, 99%).',
    };
  }

  if (hNum < 0 || hNum > 360) {
    return {
      success: false,
      error: 'HSV Hue must be between 0 and 360 degrees.',
    };
  }

  if (sNum < 0 || sNum > 100) {
    return {
      success: false,
      error: 'HSV Saturation must be between 0% and 100%.',
    };
  }

  if (vNum < 0 || vNum > 100) {
    return {
      success: false,
      error: 'HSV Value/Brightness must be between 0% and 100%.',
    };
  }

  const rgb = hsvToRgb(hNum, sNum, vNum);
  return { success: true, rgb };
}

/**
 * Parses CMYK input from CSS `cmyk(c%, m%, y%, k%)` or bare numbers.
 */
export function parseCmykInput(input: string): ParseColorResult {
  if (!input || !input.trim()) {
    return { success: false, error: 'Please enter a CMYK color value.' };
  }

  let text = input.trim();
  const cssMatch = /^cmyka?\s*\(\s*(.*?)\s*\)$/i.exec(text);
  if (cssMatch && cssMatch[1]) {
    text = cssMatch[1];
  }

  const tokens = text.split(/[\s,]+/).filter(Boolean);
  if (tokens.length < 4) {
    return {
      success: false,
      error: 'CMYK requires 4 values: Cyan, Magenta, Yellow, Key/Black (0-100%).',
    };
  }

  const cStr = tokens[0]!.replace(/%$/, '');
  const mStr = tokens[1]!.replace(/%$/, '');
  const yStr = tokens[2]!.replace(/%$/, '');
  const kStr = tokens[3]!.replace(/%$/, '');

  const cNum = Number(cStr);
  const mNum = Number(mStr);
  const yNum = Number(yStr);
  const kNum = Number(kStr);

  if (
    Number.isNaN(cNum) ||
    Number.isNaN(mNum) ||
    Number.isNaN(yNum) ||
    Number.isNaN(kNum)
  ) {
    return {
      success: false,
      error: 'CMYK channels must be valid numbers (e.g. 51%, 48%, 0%, 1%).',
    };
  }

  if (
    cNum < 0 || cNum > 100 ||
    mNum < 0 || mNum > 100 ||
    yNum < 0 || yNum > 100 ||
    kNum < 0 || kNum > 100
  ) {
    return {
      success: false,
      error: 'CMYK channels must be between 0% and 100%.',
    };
  }

  const rgb = cmykToRgb(cNum, mNum, yNum, kNum);
  return { success: true, rgb };
}

/**
 * Dispatches parsing to the corresponding format parser.
 */
export function parseColorInput(
  format: SupportedColorFormat,
  input: string
): ParseColorResult {
  switch (format) {
    case 'hex':
      return parseHexInput(input);
    case 'rgb':
      return parseRgbInput(input);
    case 'hsl':
      return parseHslInput(input);
    case 'hsv':
      return parseHsvInput(input);
    case 'cmyk':
      return parseCmykInput(input);
    default:
      return { success: false, error: `Unsupported color format: ${format}` };
  }
}

/**
 * Builds the comprehensive ConvertedColorResult from canonical RGB integers (0-255).
 */
export function convertAllFormats(rgb: RgbColor): ConvertedColorResult {
  const cleanHex = rgbToHex(rgb.r, rgb.g, rgb.b).slice(1);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

  return {
    hex: {
      value: `#${cleanHex}`,
      raw: cleanHex,
    },
    rgb: {
      value: `${rgb.r}, ${rgb.g}, ${rgb.b}`,
      css: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      channels: rgb,
    },
    hsl: {
      value: `${hsl.h}, ${hsl.s}%, ${hsl.l}%`,
      css: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      channels: hsl,
    },
    hsv: {
      value: `${hsv.h}, ${hsv.s}%, ${hsv.v}%`,
      css: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
      channels: hsv,
    },
    cmyk: {
      value: `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`,
      css: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
      channels: cmyk,
    },
  };
}

/**
 * Full pipeline: validates and parses the input for the chosen format,
 * then converts it to all supported formats.
 */
export function convertColorInput(
  format: SupportedColorFormat,
  input: string
): ConvertColorResult {
  const parsed = parseColorInput(format, input);
  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  const result = convertAllFormats(parsed.rgb);
  return { success: true, data: result };
}
