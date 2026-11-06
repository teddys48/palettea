import { describe, it, expect, beforeEach } from 'bun:test';
import {
  STORAGE_KEYS,
  CURRENT_STORAGE_VERSION,
  isStorageAvailable,
  generateUniqueId,
  getInitialSeedData,
  validatePalette,
  validateCollection,
  loadPalettesFromStorage,
  savePalettesToStorage,
  loadCollectionsFromStorage,
  saveCollectionsToStorage,
} from './storage-service';
import type { Palette } from '../types/palette';
import type { Collection } from '../types/collection';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  public throwOnSet = false;
  public throwQuota = false;

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    if (this.throwQuota) {
      const err = new Error('The quota has been exceeded.');
      err.name = 'QuotaExceededError';
      throw err;
    }
    if (this.throwOnSet) {
      throw new Error('Storage write denied.');
    }
    this.store.set(key, String(value));
  }
}

describe('storage-service', () => {
  let mockStorage: MemoryStorage;

  beforeEach(() => {
    mockStorage = new MemoryStorage();
  });

  describe('isStorageAvailable', () => {
    it('returns true when storage operates normally', () => {
      expect(isStorageAvailable(mockStorage)).toBe(true);
    });

    it('returns false when storage throws on setItem', () => {
      mockStorage.throwOnSet = true;
      expect(isStorageAvailable(mockStorage)).toBe(false);
    });

    it('returns false when storage is undefined', () => {
      expect(isStorageAvailable(undefined as unknown as Storage)).toBe(false);
    });
  });

  describe('generateUniqueId', () => {
    it('generates unique strings with prefix', () => {
      const id1 = generateUniqueId('test');
      const id2 = generateUniqueId('test');
      expect(id1).not.toBe(id2);
      expect(id1.startsWith('test_')).toBe(true);
    });
  });

  describe('validatePalette', () => {
    it('accepts valid palette structure', () => {
      const valid = validatePalette({
        id: 'p1',
        name: 'Ocean Dusk',
        colors: [
          { id: 'c1', hex: '#001122', position: 0 },
          { id: 'c2', hex: '#334455', name: 'Slate', position: 1 },
        ],
        createdAt: '2026-11-06T00:00:00.000Z',
        updatedAt: '2026-11-06T00:00:00.000Z',
      });
      expect(valid).not.toBeNull();
      expect(valid?.id).toBe('p1');
      expect(valid?.name).toBe('Ocean Dusk');
      expect(valid?.colors.length).toBe(2);
      expect(valid?.colors[0]?.hex).toBe('#001122');
    });

    it('rejects palette with missing id or name', () => {
      expect(validatePalette({ id: '', name: 'Test', colors: [{ hex: '#fff' }] })).toBeNull();
      expect(validatePalette({ id: 'p1', name: '   ', colors: [{ hex: '#fff' }] })).toBeNull();
    });

    it('rejects palette with zero colors or invalid hex', () => {
      expect(validatePalette({ id: 'p1', name: 'Empty', colors: [] })).toBeNull();
      expect(validatePalette({ id: 'p1', name: 'Invalid', colors: [{ hex: 'not-a-color' }] })).toBeNull();
    });

    it('normalizes 3-character hex to 6-character #RRGGBB', () => {
      const result = validatePalette({
        id: 'p1',
        name: 'Shorthand',
        colors: [{ hex: 'f0a' }],
      });
      expect(result?.colors[0]?.hex).toBe('#FF00AA');
    });
  });

  describe('validateCollection', () => {
    it('accepts valid collection', () => {
      const col = validateCollection({
        id: 'c1',
        name: 'Brand Assets',
        description: 'Core logos & palettes',
      });
      expect(col).not.toBeNull();
      expect(col?.id).toBe('c1');
      expect(col?.name).toBe('Brand Assets');
    });

    it('rejects collection with empty name or invalid types', () => {
      expect(validateCollection({ id: 'c1', name: '' })).toBeNull();
      expect(validateCollection(null)).toBeNull();
    });
  });

  describe('loadPalettesFromStorage & savePalettesToStorage', () => {
    it('seeds initial data on clean storage (version and palettes are null)', () => {
      const res = loadPalettesFromStorage(mockStorage);
      expect(res.success).toBe(true);
      expect(res.data.length).toBeGreaterThan(0);
      expect(mockStorage.getItem(STORAGE_KEYS.VERSION)).toBe(String(CURRENT_STORAGE_VERSION));
      expect(mockStorage.getItem(STORAGE_KEYS.PALETTES)).not.toBeNull();
    });

    it('returns empty array when version is set but palettes key is empty string', () => {
      mockStorage.setItem(STORAGE_KEYS.VERSION, '1');
      mockStorage.setItem(STORAGE_KEYS.PALETTES, '[]');
      const res = loadPalettesFromStorage(mockStorage);
      expect(res.success).toBe(true);
      expect(res.data).toEqual([]);
    });

    it('persists and reloads palettes accurately', () => {
      mockStorage.setItem(STORAGE_KEYS.VERSION, '1');
      const testPalette: Palette = {
        id: 'test_pal_1',
        name: 'Emerald Aurora',
        colors: [
          { id: 'c1', hex: '#10B981', position: 0 },
          { id: 'c2', hex: '#059669', position: 1 },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const saveRes = savePalettesToStorage([testPalette], mockStorage);
      expect(saveRes.success).toBe(true);

      const loadRes = loadPalettesFromStorage(mockStorage);
      expect(loadRes.success).toBe(true);
      expect(loadRes.data.length).toBe(1);
      expect(loadRes.data[0]?.id).toBe('test_pal_1');
      expect(loadRes.data[0]?.name).toBe('Emerald Aurora');
    });

    it('handles corrupted JSON without crashing and without wiping stored data', () => {
      mockStorage.setItem(STORAGE_KEYS.VERSION, '1');
      const corruptedJson = '{"broken": [unfinished json';
      mockStorage.setItem(STORAGE_KEYS.PALETTES, corruptedJson);

      const res = loadPalettesFromStorage(mockStorage);
      expect(res.success).toBe(false);
      expect(res.error).toContain('invalid JSON');
      // Verify storage was not wiped!
      expect(mockStorage.getItem(STORAGE_KEYS.PALETTES)).toBe(corruptedJson);
    });

    it('handles non-array stored data gracefully', () => {
      mockStorage.setItem(STORAGE_KEYS.VERSION, '1');
      mockStorage.setItem(STORAGE_KEYS.PALETTES, '{"some": "object"}');

      const res = loadPalettesFromStorage(mockStorage);
      expect(res.success).toBe(false);
      expect(res.error).toContain('expected an array');
    });

    it('filters out individual corrupted items while retaining valid palettes', () => {
      mockStorage.setItem(STORAGE_KEYS.VERSION, '1');
      const mixed = [
        { id: 'valid_1', name: 'Valid One', colors: [{ hex: '#112233' }] },
        { id: '', name: 'Broken item' }, // invalid: no colors and empty id
        { id: 'valid_2', name: 'Valid Two', colors: [{ hex: '#445566' }] },
      ];
      mockStorage.setItem(STORAGE_KEYS.PALETTES, JSON.stringify(mixed));

      const res = loadPalettesFromStorage(mockStorage);
      expect(res.success).toBe(true);
      expect(res.data.length).toBe(2);
      expect(res.data.map((p) => p.id)).toEqual(['valid_1', 'valid_2']);
    });

    it('reports QuotaExceededError clearly when saving', () => {
      mockStorage.throwQuota = true;
      const res = savePalettesToStorage(getInitialSeedData().palettes, mockStorage);
      expect(res.success).toBe(false);
      expect(res.error).toContain('quota exceeded');
    });
  });

  describe('loadCollectionsFromStorage & saveCollectionsToStorage', () => {
    it('persists and reloads collections', () => {
      const sampleCol: Collection = {
        id: 'col_sample',
        name: 'Sample Group',
        description: 'For testing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const saveRes = saveCollectionsToStorage([sampleCol], mockStorage);
      expect(saveRes.success).toBe(true);

      const loadRes = loadCollectionsFromStorage(mockStorage);
      expect(loadRes.success).toBe(true);
      expect(loadRes.data.length).toBe(1);
      expect(loadRes.data[0]?.name).toBe('Sample Group');
    });

    it('handles invalid JSON in collections key gracefully', () => {
      mockStorage.setItem(STORAGE_KEYS.COLLECTIONS, '{not json}');
      const res = loadCollectionsFromStorage(mockStorage);
      expect(res.success).toBe(false);
      expect(res.error).toContain('invalid JSON');
    });
  });
});
