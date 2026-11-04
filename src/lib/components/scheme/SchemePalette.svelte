<script lang="ts">
  import Copy from 'lucide-svelte/icons/copy';
  import Check from 'lucide-svelte/icons/check';
  import Layers from 'lucide-svelte/icons/layers';
  import SchemeSwatch from './SchemeSwatch.svelte';
  import { copyToClipboard } from '../../utils/clipboard';
  import { normalizeHex } from '../../utils/color-utils';
  import type { ColorApiResponse } from '../../types/color';

  interface Props {
    colors: ColorApiResponse[];
    seedHex: string;
    isLoading?: boolean;
    skeletonCount?: number;
    oninspect?: (cleanHex: string) => void;
  }

  let {
    colors = [],
    seedHex,
    isLoading = false,
    skeletonCount = 5,
    oninspect,
  }: Props = $props();

  let isPaletteCopied = $state(false);
  let paletteCopyTimeout: ReturnType<typeof setTimeout> | null = null;

  const normalizedSeed = $derived(normalizeHex(seedHex) ?? '');

  async function handleCopyEntirePalette() {
    if (colors.length === 0) return;
    const hexList = colors.map((c) => c.hex.value).join(', ');
    const success = await copyToClipboard(hexList);
    if (success) {
      isPaletteCopied = true;
      if (paletteCopyTimeout) clearTimeout(paletteCopyTimeout);
      paletteCopyTimeout = setTimeout(() => {
        isPaletteCopied = false;
      }, 2000);
    }
  }
</script>

<div class="space-y-4">
  <!-- Palette Header / Quick Batch Actions -->
  <div class="flex items-center justify-between gap-3 px-1">
    <div class="flex items-center gap-2">
      <span class="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-foreground">
        <Layers class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span>Palette Swatches</span>
      </span>
      <span class="text-xs font-mono text-muted-foreground px-2 py-0.5 rounded-md border border-border bg-surface">
        {isLoading ? `${skeletonCount} colors` : `${colors.length} colors`}
      </span>
    </div>

    <!-- Copy Palette Button -->
    <button
      type="button"
      disabled={isLoading || colors.length === 0}
      onclick={handleCopyEntirePalette}
      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface text-foreground text-xs font-mono font-semibold shadow-sm hover:border-border-strong hover:bg-surface-hover active:translate-y-[1px] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      title="Copy all HEX codes as a comma-separated list"
    >
      {#if isPaletteCopied}
        <Check class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        <span class="text-emerald-600 dark:text-emerald-400">All Copied!</span>
      {:else}
        <Copy class="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
        <span>Copy Palette (HEX)</span>
      {/if}
    </button>
  </div>

  <!-- Swatches Container -->
  {#if isLoading}
    <!-- Zero-layout-shift Skeleton Loading State -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 animate-pulse"
      aria-busy="true"
      aria-label="Generating color scheme swatches"
    >
      {#each Array(skeletonCount) as _, i (i)}
        <div class="min-h-[220px] sm:min-h-[260px] md:min-h-[300px] rounded-2xl bg-zinc-200 dark:bg-zinc-800/60 border border-border"></div>
      {/each}
    </div>
  {:else if colors.length > 0}
    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 animate-in fade-in duration-200"
      style={colors.length > 5 ? `grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));` : undefined}
    >
      {#each colors as color, i (color.hex.clean + '-' + i)}
        <SchemeSwatch
          {color}
          index={i}
          isSeed={color.hex.clean.toUpperCase() === normalizedSeed.toUpperCase()}
          {oninspect}
        />
      {/each}
    </div>
  {/if}
</div>
