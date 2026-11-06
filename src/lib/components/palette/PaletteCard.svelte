<script lang="ts">
  import Copy from 'lucide-svelte/icons/copy';
  import Check from 'lucide-svelte/icons/check';
  import Pencil from 'lucide-svelte/icons/pencil';
  import Trash2 from 'lucide-svelte/icons/trash-2';
  import Folder from 'lucide-svelte/icons/folder';
  import Calendar from 'lucide-svelte/icons/calendar';
  import Badge from '../ui/Badge.svelte';
  import { copyToClipboard } from '../../utils/clipboard';
  import { paletteStore } from '../../stores/palette-store.svelte';
  import { isLightColor } from '../../utils/color-utils';
  import type { Palette } from '../../types/palette';

  interface Props {
    palette: Palette;
    onopenDetail: (palette: Palette) => void;
    onedit: (palette: Palette) => void;
    ondelete: (palette: Palette) => void;
  }

  let { palette, onopenDetail, onedit, ondelete }: Props = $props();

  let isCopied = $state(false);
  let copyTimeout: ReturnType<typeof setTimeout> | null = null;

  const collection = $derived(
    palette.collectionId ? paletteStore.getCollectionById(palette.collectionId) : undefined
  );

  const formattedDate = $derived.by(() => {
    try {
      const d = new Date(palette.updatedAt || palette.createdAt);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  });

  async function handleCopyHexes(e: MouseEvent) {
    e.stopPropagation();
    const hexList = palette.colors.map((c) => c.hex).join(', ');
    const success = await copyToClipboard(hexList);
    if (success) {
      isCopied = true;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        isCopied = false;
      }, 2000);
    }
  }

  function handleCardClick() {
    onopenDetail(palette);
  }

  function handleEditClick(e: MouseEvent) {
    e.stopPropagation();
    onedit(palette);
  }

  function handleDeleteClick(e: MouseEvent) {
    e.stopPropagation();
    ondelete(palette);
  }
</script>

<div
  role="button"
  tabindex="0"
  onclick={handleCardClick}
  onkeydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  }}
  class="group relative text-left rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-sm hover:shadow-neo hover:border-border-strong transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent flex flex-col justify-between"
>
  <div>
    <!-- Header: Name + Collection Badge -->
    <div class="flex items-start justify-between gap-2 mb-3">
      <div class="space-y-1 min-w-0">
        <h3 class="text-base font-bold text-foreground tracking-tight truncate group-hover:text-accent transition-colors" title={palette.name}>
          {palette.name}
        </h3>
        {#if palette.description}
          <p class="text-xs text-muted-foreground line-clamp-1" title={palette.description}>
            {palette.description}
          </p>
        {/if}
      </div>

      {#if collection}
        <Badge variant="accent" size="sm" class="flex-shrink-0 flex items-center gap-1">
          <Folder class="w-3 h-3" aria-hidden="true" />
          <span class="max-w-[100px] truncate">{collection.name}</span>
        </Badge>
      {:else}
        <Badge variant="neutral" size="sm" class="flex-shrink-0">
          Unassigned
        </Badge>
      {/if}
    </div>

    <!-- Swatches Visualization Bar -->
    <div
      class="h-14 sm:h-16 w-full rounded-xl overflow-hidden flex border border-black/10 dark:border-white/10 shadow-inner my-3"
      aria-label="Color swatches preview"
    >
      {#each palette.colors as color, i (color.id || color.hex + '-' + i)}
        {@const isLight = isLightColor(color.hex)}
        <div
          class="flex-1 h-full relative group/swatch transition-transform hover:scale-y-105"
          style="background-color: {color.hex};"
          title="{color.name ? `${color.name}: ` : ''}{color.hex}"
        >
          <!-- Hover mini label -->
          <div
            class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/swatch:opacity-100 transition-opacity text-[10px] font-mono font-bold tracking-tight px-0.5 truncate"
            style="color: {isLight ? '#000000' : '#FFFFFF'};"
          >
            {color.hex}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Card Footer: Metadata & Actions -->
  <div class="mt-2 pt-3 border-t border-border flex items-center justify-between gap-2 text-xs font-mono text-muted-foreground">
    <!-- Meta info -->
    <div class="flex items-center gap-3">
      <span>{palette.colors.length} {palette.colors.length === 1 ? 'color' : 'colors'}</span>
      {#if formattedDate}
        <span class="hidden sm:inline-flex items-center gap-1">
          <Calendar class="w-3 h-3" aria-hidden="true" />
          <span>{formattedDate}</span>
        </span>
      {/if}
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center gap-1">
      <!-- Copy HEX Values -->
      <button
        type="button"
        onclick={handleCopyHexes}
        class="p-1.5 rounded-lg border border-transparent hover:border-border hover:bg-background text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        title="Copy palette HEX values"
        aria-label="Copy all color HEX codes"
      >
        {#if isCopied}
          <Check class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        {:else}
          <Copy class="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
        {/if}
      </button>

      <!-- Edit Palette -->
      <button
        type="button"
        onclick={handleEditClick}
        class="p-1.5 rounded-lg border border-transparent hover:border-border hover:bg-background text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        title="Edit palette"
        aria-label="Edit palette {palette.name}"
      >
        <Pencil class="w-3.5 h-3.5" aria-hidden="true" />
      </button>

      <!-- Delete Palette -->
      <button
        type="button"
        onclick={handleDeleteClick}
        class="p-1.5 rounded-lg border border-transparent hover:border-red-200 dark:hover:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
        title="Delete palette"
        aria-label="Delete palette {palette.name}"
      >
        <Trash2 class="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  </div>
</div>
