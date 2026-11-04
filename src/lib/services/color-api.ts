import type { ColorApiResponse } from '../types/color';
import type { SchemeApiResponse, SchemeMode } from '../types/scheme';
import { normalizeHex } from '../utils/color-utils';

export class InvalidHexError extends Error {
  constructor(message = 'Invalid HEX color format. Expected a 3-character or 6-character hex code.') {
    super(message);
    this.name = 'InvalidHexError';
  }
}

export class ColorApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ColorApiError';
    this.status = status;
  }
}

const API_BASE_URL = 'https://www.thecolorapi.com';

// In-memory cache for single color lookups keyed by 6-character clean hex
const colorCache = new Map<string, ColorApiResponse>();

// In-memory cache for color schemes keyed by `${cleanHex}_${mode}_${count}`
const schemeCache = new Map<string, SchemeApiResponse>();

/**
 * Clears the in-memory caches (primarily for tests).
 */
export function clearColorCache(): void {
  colorCache.clear();
  schemeCache.clear();
}

/**
 * Fetches detailed color information from The Color API `/id` endpoint.
 *
 * @param hex Raw or normalized hex string (e.g. '#4F46E5', '4F46E5', '#FFF')
 * @param signal Optional AbortSignal to cancel in-flight requests
 * @returns Parsed ColorApiResponse
 */
export async function fetchColorInfo(
  hex: string,
  signal?: AbortSignal
): Promise<ColorApiResponse> {
  const cleanHex = normalizeHex(hex);

  if (!cleanHex) {
    throw new InvalidHexError(`"${hex}" is not a valid 3-digit or 6-digit hex color.`);
  }

  // Return cached result if available and not aborted
  if (colorCache.has(cleanHex)) {
    return colorCache.get(cleanHex)!;
  }

  const endpoint = `${API_BASE_URL}/id?hex=${encodeURIComponent(cleanHex)}&format=json`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Network request failed';
    throw new ColorApiError(`Unable to connect to The Color API: ${message}`, 0);
  }

  if (!response.ok) {
    throw new ColorApiError(
      `The Color API responded with HTTP ${response.status}: ${response.statusText}`,
      response.status
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ColorApiError('Invalid JSON response received from The Color API.', response.status);
  }

  // Validate that response contains expected fields and is not an invalid NaN payload
  const candidate = data as Partial<ColorApiResponse>;
  if (
    !candidate ||
    typeof candidate !== 'object' ||
    !candidate.hex?.value ||
    !candidate.rgb?.value ||
    candidate.rgb.value.includes('NaN') ||
    !candidate.name?.value
  ) {
    throw new ColorApiError('The Color API returned an unreadable or incomplete payload.', response.status);
  }

  const parsedData = candidate as ColorApiResponse;
  colorCache.set(cleanHex, parsedData);

  return parsedData;
}

/**
 * Fetches a harmonious color scheme from The Color API `/scheme` endpoint.
 *
 * @param hex Base/seed hex color
 * @param mode Color harmony mode ('complement', 'analogic', 'triad', 'analogic-complement', 'monochrome', 'quad')
 * @param count Number of colors to generate (clamped between 2 and 10, default 5)
 * @param signal Optional AbortSignal to cancel in-flight requests
 * @returns Parsed SchemeApiResponse
 */
export async function fetchColorScheme(
  hex: string,
  mode: SchemeMode = 'complement',
  count = 5,
  signal?: AbortSignal
): Promise<SchemeApiResponse> {
  const cleanHex = normalizeHex(hex);

  if (!cleanHex) {
    throw new InvalidHexError(`"${hex}" is not a valid 3-digit or 6-digit hex color.`);
  }

  // Normalize and clamp color count to a reasonable range
  const clampedCount = Math.max(2, Math.min(10, Math.round(count) || 5));
  const cacheKey = `${cleanHex}_${mode}_${clampedCount}`;

  if (schemeCache.has(cacheKey)) {
    return schemeCache.get(cacheKey)!;
  }

  const endpoint = `${API_BASE_URL}/scheme?hex=${encodeURIComponent(cleanHex)}&mode=${encodeURIComponent(mode)}&count=${clampedCount}&format=json`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Network request failed';
    throw new ColorApiError(`Unable to connect to The Color API scheme generator: ${message}`, 0);
  }

  if (!response.ok) {
    throw new ColorApiError(
      `The Color API scheme generator responded with HTTP ${response.status}: ${response.statusText}`,
      response.status
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ColorApiError('Invalid JSON response received from The Color API scheme generator.', response.status);
  }

  const candidate = data as Partial<SchemeApiResponse>;
  if (
    !candidate ||
    typeof candidate !== 'object' ||
    !Array.isArray(candidate.colors) ||
    candidate.colors.length === 0 ||
    !candidate.seed?.hex?.value
  ) {
    throw new ColorApiError('The Color API returned an unreadable or incomplete color scheme payload.', response.status);
  }

  const parsedScheme = candidate as SchemeApiResponse;
  schemeCache.set(cacheKey, parsedScheme);

  return parsedScheme;
}
