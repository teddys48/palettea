import type {
  Palette,
  PaletteSortOption,
  CreatePaletteInput,
  UpdatePaletteInput,
} from '../types/palette';
import type {
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
} from '../types/collection';
import {
  loadPalettesFromStorage,
  savePalettesToStorage,
  loadCollectionsFromStorage,
  saveCollectionsToStorage,
  generateUniqueId,
} from '../services/storage-service';
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
} from '../services/palette-service';

export interface ToastNotification {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

export class PaletteStore {
  palettes = $state<Palette[]>([]);
  collections = $state<Collection[]>([]);
  searchQuery = $state<string>('');
  selectedFilter = $state<string>('all'); // 'all' | 'unassigned' | collectionId
  sortBy = $state<PaletteSortOption>('updated-desc');
  toast = $state<ToastNotification | null>(null);
  storageError = $state<string | null>(null);

  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.init();
  }

  /**
   * Initializes state from LocalStorage.
   */
  init(storage?: Storage): void {
    const collectionsRes = loadCollectionsFromStorage(storage);
    if (!collectionsRes.success && collectionsRes.error) {
      this.storageError = collectionsRes.error;
    }
    this.collections = collectionsRes.data;

    const palettesRes = loadPalettesFromStorage(storage);
    if (!palettesRes.success && palettesRes.error) {
      this.storageError = palettesRes.error;
    }
    this.palettes = palettesRes.data;
  }

  // Derived filtered & sorted palettes
  filteredPalettes = $derived.by(() => {
    return filterAndSortPalettes({
      palettes: this.palettes,
      collections: this.collections,
      filter: this.selectedFilter,
      searchQuery: this.searchQuery,
      sortBy: this.sortBy,
    });
  });

  // Derived collection counts
  collectionStats = $derived.by(() => {
    return calculateCollectionStats(this.palettes);
  });

