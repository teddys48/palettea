import { describe, it, expect } from 'bun:test';
import {
  createPaletteEntity,
  updatePaletteEntity,
  addColorToPaletteEntity,
  removeColorFromPaletteEntity,
  reorderPaletteColorsEntity,
  createCollectionEntity,
  updateCollectionEntity,
  deleteCollectionSafely,
  filterAndSortPalettes,
  calculateCollectionStats,
} from './palette-service';
import type { Palette } from '../types/palette';
import type { Collection } from '../types/collection';

describe('palette-service', () => {
  describe('createPaletteEntity', () => {
    it('creates a palette successfully with valid data', () => {
      const res = createPaletteEntity(
        {
          name: 'Sunset Glow',
          description: 'Warm evening tones',
          colors: [
            { hex: '#ff5722', name: 'Deep Orange' },
            { hex: '#ff9800', name: 'Amber' },
          ],
        },
        []
      );

      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.data?.name).toBe('Sunset Glow');
      expect(res.data?.colors.length).toBe(2);
      expect(res.data?.colors[0]?.hex).toBe('#FF5722');
      expect(res.data?.colors[1]?.hex).toBe('#FF9800');
    });

    it('rejects empty palette name', () => {
      const res = createPaletteEntity(
        {
          name: '   ',
          colors: [{ hex: '#112233' }],
        },
        []
      );
      expect(res.success).toBe(false);
      expect(res.error).toContain('name is required');
    });

    it('rejects empty colors list', () => {
      const res = createPaletteEntity(
        {
          name: 'Empty Palette',
          colors: [],
        },
        []
      );
      expect(res.success).toBe(false);
      expect(res.error).toContain('at least one color');
    });

    it('rejects invalid hex code', () => {
      const res = createPaletteEntity(
        {
          name: 'Bad Hex',
          colors: [{ hex: 'not-hex' }],
        },
        []
      );
      expect(res.success).toBe(false);
      expect(res.error).toContain('Invalid HEX code');
    });
  });

  describe('updatePaletteEntity', () => {
    const basePalette: Palette = {
      id: 'p1',
      name: 'Initial Name',
      colors: [{ id: 'c1', hex: '#111111', position: 0 }],
      createdAt: '2026-11-06T00:00:00.000Z',
      updatedAt: '2026-11-06T00:00:00.000Z',
    };

    it('updates palette name and description', () => {
      const res = updatePaletteEntity(basePalette, {
        name: 'New Name',
        description: 'New Description',
      });
      expect(res.success).toBe(true);
      expect(res.data?.name).toBe('New Name');
      expect(res.data?.description).toBe('New Description');
    });

    it('rejects empty name during update', () => {
      const res = updatePaletteEntity(basePalette, { name: '  ' });
      expect(res.success).toBe(false);
      expect(res.error).toContain('cannot be empty');
    });

    it('rejects empty colors list during update', () => {
      const res = updatePaletteEntity(basePalette, { colors: [] });
      expect(res.success).toBe(false);
      expect(res.error).toContain('at least one color');
    });
  });

  describe('addColorToPaletteEntity', () => {
    const basePalette: Palette = {
      id: 'p1',
      name: 'Base',
      colors: [{ id: 'c1', hex: '#111111', position: 0 }],
      createdAt: '2026-11-06T00:00:00.000Z',
      updatedAt: '2026-11-06T00:00:00.000Z',
    };

    it('appends a valid color with correct position', () => {
      const res = addColorToPaletteEntity(basePalette, '#222222', 'Secondary');
      expect(res.success).toBe(true);
      expect(res.data?.colors.length).toBe(2);
      expect(res.data?.colors[1]?.hex).toBe('#222222');
      expect(res.data?.colors[1]?.position).toBe(1);
    });

    it('rejects invalid hex color', () => {
      const res = addColorToPaletteEntity(basePalette, 'invalid-hex');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Invalid HEX code');
    });
  });

  describe('removeColorFromPaletteEntity', () => {
    const multiPalette: Palette = {
      id: 'p1',
      name: 'Multi',
      colors: [
        { id: 'c1', hex: '#111111', position: 0 },
        { id: 'c2', hex: '#222222', position: 1 },
      ],
      createdAt: '2026-11-06T00:00:00.000Z',
      updatedAt: '2026-11-06T00:00:00.000Z',
    };

    it('removes color and reindexes positions', () => {
      const res = removeColorFromPaletteEntity(multiPalette, 'c1');
      expect(res.success).toBe(true);
      expect(res.data?.colors.length).toBe(1);
      expect(res.data?.colors[0]?.id).toBe('c2');
      expect(res.data?.colors[0]?.position).toBe(0);
    });

    it('prevents removing color if palette has only one color', () => {
      const singlePalette: Palette = {
        id: 'p1',
        name: 'Single',
        colors: [{ id: 'c1', hex: '#111111', position: 0 }],
        createdAt: '2026-11-06T00:00:00.000Z',
        updatedAt: '2026-11-06T00:00:00.000Z',
      };
      const res = removeColorFromPaletteEntity(singlePalette, 'c1');
      expect(res.success).toBe(false);
      expect(res.error).toContain('at least one color');
    });
  });

  describe('reorderPaletteColorsEntity', () => {
    const palette: Palette = {
      id: 'p1',
      name: 'Order',
      colors: [
        { id: 'c1', hex: '#111111', position: 0 },
        { id: 'c2', hex: '#222222', position: 1 },
        { id: 'c3', hex: '#333333', position: 2 },
      ],
      createdAt: '2026-11-06T00:00:00.000Z',
      updatedAt: '2026-11-06T00:00:00.000Z',
    };

    it('reorders colors and updates positions', () => {
      // Move index 2 (#333333) to index 0
      const res = reorderPaletteColorsEntity(palette, 2, 0);
      expect(res.success).toBe(true);
      expect(res.data?.colors.map((c) => c.hex)).toEqual(['#333333', '#111111', '#222222']);
      expect(res.data?.colors[0]?.position).toBe(0);
      expect(res.data?.colors[1]?.position).toBe(1);
      expect(res.data?.colors[2]?.position).toBe(2);
    });

    it('rejects out of bounds indices', () => {
      expect(reorderPaletteColorsEntity(palette, -1, 1).success).toBe(false);
      expect(reorderPaletteColorsEntity(palette, 0, 5).success).toBe(false);
    });
  });

  describe('Collections Management', () => {
    it('creates collection with valid name', () => {
      const res = createCollectionEntity({ name: 'Web Branding' });
      expect(res.success).toBe(true);
      expect(res.data?.name).toBe('Web Branding');
    });

    it('rejects empty collection name', () => {
      const res = createCollectionEntity({ name: '  ' });
      expect(res.success).toBe(false);
      expect(res.error).toContain('name is required');
    });

    it('updates collection name and description', () => {
      const col: Collection = {
        id: 'c1',
        name: 'Old',
        createdAt: '2026-11-06T00:00:00.000Z',
        updatedAt: '2026-11-06T00:00:00.000Z',
      };
      const res = updateCollectionEntity(col, { name: 'Renamed', description: 'Updated info' });
      expect(res.success).toBe(true);
      expect(res.data?.name).toBe('Renamed');
      expect(res.data?.description).toBe('Updated info');
    });

    it('CRITICAL: deleteCollectionSafely unassigns palettes instead of deleting them', () => {
      const collections: Collection[] = [
        { id: 'col_marketing', name: 'Marketing', createdAt: '2026-11-06', updatedAt: '2026-11-06' },
        { id: 'col_other', name: 'Other', createdAt: '2026-11-06', updatedAt: '2026-11-06' },
      ];
      const palettes: Palette[] = [
        {
          id: 'p1',
          name: 'Promo Ad',
          colors: [{ id: 'c1', hex: '#AA0000', position: 0 }],
          collectionId: 'col_marketing',
          createdAt: '2026-11-06',
          updatedAt: '2026-11-06',
        },
        {
          id: 'p2',
          name: 'General',
          colors: [{ id: 'c2', hex: '#00AA00', position: 0 }],
          collectionId: 'col_other',
          createdAt: '2026-11-06',
          updatedAt: '2026-11-06',
        },
      ];

      const result = deleteCollectionSafely('col_marketing', collections, palettes);

      // Collection is removed
      expect(result.nextCollections.length).toBe(1);
      expect(result.nextCollections[0]?.id).toBe('col_other');

      // Palettes ARE ALL KEPT!
      expect(result.nextPalettes.length).toBe(2);
      expect(result.affectedPaletteCount).toBe(1);

      // p1 was unassigned
      const p1 = result.nextPalettes.find((p) => p.id === 'p1');
      expect(p1?.collectionId).toBeUndefined();

      // p2 remains assigned to col_other
      const p2 = result.nextPalettes.find((p) => p.id === 'p2');
      expect(p2?.collectionId).toBe('col_other');
    });
  });

  describe('filterAndSortPalettes', () => {
    const collections: Collection[] = [
      { id: 'col1', name: 'Corporate Identity', createdAt: '', updatedAt: '' },
    ];
    const palettes: Palette[] = [
      {
        id: 'p1',
        name: 'Alpha Coral',
        description: 'Vibrant sunset coral',
        colors: [{ id: 'c1', hex: '#FF7F50', name: 'Coral', position: 0 }],
        collectionId: 'col1',
        createdAt: '2026-11-01T00:00:00.000Z',
        updatedAt: '2026-11-03T00:00:00.000Z',
      },
      {
        id: 'p2',
        name: 'Beta Cyan',
        description: 'Cool ocean breeze',
        colors: [{ id: 'c2', hex: '#00FFFF', name: 'Cyan', position: 0 }],
        // unassigned
        createdAt: '2026-11-02T00:00:00.000Z',
        updatedAt: '2026-11-02T00:00:00.000Z',
      },
      {
        id: 'p3',
        name: 'Gamma Forest',
        description: 'Earthy pine tones',
        colors: [{ id: 'c3', hex: '#228B22', name: 'Forest Green', position: 0 }],
        collectionId: 'col1',
        createdAt: '2026-11-03T00:00:00.000Z',
        updatedAt: '2026-11-01T00:00:00.000Z',
      },
    ];

    it('filters by "all", "unassigned", and specific collectionId', () => {
      const all = filterAndSortPalettes({
        palettes,
        collections,
        filter: 'all',
        searchQuery: '',
        sortBy: 'name-asc',
      });
      expect(all.length).toBe(3);

      const unassigned = filterAndSortPalettes({
        palettes,
        collections,
        filter: 'unassigned',
        searchQuery: '',
        sortBy: 'name-asc',
      });
      expect(unassigned.length).toBe(1);
      expect(unassigned[0]?.name).toBe('Beta Cyan');

      const colFiltered = filterAndSortPalettes({
        palettes,
        collections,
        filter: 'col1',
        searchQuery: '',
        sortBy: 'name-asc',
      });
      expect(colFiltered.length).toBe(2);
    });

    it('searches by name, description, hex, and collection name', () => {
      // By name
      expect(
        filterAndSortPalettes({
          palettes,
          collections,
          filter: 'all',
          searchQuery: 'coral',
          sortBy: 'name-asc',
        }).length
      ).toBe(1);

      // By description
      expect(
        filterAndSortPalettes({
          palettes,
          collections,
          filter: 'all',
          searchQuery: 'ocean breeze',
          sortBy: 'name-asc',
        })[0]?.name
      ).toBe('Beta Cyan');

      // By hex (with and without #)
      expect(
        filterAndSortPalettes({
          palettes,
          collections,
          filter: 'all',
          searchQuery: '#00ffff',
          sortBy: 'name-asc',
        })[0]?.name
      ).toBe('Beta Cyan');

      expect(
        filterAndSortPalettes({
          palettes,
          collections,
          filter: 'all',
          searchQuery: '00FFFF',
          sortBy: 'name-asc',
        })[0]?.name
      ).toBe('Beta Cyan');

      // By collection name
      expect(
        filterAndSortPalettes({
          palettes,
          collections,
          filter: 'all',
          searchQuery: 'Corporate',
          sortBy: 'name-asc',
        }).length
      ).toBe(2);
    });

    it('sorts accurately by updated-desc, created-desc, name-asc, name-desc', () => {
      const byUpdated = filterAndSortPalettes({
        palettes,
        collections,
        filter: 'all',
        searchQuery: '',
        sortBy: 'updated-desc',
      });
      expect(byUpdated.map((p) => p.name)).toEqual(['Alpha Coral', 'Beta Cyan', 'Gamma Forest']);

      const byCreated = filterAndSortPalettes({
        palettes,
        collections,
        filter: 'all',
        searchQuery: '',
        sortBy: 'created-desc',
      });
      expect(byCreated.map((p) => p.name)).toEqual(['Gamma Forest', 'Beta Cyan', 'Alpha Coral']);

      const byNameAsc = filterAndSortPalettes({
        palettes,
        collections,
        filter: 'all',
        searchQuery: '',
        sortBy: 'name-asc',
      });
      expect(byNameAsc.map((p) => p.name)).toEqual(['Alpha Coral', 'Beta Cyan', 'Gamma Forest']);

      const byNameDesc = filterAndSortPalettes({
        palettes,
        collections,
        filter: 'all',
        searchQuery: '',
        sortBy: 'name-desc',
      });
      expect(byNameDesc.map((p) => p.name)).toEqual(['Gamma Forest', 'Beta Cyan', 'Alpha Coral']);
    });
  });

  describe('calculateCollectionStats', () => {
    it('accurately tallies total, unassigned, and per-collection counts', () => {
      const palettes: Palette[] = [
        {
          id: 'p1',
          name: '1',
          colors: [{ id: 'c1', hex: '#111', position: 0 }],
          collectionId: 'colA',
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'p2',
          name: '2',
          colors: [{ id: 'c2', hex: '#222', position: 0 }],
          collectionId: 'colA',
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'p3',
          name: '3',
          colors: [{ id: 'c3', hex: '#333', position: 0 }],
          createdAt: '',
          updatedAt: '',
        },
      ];

      const stats = calculateCollectionStats(palettes);
      expect(stats.total).toBe(3);
      expect(stats.unassigned).toBe(1);
      expect(stats.byCollection['colA']).toBe(2);
    });
  });
});
