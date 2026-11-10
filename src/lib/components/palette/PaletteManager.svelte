<script lang="ts">
  import Search from 'lucide-svelte/icons/search';
  import X from 'lucide-svelte/icons/x';
  import Plus from 'lucide-svelte/icons/plus';
  import Folder from 'lucide-svelte/icons/folder';
  import Layers from 'lucide-svelte/icons/layers';
  import AlertCircle from 'lucide-svelte/icons/alert-circle';
  import ArrowUpDown from 'lucide-svelte/icons/arrow-up-down';
  import Button from '../ui/Button.svelte';
  import Badge from '../ui/Badge.svelte';
  import ConfirmDialog from '../ui/ConfirmDialog.svelte';
  import PaletteCard from './PaletteCard.svelte';
  import PaletteDetailModal from './PaletteDetailModal.svelte';
  import SavePaletteDialog from './SavePaletteDialog.svelte';
  import CollectionManagerModal from '../collection/CollectionManagerModal.svelte';
  import { paletteStore } from '../../stores/palette-store.svelte';
  import type { Palette, PaletteSortOption } from '../../types/palette';

  interface Props {
    oninspectColor?: (cleanHex: string) => void;
    oncontrastColor?: (hex: string, role: 'fg' | 'bg') => void;
    onconvertColor?: (cleanHex: string) => void;
  }

  let {
    oninspectColor,
    oncontrastColor,
    onconvertColor,
  }: Props = $props();

  // Modals state
  let isSaveModalOpen = $state(false);
  let isCollectionsModalOpen = $state(false);
  let detailPalette = $state<Palette | null>(null);
  let isDetailModalOpen = $state(false);
  let paletteToDelete = $state<Palette | null>(null);

  function handleOpenDetail(p: Palette) {
    detailPalette = p;
    isDetailModalOpen = true;
  }

  function handleEditPalette(p: Palette) {
    detailPalette = p;
    isDetailModalOpen = true;
  }

  function handleDeletePalette(p: Palette) {
    paletteToDelete = p;
  }

  function handleConfirmDeletePalette() {
    if (paletteToDelete) {
      paletteStore.deletePalette(paletteToDelete.id);
      paletteToDelete = null;
    }
  }

  function handleClearSearch() {
    paletteStore.searchQuery = '';
  }

  function handleSortChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    paletteStore.sortBy = target.value as PaletteSortOption;
  }
</script>

