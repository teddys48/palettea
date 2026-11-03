<script lang="ts">
  import Copy from 'lucide-svelte/icons/copy';
  import Check from 'lucide-svelte/icons/check';
  import Lock from 'lucide-svelte/icons/lock';
  import Sparkles from 'lucide-svelte/icons/sparkles';
  import type { ColorSwatch } from '../../types';

  interface Props {
    colors: ColorSwatch[];
    paletteName: string;
    paletteTag: string;
  }

  let { colors, paletteName, paletteTag }: Props = $props();

  let copiedHex = $state<string | null>(null);
  let copyTimeout: ReturnType<typeof setTimeout> | null = null;

  async function copyToClipboard(hex: string) {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(hex);
      }
      copiedHex = hex;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        copiedHex = null;
      }, 2000);
    } catch {
      copiedHex = hex;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        copiedHex = null;
      }, 2000);
    }
  }
</script>

<div class="w-full rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-neo transition-all">
  <!-- Header of Palette Card -->
  <div class="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
    <div class="flex items-center gap-2.5">
      <div class="flex h-3 w-3 rounded-full bg-accent animate-pulse" aria-hidden="true"></div>
      <h2 class="text-base sm:text-lg font-bold tracking-tight text-foreground">{paletteName}</h2>
      <span class="rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 uppercase">
        {paletteTag}
      </span>
    </div>
    <div class="flex items-center gap-2 text-xs font-mono text-muted-foreground">
      <span>5 Curated Swatches</span>
      <span>•</span>
      <span>Click any swatch to copy HEX</span>
    </div>
  </div>

  <!-- Swatches Grid / Container -->
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-2">
    {#each colors as swatch (swatch.hex)}
      {@const isCopied = copiedHex === swatch.hex}
      <button
        type="button"
        onclick={() => copyToClipboard(swatch.hex)}
        aria-label="Copy color {swatch.hex} ({swatch.name})"
        class="group relative flex flex-col rounded-xl border border-border overflow-hidden transition-all duration-200 hover:shadow-neo hover:translate-y-[-2px] hover:border-border-strong dark:hover:border-zinc-600 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <!-- Swatch Color Box -->
        <div
          class="relative h-32 sm:h-44 w-full flex flex-col justify-between p-3 transition-transform group-hover:scale-[1.01]"
          style="background-color: {swatch.hex};"
        >
          <!-- Top Tag inside Swatch -->
          <div class="flex items-center justify-between">
            <span
              class="rounded px-1.5 py-0.5 text-[10px] font-mono font-medium backdrop-blur-sm {swatch.isLight ? 'bg-black/10 text-neutral-900 border border-black/10' : 'bg-white/20 text-white border border-white/20'}"
            >
              {swatch.role}
            </span>

            <span
              class="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity p-1 rounded backdrop-blur-sm {swatch.isLight ? 'bg-black/10 text-neutral-900' : 'bg-white/20 text-white'}"
              title="Lock (Phase 3)"
            >
              <Lock class="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          </div>

          <!-- Bottom Action inside Swatch: Copy Pill -->
          <div class="flex items-center justify-end">
            <div
              class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-mono font-medium shadow-sm transition-all {isCopied ? 'bg-emerald-600 text-white' : swatch.isLight ? 'bg-neutral-900 text-white group-hover:bg-black' : 'bg-white text-neutral-900 group-hover:bg-neutral-100'}"
            >
              {#if isCopied}
                <Check class="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copied!</span>
              {:else}
                <Copy class="w-3.5 h-3.5 opacity-80 group-hover:opacity-100" aria-hidden="true" />
                <span class="text-[11px]">Copy</span>
              {/if}
            </div>
          </div>
        </div>

        <!-- Swatch Metadata Footer -->
        <div class="bg-surface p-3 border-t border-border flex flex-col gap-0.5">
          <div class="flex items-center justify-between">
            <span class="font-mono text-xs font-bold text-foreground tracking-wide">{swatch.hex}</span>
            <span class="text-[10px] font-mono text-muted-foreground">{swatch.rgb}</span>
          </div>
          <span class="text-xs text-muted-foreground truncate">{swatch.name}</span>
        </div>
      </button>
    {/each}
  </div>

  <!-- Footnote -->
  <div class="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-muted-foreground pt-2">
    <div class="flex items-center gap-1.5">
      <Sparkles class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
      <span>Static preview palette for Phase 1. Dynamic generation activates in Phase 3.</span>
    </div>
    <span class="text-[11px] bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
      WCAG 2.1 AA/AAA Compliant Preview
    </span>
  </div>
</div>
