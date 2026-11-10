<script lang="ts">
  import Plus from 'lucide-svelte/icons/plus';
  import Trash2 from 'lucide-svelte/icons/trash-2';
  import FolderPlus from 'lucide-svelte/icons/folder-plus';
  import AlertCircle from 'lucide-svelte/icons/alert-circle';
  import Modal from '../ui/Modal.svelte';
  import Button from '../ui/Button.svelte';
  import { paletteStore } from '../../stores/palette-store.svelte';
  import { formatHex, isValidHex } from '../../utils/color-utils';

  interface Props {
    isOpen: boolean;
    onclose: () => void;
    initialColors?: Array<{ hex: string; name?: string }>;
    initialName?: string;
    initialDescription?: string;
    initialCollectionId?: string;
  }

  let {
    isOpen = false,
    onclose,
    initialColors = [{ hex: '#4F46E5', name: 'Electric Iris' }],
    initialName = '',
    initialDescription = '',
    initialCollectionId = '',
  }: Props = $props();

  let name = $state('');
  let description = $state('');
  let collectionId = $state('');
  let colors = $state<Array<{ hex: string; name?: string }>>([]);
  let errorMessage = $state<string | null>(null);

  // New color input fields
  let newColorHex = $state('#7C83FD');
  let newColorName = $state('');

  // Quick inline collection creation toggle
  let isCreatingCollection = $state(false);
  let newCollectionName = $state('');

  $effect(() => {
    if (isOpen) {
      name = initialName || `Palette ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
      description = initialDescription || '';
      collectionId = initialCollectionId || '';
      colors = initialColors.length > 0
        ? initialColors.map((c) => ({ hex: formatHex(c.hex), name: c.name }))
        : [{ hex: '#4F46E5', name: 'Electric Iris' }];
      errorMessage = null;
      isCreatingCollection = false;
      newCollectionName = '';
    }
  });

  function handleAddColor() {
    errorMessage = null;
    if (!isValidHex(newColorHex)) {
      errorMessage = 'Please provide a valid 3-character or 6-character hex color.';
      return;
    }
    const formatted = formatHex(newColorHex);
    colors = [...colors, { hex: formatted, name: newColorName.trim() || undefined }];
    newColorName = '';
  }

  function handleRemoveColor(index: number) {
    if (colors.length <= 1) {
      errorMessage = 'A palette must contain at least one color.';
      return;
    }
    colors = colors.filter((_, idx) => idx !== index);
  }

  function handleCreateQuickCollection() {
    const trimmed = newCollectionName.trim();
    if (!trimmed) {
      errorMessage = 'Collection name cannot be empty.';
      return;
    }
    const res = paletteStore.createCollection({ name: trimmed });
    if (res.success && res.collection) {
      collectionId = res.collection.id;
      isCreatingCollection = false;
      newCollectionName = '';
      errorMessage = null;
    } else {
      errorMessage = res.error || 'Failed to create collection.';
    }
  }

  function handleSave() {
    errorMessage = null;
    if (!name.trim()) {
      errorMessage = 'Palette name is required.';
      return;
    }
    if (colors.length === 0) {
      errorMessage = 'A palette must have at least one color.';
      return;
    }

    const res = paletteStore.createPalette({
      name: name.trim(),
      description: description.trim() || undefined,
      collectionId: collectionId.trim() || undefined,
      colors,
    });

    if (res.success) {
      onclose();
    } else {
      errorMessage = res.error || 'Failed to save palette.';
    }
  }
</script>

<Modal
  {isOpen}
  {onclose}
  title="Save Palette"
  description="Save this color scheme to your local library and organize it into collections."
  size="lg"
>
  {#snippet children()}
    <div class="space-y-5">
      {#if errorMessage}
        <div class="flex items-center gap-2 p-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-xs text-red-600 dark:text-red-400 font-mono">
          <AlertCircle class="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      {/if}

      <!-- Palette Name -->
      <div class="space-y-1.5">
        <label for="palette-name-input" class="block text-xs font-mono uppercase tracking-wider font-semibold text-foreground">
          Palette Name <span class="text-red-500">*</span>
        </label>
        <input
          id="palette-name-input"
          type="text"
          bind:value={name}
          placeholder="e.g. Dawn Harmony, Nordic Forest"
          class="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm"
        />
      </div>

      <!-- Description -->
      <div class="space-y-1.5">
        <label for="palette-desc-input" class="block text-xs font-mono uppercase tracking-wider font-semibold text-foreground">
          Description (Optional)
        </label>
        <input
          id="palette-desc-input"
          type="text"
          bind:value={description}
          placeholder="Brief note or design context..."
          class="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm"
        />
      </div>

      <!-- Collection Selection -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label for="palette-collection-select" class="block text-xs font-mono uppercase tracking-wider font-semibold text-foreground">
            Collection
          </label>
          <button
            type="button"
            onclick={() => (isCreatingCollection = !isCreatingCollection)}
            class="text-xs font-mono text-accent hover:underline flex items-center gap-1 cursor-pointer focus-visible:outline-none"
          >
            <FolderPlus class="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isCreatingCollection ? 'Cancel new collection' : '+ New Collection'}</span>
          </button>
        </div>

        {#if isCreatingCollection}
          <div class="p-3 rounded-xl border border-accent/40 bg-accent/5 space-y-2">
            <span class="text-xs font-mono text-muted-foreground">Create a new collection on the fly:</span>
            <div class="flex gap-2">
              <input
                type="text"
                bind:value={newCollectionName}
                placeholder="Collection name (e.g. Brand 2026)"
                class="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
              <Button variant="primary" size="sm" onclick={handleCreateQuickCollection}>
                Create
              </Button>
            </div>
          </div>
        {:else}
          <select
            id="palette-collection-select"
            bind:value={collectionId}
            class="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm cursor-pointer"
          >
            <option value="">None (Unassigned)</option>
            {#each paletteStore.collections as col (col.id)}
              <option value={col.id}>{col.name}</option>
            {/each}
          </select>
        {/if}
      </div>

      <!-- Colors List & Add Controls -->
      <div class="space-y-2 pt-2 border-t border-border">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono uppercase tracking-wider font-semibold text-foreground">
            Palette Colors ({colors.length})
          </span>
          <span class="text-xs font-mono text-muted-foreground">Min 1 color</span>
        </div>

        <!-- Color Swatches Row -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {#each colors as color, idx (color.hex + '-' + idx)}
            <div class="group relative rounded-xl border border-border bg-surface p-2 flex items-center gap-2.5 shadow-sm">
              <div
                class="h-8 w-8 rounded-lg border border-black/10 flex-shrink-0 shadow-xs"
                style="background-color: {color.hex};"
              ></div>
              <div class="flex-1 min-w-0">
                <span class="block text-xs font-mono font-bold text-foreground truncate">{color.hex}</span>
                {#if color.name}
                  <span class="block text-xs text-muted-foreground truncate">{color.name}</span>
                {/if}
              </div>
              <button
                type="button"
                disabled={colors.length <= 1}
                onclick={() => handleRemoveColor(idx)}
                aria-label="Remove {color.hex}"
                class="p-1 rounded text-muted-foreground hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
              >
                <Trash2 class="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          {/each}
        </div>

        <!-- Add Color Form -->
        <div class="pt-3 flex flex-wrap items-center gap-2">
          <!-- Native Color Picker Synchronizer -->
          <div class="relative flex items-center">
            <input
              type="color"
              bind:value={newColorHex}
              class="h-9 w-9 rounded-lg border border-border cursor-pointer p-0.5 bg-background shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Select color with picker"
            />
          </div>

          <input
            type="text"
            bind:value={newColorHex}
            placeholder="#RRGGBB"
            maxlength="7"
            class="w-28 px-2.5 py-1.5 rounded-lg border border-border bg-background font-mono text-xs text-foreground uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-xs"
          />

          <input
            type="text"
            bind:value={newColorName}
            placeholder="Color name (optional)"
            class="flex-1 min-w-[140px] px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-xs"
          />

          <Button variant="secondary" size="sm" onclick={handleAddColor}>
            <Plus class="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add Color</span>
          </Button>
        </div>
      </div>
    </div>
  {/snippet}

  {#snippet footer()}
    <Button variant="secondary" size="sm" onclick={onclose}>
      Cancel
    </Button>
    <Button variant="primary" size="sm" onclick={handleSave}>
      Save Palette
    </Button>
  {/snippet}
</Modal>
