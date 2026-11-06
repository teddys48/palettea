import type { Palette, PaletteColor } from '../types/palette';
import type { Collection } from '../types/collection';
import { formatHex, isValidHex } from '../utils/color-utils';

export const STORAGE_KEYS = {
  PALETTES: 'palettea:palettes',
  COLLECTIONS: 'palettea:collections',
  VERSION: 'palettea:storage-version',
} as const;

export const CURRENT_STORAGE_VERSION = 1;

export interface StorageResult<T> {
  success: boolean;
  data: T;
  error: string | null;
}

export interface SaveResult {
  success: boolean;
  error: string | null;
}

/**
 * Generates a unique identifier.
 */
export function generateUniqueId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Checks whether localStorage is available and writable.
 */
export function isStorageAvailable(storage?: Storage): boolean {
  try {
    const s = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
    if (!s) return false;
    const testKey = '__palettea_probe__';
    s.setItem(testKey, testKey);
    s.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Seeds initial curated collections and palettes for a fresh user installation.
 */
export function getInitialSeedData(): { palettes: Palette[]; collections: Collection[] } {
  const brandCollectionId = 'col_brand_identity';
  const webCollectionId = 'col_web_design';
  const now = new Date().toISOString();

  const collections: Collection[] = [
    {
      id: brandCollectionId,
      name: 'Brand Identity',
      description: 'Official core brand assets, primary accents, and neutral foundations.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: webCollectionId,
      name: 'Web Interface',
      description: 'Accessible color pairings for UI components, cards, and canvas backgrounds.',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const palettes: Palette[] = [
    {
      id: 'pal_dawn_harmony',
      name: 'Dawn Harmony',
      description: 'Balanced aesthetic with Palettea brand indigo accents and obsidian neutral foundation.',
      collectionId: brandCollectionId,
      createdAt: now,
      updatedAt: now,
      colors: [
        { id: 'c1', hex: '#191919', name: 'Ink Obsidian', position: 0 },
        { id: 'c2', hex: '#4F46E5', name: 'Electric Iris', position: 1 },
        { id: 'c3', hex: '#93C5FD', name: 'Periwinkle Cloud', position: 2 },
        { id: 'c4', hex: '#38BDF8', name: 'Cyan Glow', position: 3 },
        { id: 'c5', hex: '#FAF9F6', name: 'Alabaster Canvas', position: 4 },
      ],
    },
    {
      id: 'pal_nordic_slate',
      name: 'Nordic Slate',
      description: 'Serene botanical teal and mint accents grounded by deep space slate.',
      collectionId: webCollectionId,
      createdAt: now,
      updatedAt: now,
      colors: [
        { id: 'c6', hex: '#0F172A', name: 'Deep Space', position: 0 },
        { id: 'c7', hex: '#0D9488', name: 'Teal Forest', position: 1 },
        { id: 'c8', hex: '#14B8A6', name: 'Mint Jade', position: 2 },
        { id: 'c9', hex: '#5EEAD4', name: 'Seafoam Breeze', position: 3 },
        { id: 'c10', hex: '#F0FDFA', name: 'Glacial Mist', position: 4 },
      ],
    },
    {
      id: 'pal_solar_terracotta',
      name: 'Solar Terracotta',
      description: 'Vibrant warm harmony with earthy balance and apricot highlights.',
      createdAt: now,
      updatedAt: now,
      colors: [
        { id: 'c11', hex: '#271B17', name: 'Roasted Cacao', position: 0 },
        { id: 'c12', hex: '#EA580C', name: 'Burnt Persimmon', position: 1 },
        { id: 'c13', hex: '#F97316', name: 'Tangerine Dusk', position: 2 },
        { id: 'c14', hex: '#FDBA74', name: 'Apricot Cream', position: 3 },
        { id: 'c15', hex: '#FFF7ED', name: 'Warm Linen', position: 4 },
      ],
    },
  ];

  return { palettes, collections };
}

/**
 * Validates and normalizes raw palette color objects.
 */
function validatePaletteColors(rawColors: unknown): PaletteColor[] | null {
  if (!Array.isArray(rawColors) || rawColors.length === 0) {
    return null;
  }

  const validColors: PaletteColor[] = [];
  for (let i = 0; i < rawColors.length; i++) {
    const item = rawColors[i];
    if (!item || typeof item !== 'object') return null;

    const rawHex = (item as { hex?: unknown }).hex;
    if (typeof rawHex !== 'string' || !isValidHex(rawHex)) {
      return null;
    }

    const normalizedHex = formatHex(rawHex);
    const id = typeof (item as { id?: unknown }).id === 'string' && (item as { id: string }).id
      ? (item as { id: string }).id
      : generateUniqueId('col');

    const name = typeof (item as { name?: unknown }).name === 'string'
      ? (item as { name: string }).name.trim()
      : undefined;

    const position = typeof (item as { position?: unknown }).position === 'number'
      ? (item as { position: number }).position
      : i;

    validColors.push({
      id,
      hex: normalizedHex,
      name: name || undefined,
      position,
    });
  }

  // Ensure positions are sorted 0..n
  validColors.sort((a, b) => a.position - b.position);
  validColors.forEach((c, idx) => {
    c.position = idx;
  });

  return validColors;
}

/**
 * Validates a single palette object.
 */
export function validatePalette(raw: unknown): Palette | null {
  if (!raw || typeof raw !== 'object') return null;

  const item = raw as Partial<Palette>;
  if (typeof item.id !== 'string' || !item.id.trim()) return null;
  if (typeof item.name !== 'string' || !item.name.trim()) return null;

  const colors = validatePaletteColors(item.colors);
  if (!colors || colors.length === 0) return null;

  const createdAt = typeof item.createdAt === 'string' && !isNaN(Date.parse(item.createdAt))
    ? item.createdAt
    : new Date().toISOString();

  const updatedAt = typeof item.updatedAt === 'string' && !isNaN(Date.parse(item.updatedAt))
    ? item.updatedAt
    : createdAt;

  const collectionId = typeof item.collectionId === 'string' && item.collectionId.trim()
    ? item.collectionId.trim()
    : undefined;

  return {
    id: item.id.trim(),
    name: item.name.trim(),
    description: typeof item.description === 'string' ? item.description.trim() : undefined,
    colors,
    collectionId,
    createdAt,
    updatedAt,
  };
}

/**
 * Validates a single collection object.
 */
export function validateCollection(raw: unknown): Collection | null {
  if (!raw || typeof raw !== 'object') return null;

  const item = raw as Partial<Collection>;
  if (typeof item.id !== 'string' || !item.id.trim()) return null;
  if (typeof item.name !== 'string' || !item.name.trim()) return null;

  const createdAt = typeof item.createdAt === 'string' && !isNaN(Date.parse(item.createdAt))
    ? item.createdAt
    : new Date().toISOString();

  const updatedAt = typeof item.updatedAt === 'string' && !isNaN(Date.parse(item.updatedAt))
    ? item.updatedAt
    : createdAt;

  return {
    id: item.id.trim(),
    name: item.name.trim(),
    description: typeof item.description === 'string' ? item.description.trim() : undefined,
    createdAt,
    updatedAt,
  };
}

/**
 * Loads palettes from local storage with comprehensive validation and error recovery.
 */
export function loadPalettesFromStorage(storage?: Storage): StorageResult<Palette[]> {
  const s = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (!s) {
    return {
      success: false,
      data: [],
      error: 'LocalStorage is not available in this environment.',
    };
  }

  try {
    const versionRaw = s.getItem(STORAGE_KEYS.VERSION);
    const palettesRaw = s.getItem(STORAGE_KEYS.PALETTES);

    // Initial first-time load: populate initial seed data
    if (versionRaw === null && palettesRaw === null) {
      const seed = getInitialSeedData();
      savePalettesToStorage(seed.palettes, s);
      saveCollectionsToStorage(seed.collections, s);
      s.setItem(STORAGE_KEYS.VERSION, String(CURRENT_STORAGE_VERSION));
      return {
        success: true,
        data: seed.palettes,
        error: null,
      };
    }

    if (!palettesRaw) {
      return { success: true, data: [], error: null };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(palettesRaw);
    } catch {
      return {
        success: false,
        data: [],
        error: 'Saved palettes data contains invalid JSON and could not be parsed.',
      };
    }

    if (!Array.isArray(parsed)) {
      return {
        success: false,
        data: [],
        error: 'Saved palettes data structure is corrupt (expected an array).',
      };
    }

    const validatedPalettes: Palette[] = [];
    for (const item of parsed) {
      const valid = validatePalette(item);
      if (valid) {
        validatedPalettes.push(valid);
      }
    }

    return {
      success: true,
      data: validatedPalettes,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      data: [],
      error: err instanceof Error ? err.message : 'Unknown error reading palettes from storage.',
    };
  }
}

/**
 * Saves palettes to local storage with quota detection.
 */
export function savePalettesToStorage(palettes: Palette[], storage?: Storage): SaveResult {
  const s = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (!s) {
    return {
      success: false,
      error: 'LocalStorage is not available.',
    };
  }

  try {
    const serialized = JSON.stringify(palettes);
    s.setItem(STORAGE_KEYS.PALETTES, serialized);
    s.setItem(STORAGE_KEYS.VERSION, String(CURRENT_STORAGE_VERSION));
    return { success: true, error: null };
  } catch (err) {
    let message = 'Failed to save palettes to LocalStorage.';
    if (err instanceof Error) {
      if (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        message = 'LocalStorage quota exceeded. Please remove some palettes to free up space.';
      } else {
        message = err.message;
      }
    }
    return { success: false, error: message };
  }
}

/**
 * Loads collections from local storage.
 */
export function loadCollectionsFromStorage(storage?: Storage): StorageResult<Collection[]> {
  const s = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (!s) {
    return {
      success: false,
      data: [],
      error: 'LocalStorage is not available in this environment.',
    };
  }

  try {
    const raw = s.getItem(STORAGE_KEYS.COLLECTIONS);
    if (!raw) {
      return { success: true, data: [], error: null };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {
        success: false,
        data: [],
        error: 'Saved collections data contains invalid JSON and could not be parsed.',
      };
    }

    if (!Array.isArray(parsed)) {
      return {
        success: false,
        data: [],
        error: 'Saved collections data structure is corrupt (expected an array).',
      };
    }

    const validated: Collection[] = [];
    for (const item of parsed) {
      const valid = validateCollection(item);
      if (valid) {
        validated.push(valid);
      }
    }

    return {
      success: true,
      data: validated,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      data: [],
      error: err instanceof Error ? err.message : 'Unknown error reading collections from storage.',
    };
  }
}

/**
 * Saves collections to local storage.
 */
export function saveCollectionsToStorage(collections: Collection[], storage?: Storage): SaveResult {
  const s = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (!s) {
    return {
      success: false,
      error: 'LocalStorage is not available.',
    };
  }

  try {
    const serialized = JSON.stringify(collections);
    s.setItem(STORAGE_KEYS.COLLECTIONS, serialized);
    s.setItem(STORAGE_KEYS.VERSION, String(CURRENT_STORAGE_VERSION));
    return { success: true, error: null };
  } catch (err) {
    let message = 'Failed to save collections to LocalStorage.';
    if (err instanceof Error) {
      if (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        message = 'LocalStorage quota exceeded.';
      } else {
        message = err.message;
      }
    }
    return { success: false, error: message };
  }
}
