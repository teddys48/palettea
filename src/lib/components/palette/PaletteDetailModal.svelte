<script lang="ts">
  import Copy from 'lucide-svelte/icons/copy';
  import Check from 'lucide-svelte/icons/check';
  import Plus from 'lucide-svelte/icons/plus';
  import Trash2 from 'lucide-svelte/icons/trash-2';
  import ArrowLeft from 'lucide-svelte/icons/arrow-left';
  import ArrowRight from 'lucide-svelte/icons/arrow-right';
  import Search from 'lucide-svelte/icons/search';
  import Eye from 'lucide-svelte/icons/eye';
  import ArrowRightLeft from 'lucide-svelte/icons/arrow-right-left';
  import AlertCircle from 'lucide-svelte/icons/alert-circle';
  import Modal from '../ui/Modal.svelte';
  import Button from '../ui/Button.svelte';
  import Badge from '../ui/Badge.svelte';
  import { copyToClipboard } from '../../utils/clipboard';
  import { formatHex, isValidHex, isLightColor } from '../../utils/color-utils';
  import { paletteStore } from '../../stores/palette-store.svelte';
  import type { Palette, PaletteColor } from '../../types/palette';

  interface Props {
    isOpen: boolean;
    palette: Palette | null;
    onclose: () => void;
    oninspectColor?: (cleanHex: string) => void;
    oncontrastColor?: (hex: string, role: 'fg' | 'bg') => void;
    onconvertColor?: (cleanHex: string) => void;
  }

  let {
    isOpen = false,
    palette,
    onclose,
    oninspectColor,
    oncontrastColor,
    onconvertColor,
  }: Props = $props();

  let name = $state('');
  let description = $state('');
  let collectionId = $state('');
  let colors = $state<PaletteColor[]>([]);
  let isEditing = $state(false);
  let errorMessage = $state<string | null>(null);

  // New color inputs
  let newColorHex = $state('#7C83FD');
  let newColorName = $state('');

  // Copy tracking per hex
  let copiedHex = $state<string | null>(null);
  let copyTimeout: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    if (isOpen && palette) {
      name = palette.name;
      description = palette.description || '';
      collectionId = palette.collectionId || '';
      colors = [...palette.colors];
      isEditing = false;
      errorMessage = null;
    }
  });

  async function handleCopy(hex: string) {
    const success = await copyToClipboard(hex);
    if (success) {
      copiedHex = hex;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        copiedHex = null;
      }, 2000);
    }
  }

  function handleMoveColor(fromIndex: number, toIndex: number) {
    if (fromIndex < 0 || fromIndex >= colors.length || toIndex < 0 || toIndex >= colors.length) return;
    const next = [...colors];
    const [moved] = next.splice(fromIndex, 1);
    if (!moved) return;
    next.splice(toIndex, 0, moved);
    colors = next.map((c, idx) => ({ ...c, position: idx }));
  }

  function handleAddColor() {
    errorMessage = null;
    if (!isValidHex(newColorHex)) {
      errorMessage = 'Please enter a valid 3-character or 6-character hex code.';
      return;
    }
    const formatted = formatHex(newColorHex);
    colors = [
      ...colors,
      {
        id: `col_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        hex: formatted,
        name: newColorName.trim() || undefined,
        position: colors.length,
      },
    ];
    newColorName = '';
  }

  function handleRemoveColor(id: string) {
    if (colors.length <= 1) {
      errorMessage = 'A palette must contain at least one color.';
      return;
    }
    colors = colors.filter((c) => c.id !== id).map((c, idx) => ({ ...c, position: idx }));
  }

  function handleSaveChanges() {
    if (!palette) return;
    errorMessage = null;

    if (!name.trim()) {
      errorMessage = 'Palette name cannot be empty.';
      return;
    }

    if (colors.length === 0) {
      errorMessage = 'A palette must have at least one color.';
      return;
    }

    const res = paletteStore.updatePalette(palette.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      collectionId: collectionId.trim() || undefined,
      colors,
    });

    if (res.success) {
      isEditing = false;
      paletteStore.showToast('Palette updated successfully!', 'success');
    } else {
      errorMessage = res.error || 'Failed to save changes.';
    }
  }

  function handleInspect(cleanHex: string) {
    if (oninspectColor) {
      oninspectColor(cleanHex);
      onclose();
    }
  }

  function handleContrast(hex: string, role: 'fg' | 'bg') {
    if (oncontrastColor) {
      oncontrastColor(hex, role);
      onclose();
    }
  }

  function handleConvert(cleanHex: string) {
    if (onconvertColor) {
      onconvertColor(cleanHex);
      onclose();
    }
  }
</script>

<Modal
  {isOpen}
  {onclose}
  title={isEditing ? 'Edit Palette' : (palette?.name || 'Palette Detail')}
  description={isEditing ? 'Modify palette name, colors, order, or collection.' : (palette?.description || 'View and inspect all colors in this palette.')}
  size="xl"
>
  {#snippet children()}
    <div class="space-y-6">
      {#if errorMessage}
        <div class="flex items-center gap-2 p-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-xs text-red-600 dark:text-red-400 font-mono">
          <AlertCircle class="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      {/if}

      <!-- Top info bar in View Mode -->
      {#if !isEditing}
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono text-muted-foreground">
              {colors.length} {colors.length === 1 ? 'color' : 'colors'}
            </span>
            <span class="text-muted-foreground">•</span>
            {#if palette?.collectionId}
              {@const col = paletteStore.getCollectionById(palette.collectionId)}
              <Badge variant="accent" size="sm">
                Collection: {col?.name || 'Assigned'}
              </Badge>
            {:else}
              <Badge variant="neutral" size="sm">
                Unassigned
              </Badge>
            {/if}
          </div>

          <Button variant="secondary" size="sm" onclick={() => (isEditing = true)}>
            Edit Palette
          </Button>
        </div>
      {:else}
        <!-- Edit metadata fields -->
        <div class="p-4 rounded-xl border border-border bg-background space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label for="detail-palette-name" class="block text-xs font-mono uppercase font-semibold text-foreground">
                Palette Name <span class="text-red-500">*</span>
              </label>
              <input
                id="detail-palette-name"
                type="text"
                bind:value={name}
                class="w-full px-3 py-1.5 rounded-lg border border-border bg-surface text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>

            <div class="space-y-1">
              <label for="detail-palette-collection" class="block text-xs font-mono uppercase font-semibold text-foreground">
                Collection
              </label>
              <select
                id="detail-palette-collection"
                bind:value={collectionId}
                class="w-full px-3 py-1.5 rounded-lg border border-border bg-surface text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <option value="">None (Unassigned)</option>
                {#each paletteStore.collections as c (c.id)}
                  <option value={c.id}>{c.name}</option>
                {/each}
              </select>
            </div>
          </div>

          <div class="space-y-1">
            <label for="detail-palette-desc" class="block text-xs font-mono uppercase font-semibold text-foreground">
              Description
            </label>
            <input
              id="detail-palette-desc"
              type="text"
              bind:value={description}
              placeholder="Context or notes about this palette..."
              class="w-full px-3 py-1.5 rounded-lg border border-border bg-surface text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
        </div>
      {/if}

      <!-- Swatches Preview Grid -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono uppercase font-bold tracking-wider text-foreground">
            Colors & Swatches
          </span>
          {#if isEditing}
            <span class="text-xs font-mono text-muted-foreground">Use arrows to reorder colors</span>
          {/if}
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {#each colors as color, idx (color.id || color.hex + '-' + idx)}
            {@const cleanHex = color.hex.replace(/^#/, '')}
            {@const isLight = isLightColor(color.hex)}
            <div class="rounded-xl border border-border bg-surface p-3 space-y-3 shadow-sm hover:shadow-neo transition-all">
              <!-- Swatch Display -->
              <div
                class="h-20 w-full rounded-lg border border-black/10 dark:border-white/10 p-2 flex flex-col justify-between shadow-inner"
                style="background-color: {color.hex};"
              >
                <div class="flex items-center justify-between">
                  <span
                    class="text-xs font-mono font-bold px-1.5 py-0.5 rounded backdrop-blur-xs bg-black/20 text-white"
                  >
                    #{idx + 1}
                  </span>

                  <!-- Quick Copy Hex Button -->
                  <button
                    type="button"
                    onclick={() => handleCopy(color.hex)}
                    aria-label="Copy {color.hex}"
                    class="p-1 rounded backdrop-blur-xs bg-black/20 hover:bg-black/40 text-white cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white transition-colors"
                  >
                    {#if copiedHex === color.hex}
                      <Check class="w-3.5 h-3.5 text-emerald-300" aria-hidden="true" />
                    {:else}
                      <Copy class="w-3.5 h-3.5" aria-hidden="true" />
                    {/if}
                  </button>
                </div>

                <div
                  class="text-xs font-mono font-bold tracking-wider"
                  style="color: {isLight ? '#000000' : '#FFFFFF'};"
                >
                  {color.hex}
                </div>
              </div>

              <!-- Color Details -->
              <div class="space-y-1">
                {#if isEditing}
                  <input
                    type="text"
                    bind:value={color.name}
                    placeholder="Color name"
                    class="w-full px-2 py-1 text-xs rounded border border-border bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                  />
                {:else}
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-bold text-foreground font-mono">{color.hex}</span>
                    <span class="text-muted-foreground truncate max-w-[120px]">{color.name || 'Unnamed'}</span>
                  </div>
                {/if}
              </div>

              <!-- Reorder / Remove Controls in Edit Mode -->
              {#if isEditing}
                <div class="flex items-center justify-between pt-2 border-t border-border">
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onclick={() => handleMoveColor(idx, idx - 1)}
                      title="Move left"
                      aria-label="Move color left"
                      class="p-1 rounded border border-border hover:bg-background text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowLeft class="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === colors.length - 1}
                      onclick={() => handleMoveColor(idx, idx + 1)}
                      title="Move right"
                      aria-label="Move color right"
                      class="p-1 rounded border border-border hover:bg-background text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowRight class="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={colors.length <= 1}
                    onclick={() => handleRemoveColor(color.id)}
                    title="Remove color"
                    aria-label="Remove this color"
                    class="p-1 rounded text-muted-foreground hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Trash2 class="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              {:else}
                <!-- Integration Action Buttons (Inspector, Contrast, Converter) -->
                <div class="pt-2 border-t border-border grid grid-cols-3 gap-1 text-xs font-mono">
                  <button
                    type="button"
                    onclick={() => handleInspect(cleanHex)}
                    class="py-1 px-1.5 rounded border border-border hover:border-border-strong hover:bg-background text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    title="Inspect in Color Inspector"
                  >
                    <Search class="w-3 h-3 text-accent" aria-hidden="true" />
                    <span>Inspect</span>
                  </button>

                  <button
                    type="button"
                    onclick={() => handleContrast(color.hex, 'fg')}
                    class="py-1 px-1.5 rounded border border-border hover:border-border-strong hover:bg-background text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    title="Use in Contrast Checker"
                  >
                    <Eye class="w-3 h-3 text-accent" aria-hidden="true" />
                    <span>Contrast</span>
                  </button>

                  <button
                    type="button"
                    onclick={() => handleConvert(cleanHex)}
                    class="py-1 px-1.5 rounded border border-border hover:border-border-strong hover:bg-background text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    title="Send to Color Converter"
                  >
                    <ArrowRightLeft class="w-3 h-3 text-accent" aria-hidden="true" />
                    <span>Convert</span>
                  </button>
                </div>
              {/if}
            </div>
          {/each}
        </div>

        <!-- Add Color in Edit Mode -->
        {#if isEditing}
          <div class="p-3 rounded-xl border border-dashed border-border bg-background flex flex-wrap items-center gap-2">
            <input
              type="color"
              bind:value={newColorHex}
              class="h-8 w-8 rounded border border-border cursor-pointer p-0.5"
              aria-label="Pick color"
            />
            <input
              type="text"
              bind:value={newColorHex}
              placeholder="#RRGGBB"
              maxlength="7"
              class="w-24 px-2 py-1 rounded border border-border bg-surface font-mono text-xs uppercase"
            />
            <input
              type="text"
              bind:value={newColorName}
              placeholder="Color name (optional)"
              class="flex-1 min-w-[120px] px-2 py-1 rounded border border-border bg-surface text-xs"
            />
            <Button variant="secondary" size="sm" onclick={handleAddColor}>
              <Plus class="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add Color</span>
            </Button>
          </div>
        {/if}
      </div>
    </div>
  {/snippet}

  {#snippet footer()}
    {#if isEditing}
      <Button variant="secondary" size="sm" onclick={() => (isEditing = false)}>
        Cancel Editing
      </Button>
      <Button variant="primary" size="sm" onclick={handleSaveChanges}>
        Save Changes
      </Button>
    {:else}
      <Button variant="secondary" size="sm" onclick={onclose}>
        Close
      </Button>
    {/if}
  {/snippet}
</Modal>
