import type {
  Palette,
  PaletteColor,
  PaletteSortOption,
  CreatePaletteInput,
  UpdatePaletteInput,
} from '../types/palette';
import type {
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
} from '../types/collection';
import { generateUniqueId } from './storage-service';
import { formatHex, isValidHex } from '../utils/color-utils';

export interface PaletteOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Creates a new palette object after validating inputs.
 */
export function createPaletteEntity(
  input: CreatePaletteInput,
  _existingPalettes?: Palette[]
): PaletteOperationResult<Palette> {
  const name = input.name?.trim();
  if (!name) {
    return { success: false, error: 'Palette name is required.' };
  }

  if (!input.colors || input.colors.length === 0) {
    return { success: false, error: 'A palette must contain at least one color.' };
  }

  const validatedColors: PaletteColor[] = [];
  for (let i = 0; i < input.colors.length; i++) {
    const item = input.colors[i];
    if (!item || !isValidHex(item.hex)) {
      return { success: false, error: `Invalid HEX code provided: "${item?.hex}".` };
    }
    validatedColors.push({
      id: generateUniqueId('col'),
      hex: formatHex(item.hex),
      name: item.name?.trim() || undefined,
      position: i,
    });
  }

  const now = new Date().toISOString();
  const newPalette: Palette = {
    id: generateUniqueId('pal'),
    name,
    description: input.description?.trim() || undefined,
    colors: validatedColors,
    collectionId: input.collectionId?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  return { success: true, data: newPalette };
}

/**
 * Updates an existing palette.
 */
export function updatePaletteEntity(
  target: Palette,
  updates: UpdatePaletteInput
): PaletteOperationResult<Palette> {
  let name = target.name;
  if (updates.name !== undefined) {
    const trimmed = updates.name.trim();
    if (!trimmed) {
      return { success: false, error: 'Palette name cannot be empty.' };
    }
    name = trimmed;
  }

  let colors = target.colors;
  if (updates.colors !== undefined) {
    if (updates.colors.length === 0) {
      return { success: false, error: 'A palette must contain at least one color.' };
    }

    const validList: PaletteColor[] = [];
    for (let i = 0; i < updates.colors.length; i++) {
      const item = updates.colors[i];
      if (!item || !isValidHex(item.hex)) {
        return { success: false, error: `Invalid HEX code: "${item?.hex}".` };
      }
      validList.push({
        id: item.id || generateUniqueId('col'),
        hex: formatHex(item.hex),
        name: item.name?.trim() || undefined,
        position: i,
      });
    }
    colors = validList;
  }

  const updated: Palette = {
    ...target,
    name,
    description: updates.description !== undefined ? updates.description.trim() || undefined : target.description,
    colors,
    collectionId: updates.collectionId !== undefined ? updates.collectionId.trim() || undefined : target.collectionId,
    updatedAt: new Date().toISOString(),
  };

  return { success: true, data: updated };
}

/**
 * Appends a color to a palette.
 */
export function addColorToPaletteEntity(
  target: Palette,
  hex: string,
  name?: string
): PaletteOperationResult<Palette> {
  if (!isValidHex(hex)) {
    return { success: false, error: 'Invalid HEX code.' };
  }

  const newColor: PaletteColor = {
    id: generateUniqueId('col'),
    hex: formatHex(hex),
    name: name?.trim() || undefined,
    position: target.colors.length,
  };

  return updatePaletteEntity(target, {
    colors: [...target.colors, newColor],
  });
}

/**
 * Removes a color from a palette while protecting the minimum-one-color invariant.
 */
export function removeColorFromPaletteEntity(
  target: Palette,
  colorId: string
): PaletteOperationResult<Palette> {
  if (target.colors.length <= 1) {
    return { success: false, error: 'Cannot remove color. A palette must have at least one color.' };
  }

  const colorIndex = target.colors.findIndex((c) => c.id === colorId);
  if (colorIndex === -1) {
    return { success: false, error: 'Color not found in palette.' };
  }

  const updatedColors = target.colors
    .filter((c) => c.id !== colorId)
    .map((c, idx) => ({ ...c, position: idx }));

  return updatePaletteEntity(target, {
    colors: updatedColors,
  });
}

/**
 * Reorders colors in a palette.
 */
export function reorderPaletteColorsEntity(
  target: Palette,
  fromIndex: number,
  toIndex: number
): PaletteOperationResult<Palette> {
  if (
    fromIndex < 0 ||
    fromIndex >= target.colors.length ||
    toIndex < 0 ||
    toIndex >= target.colors.length
  ) {
    return { success: false, error: 'Invalid color reorder indices.' };
  }

  const copy = [...target.colors];
  const [moved] = copy.splice(fromIndex, 1);
  if (!moved) return { success: false, error: 'Color not found.' };
  copy.splice(toIndex, 0, moved);

  const reindexed = copy.map((c, idx) => ({ ...c, position: idx }));
  return updatePaletteEntity(target, {
    colors: reindexed,
  });
}

/**
 * Creates a collection entity.
 */
export function createCollectionEntity(
  input: CreateCollectionInput
): PaletteOperationResult<Collection> {
  const name = input.name?.trim();
  if (!name) {
    return { success: false, error: 'Collection name is required.' };
  }

  const now = new Date().toISOString();
  const col: Collection = {
    id: generateUniqueId('col_group'),
    name,
    description: input.description?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  return { success: true, data: col };
}

/**
 * Updates a collection entity.
 */
export function updateCollectionEntity(
  target: Collection,
  updates: UpdateCollectionInput
): PaletteOperationResult<Collection> {
  let name = target.name;
  if (updates.name !== undefined) {
    const trimmed = updates.name.trim();
    if (!trimmed) {
      return { success: false, error: 'Collection name cannot be empty.' };
    }
    name = trimmed;
  }

  const updated: Collection = {
    ...target,
    name,
    description: updates.description !== undefined ? updates.description.trim() || undefined : target.description,
    updatedAt: new Date().toISOString(),
  };

  return { success: true, data: updated };
}

/**
 * Deletes a collection, ensuring all palettes previously assigned to it are safely unassigned!
 */
export function deleteCollectionSafely(
  collectionId: string,
  collections: Collection[],
  palettes: Palette[]
): {
  nextCollections: Collection[];
  nextPalettes: Palette[];
  affectedPaletteCount: number;
} {
  const nextCollections = collections.filter((c) => c.id !== collectionId);
  let affectedPaletteCount = 0;
  const now = new Date().toISOString();

  const nextPalettes = palettes.map((p) => {
    if (p.collectionId === collectionId) {
      affectedPaletteCount++;
      return {
        ...p,
        collectionId: undefined,
        updatedAt: now,
      };
    }
    return p;
  });

  return { nextCollections, nextPalettes, affectedPaletteCount };
}

/**
 * Pure filter and sort utility for palettes.
 */
export function filterAndSortPalettes(params: {
  palettes: Palette[];
  collections: Collection[];
  filter: string; // 'all' | 'unassigned' | collectionId
  searchQuery: string;
  sortBy: PaletteSortOption;
}): Palette[] {
  const { palettes, collections, filter, searchQuery, sortBy } = params;
  let result = [...palettes];

  // 1. Filter by collection
  if (filter === 'unassigned') {
    result = result.filter((p) => !p.collectionId);
  } else if (filter !== 'all') {
    result = result.filter((p) => p.collectionId === filter);
  }

  // 2. Search query matching
  const query = searchQuery.trim().toLowerCase();
  if (query) {
    const cleanHexQuery = query.replace(/^#/, '');
    result = result.filter((palette) => {
      // Name match
      if (palette.name.toLowerCase().includes(query)) return true;
      // Description match
      if (palette.description && palette.description.toLowerCase().includes(query)) return true;
      // Associated collection name match
      if (palette.collectionId) {
        const col = collections.find((c) => c.id === palette.collectionId);
        if (col && col.name.toLowerCase().includes(query)) return true;
      }
      // Color HEX or name match
      return palette.colors.some((color) => {
        const rawHex = color.hex.toLowerCase();
        const cleanHex = rawHex.replace(/^#/, '');
        if (rawHex.includes(query) || cleanHex.includes(cleanHexQuery)) return true;
        if (color.name && color.name.toLowerCase().includes(query)) return true;
        return false;
      });
    });
  }

  // 3. Sorting
  switch (sortBy) {
    case 'updated-desc':
      result.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
      break;
    case 'created-desc':
      result.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      break;
    case 'name-asc':
      result.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
      break;
    case 'name-desc':
      result.sort((a, b) => b.name.localeCompare(a.name, undefined, { sensitivity: 'base' }));
      break;
  }

  return result;
}

/**
 * Calculates collection statistics.
 */
export function calculateCollectionStats(
  palettes: Palette[]
): { total: number; unassigned: number; byCollection: Record<string, number> } {
  const total = palettes.length;
  let unassigned = 0;
  const byCollection: Record<string, number> = {};

  for (const p of palettes) {
    if (!p.collectionId) {
      unassigned++;
    } else {
      byCollection[p.collectionId] = (byCollection[p.collectionId] || 0) + 1;
    }
  }

  return { total, unassigned, byCollection };
}
