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
export function hexToRgb(hexInput: string): { r: number; g: number; b: number } | null {
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