  /**
   * Shows a transient toast message.
   */
  showToast(text: string, type: 'success' | 'error' | 'info' = 'success'): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toast = { id: generateUniqueId('toast'), text, type };
    this.toastTimeout = setTimeout(() => {
      this.toast = null;
    }, 3000);
  }

  clearToast(): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toast = null;
  }

  // --- PALETTE ACTIONS ---

  createPalette(input: CreatePaletteInput): { success: boolean; palette?: Palette; error?: string } {
    const res = createPaletteEntity(input, this.palettes);
    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    const newPalette = res.data;
    this.palettes = [newPalette, ...this.palettes];

    const saveRes = savePalettesToStorage(this.palettes);
    if (!saveRes.success) {
      this.storageError = saveRes.error;
      this.showToast(saveRes.error || 'Failed to save palette to storage.', 'error');
      return { success: false, error: saveRes.error || 'Failed to persist palette.' };
    }

    this.showToast(`Saved palette "${newPalette.name}"!`, 'success');
    return { success: true, palette: newPalette };
  }

  updatePalette(id: string, updates: UpdatePaletteInput): { success: boolean; error?: string } {
    const index = this.palettes.findIndex((p) => p.id === id);
    if (index === -1) {
      return { success: false, error: 'Palette not found.' };
    }

    const target = this.palettes[index]!;
    const res = updatePaletteEntity(target, updates);
    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    const next = [...this.palettes];
    next[index] = res.data;
    this.palettes = next;

    const saveRes = savePalettesToStorage(this.palettes);
    if (!saveRes.success) {
      this.storageError = saveRes.error;
      this.showToast(saveRes.error || 'Failed to save changes.', 'error');
      return { success: false, error: saveRes.error || 'Failed to persist update.' };
    }

    this.showToast(`Updated palette "${res.data.name}".`, 'success');
    return { success: true };
  }

  deletePalette(id: string): { success: boolean; error?: string } {
    const target = this.palettes.find((p) => p.id === id);
    if (!target) {
      return { success: false, error: 'Palette not found.' };
    }

    this.palettes = this.palettes.filter((p) => p.id !== id);
    const saveRes = savePalettesToStorage(this.palettes);
    if (!saveRes.success) {
      this.storageError = saveRes.error;
      this.showToast(saveRes.error || 'Failed to update storage.', 'error');
      return { success: false, error: saveRes.error || 'Failed to save deletion.' };
    }

    this.showToast(`Deleted palette "${target.name}".`, 'info');
    return { success: true };
  }

  addColorToPalette(paletteId: string, hex: string, name?: string): { success: boolean; error?: string } {
    const target = this.palettes.find((p) => p.id === paletteId);
    if (!target) return { success: false, error: 'Palette not found.' };

    const res = addColorToPaletteEntity(target, hex, name);
    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return this.updatePalette(paletteId, {
      colors: res.data.colors,
    });
  }

  removeColorFromPalette(paletteId: string, colorId: string): { success: boolean; error?: string } {
    const target = this.palettes.find((p) => p.id === paletteId);
    if (!target) return { success: false, error: 'Palette not found.' };

    const res = removeColorFromPaletteEntity(target, colorId);
    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return this.updatePalette(paletteId, {
      colors: res.data.colors,
    });
  }

  reorderPaletteColors(paletteId: string, fromIndex: number, toIndex: number): { success: boolean; error?: string } {
    const target = this.palettes.find((p) => p.id === paletteId);
    if (!target) return { success: false, error: 'Palette not found.' };

    const res = reorderPaletteColorsEntity(target, fromIndex, toIndex);
    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return this.updatePalette(paletteId, {
      colors: res.data.colors,
    });
  }

  // --- COLLECTION ACTIONS ---

  createCollection(input: CreateCollectionInput): { success: boolean; collection?: Collection; error?: string } {
    const res = createCollectionEntity(input);
    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    const newCollection = res.data;
    this.collections = [...this.collections, newCollection];

    const saveRes = saveCollectionsToStorage(this.collections);
    if (!saveRes.success) {
      this.storageError = saveRes.error;
      this.showToast(saveRes.error || 'Failed to save collection.', 'error');
      return { success: false, error: saveRes.error || 'Failed to persist collection.' };
    }

    this.showToast(`Collection "${newCollection.name}" created.`, 'success');
    return { success: true, collection: newCollection };
  }

  updateCollection(id: string, updates: UpdateCollectionInput): { success: boolean; error?: string } {
    const index = this.collections.findIndex((c) => c.id === id);
    if (index === -1) {
      return { success: false, error: 'Collection not found.' };
    }

    const target = this.collections[index]!;
    const res = updateCollectionEntity(target, updates);
    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    const next = [...this.collections];
    next[index] = res.data;
    this.collections = next;

    const saveRes = saveCollectionsToStorage(this.collections);
    if (!saveRes.success) {
      this.storageError = saveRes.error;
      return { success: false, error: saveRes.error || 'Failed to persist collection update.' };
    }

    this.showToast(`Updated collection "${res.data.name}".`, 'success');
    return { success: true };
  }

  /**
   * Deleting a collection unassigns associated palettes without deleting them!
   */
  deleteCollection(id: string): { success: boolean; error?: string } {
    const target = this.collections.find((c) => c.id === id);
    if (!target) {
      return { success: false, error: 'Collection not found.' };
    }

    const { nextCollections, nextPalettes } = deleteCollectionSafely(
      id,
      this.collections,
      this.palettes
    );

    this.collections = nextCollections;
    this.palettes = nextPalettes;

    saveCollectionsToStorage(this.collections);
    savePalettesToStorage(this.palettes);

    if (this.selectedFilter === id) {
      this.selectedFilter = 'all';
    }

    this.showToast(`Collection "${target.name}" deleted. Linked palettes were unassigned.`, 'info');
    return { success: true };
  }

  movePaletteToCollection(paletteId: string, targetCollectionId?: string): { success: boolean; error?: string } {
    return this.updatePalette(paletteId, {
      collectionId: targetCollectionId,
    });
  }

  getCollectionById(id?: string): Collection | undefined {
    if (!id) return undefined;
    return this.collections.find((c) => c.id === id);
  }
}

export const paletteStore = new PaletteStore();