<div class="space-y-6">
  <!-- Storage Quota or Parsing Error Warning -->
  {#if paletteStore.storageError}
    <div
      role="alert"
      class="flex items-center justify-between p-3.5 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-xs font-mono text-red-700 dark:text-red-300 shadow-sm"
    >
      <div class="flex items-center gap-2">
        <AlertCircle class="w-4 h-4 flex-shrink-0 text-red-500" aria-hidden="true" />
        <span>{paletteStore.storageError}</span>
      </div>
      <button
        type="button"
        onclick={() => (paletteStore.storageError = null)}
        class="text-red-600 dark:text-red-400 hover:underline cursor-pointer"
      >
        Dismiss
      </button>
    </div>
  {/if}

  <!-- Header Controls Bar -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
    <div>
      <div class="flex items-center gap-2">
        <h2 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Layers class="w-5 h-5 text-accent" aria-hidden="true" />
          <span>Palette Management & Collections</span>
        </h2>
        <Badge variant="accent" size="sm">Saved Palettes</Badge>
      </div>
      <p class="text-xs text-muted-foreground mt-1">
        Create, edit, organize, and inspect saved color palettes right in your browser.
      </p>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2 flex-wrap">
      <Button
        variant="secondary"
        size="sm"
        onclick={() => (isCollectionsModalOpen = true)}
        title="Manage color collections"
      >
        <Folder class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span>Collections ({paletteStore.collections.length})</span>
      </Button>

      <Button
        variant="primary"
        size="sm"
        onclick={() => (isSaveModalOpen = true)}
        title="Create a new custom palette"
      >
        <Plus class="w-3.5 h-3.5" aria-hidden="true" />
        <span>New Palette</span>
      </Button>
    </div>
  </div>

  <!-- Collections Filter Tabs & Navigation -->
  <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
    <!-- All Palettes Tab -->
    <button
      type="button"
      onclick={() => (paletteStore.selectedFilter = 'all')}
      class="flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-2 border {paletteStore.selectedFilter === 'all' ? 'bg-surface border-border-strong text-foreground shadow-neo' : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-surface'}"
    >
      <span>All Palettes</span>
      <span class="text-xs px-1.5 py-0.2 rounded-full {paletteStore.selectedFilter === 'all' ? 'bg-foreground text-background' : 'bg-zinc-200 dark:bg-zinc-800 text-muted-foreground'}">
        {paletteStore.collectionStats.total}
      </span>
    </button>

    <!-- Unassigned Tab -->
    <button
      type="button"
      onclick={() => (paletteStore.selectedFilter = 'unassigned')}
      class="flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-2 border {paletteStore.selectedFilter === 'unassigned' ? 'bg-surface border-border-strong text-foreground shadow-neo' : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-surface'}"
    >
      <span>Unassigned</span>
      <span class="text-xs px-1.5 py-0.2 rounded-full {paletteStore.selectedFilter === 'unassigned' ? 'bg-foreground text-background' : 'bg-zinc-200 dark:bg-zinc-800 text-muted-foreground'}">
        {paletteStore.collectionStats.unassigned}
      </span>
    </button>

    <!-- Per-Collection Tabs -->
    {#each paletteStore.collections as col (col.id)}
      {@const count = paletteStore.collectionStats.byCollection[col.id] || 0}
      <button
        type="button"
        onclick={() => (paletteStore.selectedFilter = col.id)}
        class="flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 border {paletteStore.selectedFilter === col.id ? 'bg-surface border-border-strong text-foreground shadow-neo' : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-surface'}"
      >
        <Folder class="w-3 h-3 text-accent" aria-hidden="true" />
        <span class="max-w-[120px] truncate">{col.name}</span>
        <span class="text-xs px-1.5 py-0.2 rounded-full {paletteStore.selectedFilter === col.id ? 'bg-foreground text-background' : 'bg-zinc-200 dark:bg-zinc-800 text-muted-foreground'}">
          {count}
        </span>
      </button>
    {/each}
  </div>

  <!-- Search & Sort Controls Toolbar -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-border bg-surface shadow-sm">
    <!-- Search Input -->
    <div class="relative flex-1">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
        <Search class="w-4 h-4" aria-hidden="true" />
      </div>
      <input
        type="text"
        bind:value={paletteStore.searchQuery}
        placeholder="Search by name, description, HEX code, color name..."
        class="w-full pl-9 pr-8 py-1.5 rounded-xl border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />
      {#if paletteStore.searchQuery}
        <button
          type="button"
          onclick={handleClearSearch}
          aria-label="Clear search"
          class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X class="w-4 h-4" aria-hidden="true" />
        </button>
      {/if}
    </div>

    <!-- Sort Dropdown -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <label for="palette-sort-select" class="text-xs font-mono text-muted-foreground flex items-center gap-1">
        <ArrowUpDown class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span>Sort:</span>
      </label>
      <select
        id="palette-sort-select"
        value={paletteStore.sortBy}
        onchange={handleSortChange}
        class="px-3 py-1.5 rounded-xl border border-border bg-background text-xs font-mono text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer shadow-xs"
      >
        <option value="updated-desc">Recently Updated</option>
        <option value="created-desc">Recently Created</option>
        <option value="name-asc">Name (A → Z)</option>
        <option value="name-desc">Name (Z → A)</option>
      </select>
    </div>
  </div>

  <!-- Main Palettes Grid / Empty States -->
  {#if paletteStore.filteredPalettes.length > 0}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-200">
      {#each paletteStore.filteredPalettes as palette (palette.id)}
        <PaletteCard
          {palette}
          onopenDetail={handleOpenDetail}
          onedit={handleEditPalette}
          ondelete={handleDeletePalette}
        />
      {/each}
    </div>
  {:else}
    <!-- Clean Empty States -->
    <div class="rounded-2xl border-2 border-dashed border-border bg-surface p-8 sm:p-12 text-center space-y-4">
      <div class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-muted-foreground">
        {#if paletteStore.searchQuery}
          <Search class="w-6 h-6" aria-hidden="true" />
        {:else if paletteStore.selectedFilter !== 'all'}
          <Folder class="w-6 h-6" aria-hidden="true" />
        {:else}
          <Layers class="w-6 h-6 text-accent" aria-hidden="true" />
        {/if}
      </div>

      <div class="space-y-1 max-w-md mx-auto">
        <h3 class="text-base font-bold text-foreground">
          {#if paletteStore.searchQuery}
            No matching palettes found
          {:else if paletteStore.selectedFilter !== 'all'}
            No palettes in this collection
          {:else}
            No saved palettes yet
          {/if}
        </h3>
        <p class="text-xs text-muted-foreground leading-relaxed">
          {#if paletteStore.searchQuery}
            No palettes match "{paletteStore.searchQuery}". Try searching with a different color HEX, name, or keyword.
          {:else if paletteStore.selectedFilter !== 'all'}
            This collection currently has no assigned palettes. You can move existing palettes here or create a new one.
          {:else}
            Start saving palettes from the Scheme Generator, inspect colors, or build your own custom palette from scratch.
          {/if}
        </p>
      </div>

      <div class="flex items-center justify-center gap-3 pt-2">
        {#if paletteStore.searchQuery}
          <Button variant="secondary" size="sm" onclick={handleClearSearch}>
            Clear Search
          </Button>
        {:else}
          <Button variant="primary" size="sm" onclick={() => (isSaveModalOpen = true)}>
            <Plus class="w-3.5 h-3.5" aria-hidden="true" />
            <span>Create Palette</span>
          </Button>
        {/if}
      </div>
    </div>
  {/if}
</div>

<!-- Save Palette Modal (Manual Creation) -->
<SavePaletteDialog
  isOpen={isSaveModalOpen}
  onclose={() => (isSaveModalOpen = false)}
  initialCollectionId={paletteStore.selectedFilter !== 'all' && paletteStore.selectedFilter !== 'unassigned' ? paletteStore.selectedFilter : ''}
/>

<!-- Manage Collections Modal -->
<CollectionManagerModal
  isOpen={isCollectionsModalOpen}
  onclose={() => (isCollectionsModalOpen = false)}
/>

<!-- Palette Detail & Editor Modal -->
<PaletteDetailModal
  isOpen={isDetailModalOpen}
  palette={detailPalette}
  onclose={() => {
    isDetailModalOpen = false;
    detailPalette = null;
  }}
  {oninspectColor}
  {oncontrastColor}
  {onconvertColor}
/>

<!-- Delete Palette Confirmation Dialog -->
<ConfirmDialog
  isOpen={paletteToDelete !== null}
  onclose={() => (paletteToDelete = null)}
  onconfirm={handleConfirmDeletePalette}
  title="Delete Palette?"
  message={`Are you sure you want to delete palette "${paletteToDelete?.name}"? This action cannot be undone.`}
  confirmLabel="Delete Palette"
/>

<!-- Floating Toast Feedback Notification -->
{#if paletteStore.toast}
  <div
    class="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    <div
      class="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border shadow-neo text-xs font-mono font-medium {paletteStore.toast.type === 'error' ? 'bg-red-50 dark:bg-red-950/80 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200' : 'bg-surface border-border-strong text-foreground'}"
    >
      <span>{paletteStore.toast.text}</span>
      <button
        type="button"
        onclick={() => paletteStore.clearToast()}
        class="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
        aria-label="Dismiss message"
      >
        <X class="w-3 h-3" aria-hidden="true" />
      </button>
    </div>
  </div>
{/if}
