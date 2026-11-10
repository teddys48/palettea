<script lang="ts">
  import Copy from 'lucide-svelte/icons/copy';
  import Check from 'lucide-svelte/icons/check';
  import Search from 'lucide-svelte/icons/search';
  import Sparkles from 'lucide-svelte/icons/sparkles';
  import { copyToClipboard } from '../../utils/clipboard';
  import { getContrastColor, isLightColor } from '../../utils/color-utils';
  import type { ColorApiResponse } from '../../types/color';

  interface Props {
    color: ColorApiResponse;
    isSeed?: boolean;
    index?: number;
    oninspect?: (cleanHex: string) => void;
  }

  let { color, isSeed = false, index = 0, oninspect }: Props = $props();

  let isCopied = $state(false);
  let copyTimeout: ReturnType<typeof setTimeout> | null = null;

  const hexValue = $derived(color.hex.value);
  const cleanHex = $derived(color.hex.clean);
  const colorName = $derived(color.name?.value || 'Unnamed');
  const rgbValue = $derived(color.rgb?.value || '');

  // Contrast-aware styling
  const contrastHex = $derived(getContrastColor(cleanHex));
  const isLight = $derived(isLightColor(cleanHex));

  async function handleCopy(e?: MouseEvent | KeyboardEvent) {
    if (e) {
      e.stopPropagation();
    }
    const success = await copyToClipboard(hexValue);
    if (success) {
      isCopied = true;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        isCopied = false;
      }, 1800);
    }
  }

  function handleInspect(e: MouseEvent) {
    e.stopPropagation();
    if (oninspect) {
      oninspect(cleanHex);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCopy(e);
    }
  }
</script>

<div
  role="button"
  tabindex="0"
  aria-label="Color swatch {colorName}, {hexValue}. Click to copy HEX code."
  onclick={() => handleCopy()}
  onkeydown={handleKeyDown}
  class="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border border-black/10 dark:border-white/10 shadow-neo transition-all duration-200 cursor-pointer select-none hover:-translate-y-1 hover:shadow-neo-lg active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[220px] sm:min-h-[260px] md:min-h-[300px]"
  style="background-color: {hexValue}; color: {contrastHex};"
>
  <!-- Top Bar: Index / Seed Badge & Quick Actions -->
  <div class="flex items-center justify-between gap-2">
    <div class="flex items-center gap-1.5">
      {#if isSeed}
        <span
          class="inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-md backdrop-blur-md shadow-sm {isLight ? 'bg-black/10 text-black border border-black/20' : 'bg-white/20 text-white border border-white/30'}"
          title="Base seed color used to generate this harmony"
        >
          <Sparkles class="w-3 h-3" aria-hidden="true" />
          <span>Base</span>
        </span>
      {:else}
        <span
          class="text-xs font-mono font-bold opacity-95 px-1.5 py-0.5 rounded"
          aria-hidden="true"
        >
          #{index + 1}
        </span>
      {/if}
    </div>

    <!-- Hover & Focus Action Buttons -->
    <div class="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
      {#if oninspect}
        <button
          type="button"
          onclick={handleInspect}
          class="p-1.5 rounded-lg backdrop-blur-md transition-transform hover:scale-110 active:scale-95 cursor-pointer {isLight ? 'bg-black/15 text-black hover:bg-black/25' : 'bg-white/25 text-white hover:bg-white/35'}"
          title="Inspect {hexValue} in Color Inspector"
          aria-label="Inspect {hexValue} in Color Inspector"
        >
          <Search class="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      {/if}

      <button
        type="button"
        onclick={handleCopy}
        class="p-1.5 rounded-lg backdrop-blur-md transition-transform hover:scale-110 active:scale-95 cursor-pointer {isLight ? 'bg-black/15 text-black hover:bg-black/25' : 'bg-white/25 text-white hover:bg-white/35'}"
        title="Copy {hexValue}"
        aria-label="Copy {hexValue} to clipboard"
      >
        {#if isCopied}
          <Check class="w-3.5 h-3.5" aria-hidden="true" />
        {:else}
          <Copy class="w-3.5 h-3.5" aria-hidden="true" />
        {/if}
      </button>
    </div>
  </div>

  <!-- Center Floating "Copied!" Pill -->
  {#if isCopied}
    <div
      role="status"
      class="absolute inset-x-4 top-1/2 -translate-y-1/2 flex items-center justify-center animate-in zoom-in-95 duration-150 z-20"
    >
      <span
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold shadow-lg backdrop-blur-md {isLight ? 'bg-black text-white' : 'bg-white text-black'}"
      >
        <Check class="w-3.5 h-3.5" aria-hidden="true" />
        <span>Copied!</span>
      </span>
    </div>
  {/if}

  <!-- Bottom Color Metadata -->
  <div class="space-y-1 pt-4">
    <div class="flex items-baseline justify-between gap-1">
      <span class="font-mono text-lg sm:text-xl font-extrabold tracking-tight">
        {hexValue}
      </span>
    </div>

    <p
      class="text-xs sm:text-sm font-semibold truncate leading-tight opacity-95"
      title={colorName}
    >
      {colorName}
    </p>

    {#if rgbValue}
      <p class="text-xs font-mono opacity-90 truncate">
        {rgbValue}
      </p>
    {/if}
  </div>
</div>
