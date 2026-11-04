<script lang="ts">
  import Copy from 'lucide-svelte/icons/copy';
  import Check from 'lucide-svelte/icons/check';
  import Sparkles from 'lucide-svelte/icons/sparkles';
  import { copyToClipboard } from '../../utils/clipboard';
  import { getContrastColor, isLightColor, formatHex } from '../../utils/color-utils';
  import type { ColorApiResponse } from '../../types/color';

  interface Props {
    hex: string;
    colorData?: ColorApiResponse | null;
  }

  let { hex, colorData = null }: Props = $props();

  let copied = $state(false);
  let copyTimeout: ReturnType<typeof setTimeout> | null = null;

  const formattedHex = $derived(formatHex(hex));
  const textColor = $derived(
    colorData?.contrast?.value ? colorData.contrast.value : getContrastColor(hex)
  );
  const isLight = $derived(isLightColor(hex));
  const colorName = $derived(colorData?.name?.value ?? 'Inspecting Color');
  const isExactMatch = $derived(colorData?.name?.exact_match_name ?? false);

  async function handleCopy() {
    const success = await copyToClipboard(formattedHex);
    if (success) {
      copied = true;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        copied = false;
      }, 2000);
    }
  }
</script>

<div class="space-y-3">
  <!-- Prominent Hero Color Swatch -->
  <div
    class="relative w-full h-64 sm:h-72 md:h-80 rounded-3xl border-2 border-border-strong/40 dark:border-zinc-700 shadow-neo-lg transition-colors duration-300 flex flex-col justify-between p-6 sm:p-8 overflow-hidden select-none"
    style="background-color: {formattedHex}; color: {textColor};"
  >
    <!-- Top Details: Badges and Copy Action -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wide border shadow-sm backdrop-blur-md"
          style="background-color: {isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.15)'}; border-color: {isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.25)'};"
        >
          <Sparkles class="w-3.5 h-3.5" aria-hidden="true" />
          <span>{isLight ? 'Light Tone' : 'Dark Tone'}</span>
        </span>

        {#if colorData}
          <span
            class="text-[11px] font-mono px-2.5 py-0.5 rounded-full border backdrop-blur-md"
            style="background-color: {isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)'}; border-color: {isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)'};"
          >
            {isExactMatch ? 'Exact Name' : 'Approximate Name'}
          </span>
        {/if}
      </div>

      <!-- Quick Copy HEX Button on Swatch -->
      <button
        type="button"
        onclick={handleCopy}
        aria-label="Copy HEX {formattedHex} to clipboard"
        class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer backdrop-blur-md border shadow-sm hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        style="background-color: {isLight ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.95)'}; color: {isLight ? '#FFFFFF' : '#18181B'}; border-color: {isLight ? '#000000' : '#FFFFFF'};"
      >
        {#if copied}
          <Check class="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
          <span>Copied!</span>
        {:else}
          <Copy class="w-3.5 h-3.5" aria-hidden="true" />
          <span>Copy HEX</span>
        {/if}
      </button>
    </div>

    <!-- Bottom Swatch Content: Name & Large HEX Value -->
    <div class="space-y-1">
      <div class="text-xs sm:text-sm font-mono tracking-wider uppercase opacity-85">
        Color Identity
      </div>
      <h1 class="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-sm break-words">
        {colorName}
      </h1>
      <div class="pt-1 flex items-baseline gap-3">
        <span class="text-lg sm:text-2xl font-mono font-bold tracking-tight">
          {formattedHex}
        </span>
        {#if colorData?.name?.closest_named_hex && !isExactMatch}
          <span class="text-xs font-mono opacity-80 hidden sm:inline-block">
            closest match: {colorData.name.closest_named_hex}
          </span>
        {/if}
      </div>
    </div>
  </div>
</div>
