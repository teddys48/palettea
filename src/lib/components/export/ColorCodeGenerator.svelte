<script lang="ts">
  import Copy from 'lucide-svelte/icons/copy';
  import Check from 'lucide-svelte/icons/check';
  import Code from 'lucide-svelte/icons/code';
  import { copyToClipboard } from '../../utils/clipboard';
  import {
    formatHex,
    hexToRgb,
    convertAllFormats,
    getContrastColor,
  } from '../../utils/color-utils';
  import type { ConvertedColorResult } from '../../types/color';

  interface Props {
    colorHex: string;
    colorName?: string;
  }

  let { colorHex, colorName = 'Selected Color' }: Props = $props();

  let useCssSyntax = $state(true);
  let copiedId = $state<string | null>(null);
  let copyTimeout: ReturnType<typeof setTimeout> | null = null;

  const cleanFormattedHex = $derived(formatHex(colorHex));
  const rgbObj = $derived(hexToRgb(cleanFormattedHex) || { r: 0, g: 0, b: 0 });
  const converted = $derived<ConvertedColorResult>(convertAllFormats(rgbObj));
  const textColor = $derived(getContrastColor(cleanFormattedHex));

  interface FormatItem {
    id: string;
    name: string;
    raw: string;
    css: string;
    description: string;
  }

  const formats = $derived<FormatItem[]>([
    {
      id: 'hex',
      name: 'HEX',
      raw: converted.hex.raw,
      css: converted.hex.value,
      description: 'Standard 6-digit hexadecimal color code',
    },
    {
      id: 'rgb',
      name: 'RGB',
      raw: converted.rgb.value,
      css: converted.rgb.css,
      description: 'Red, Green, Blue additive color space (0-255)',
    },
    {
      id: 'hsl',
      name: 'HSL',
      raw: converted.hsl.value,
      css: converted.hsl.css,
      description: 'Hue (0-360°), Saturation (0-100%), Lightness (0-100%)',
    },
    {
      id: 'hsv',
      name: 'HSV / HSB',
      raw: converted.hsv.value,
      css: converted.hsv.css,
      description: 'Hue (0-360°), Saturation (0-100%), Value / Brightness (0-100%)',
    },
    {
      id: 'cmyk',
      name: 'CMYK',
      raw: converted.cmyk.value,
      css: converted.cmyk.css,
      description: 'Cyan, Magenta, Yellow, Key/Black subtractive color model',
    },
  ]);

  async function handleCopy(text: string, id: string) {
    const success = await copyToClipboard(text);
    if (success) {
      if (copyTimeout) clearTimeout(copyTimeout);
      copiedId = id;
      copyTimeout = setTimeout(() => {
        copiedId = null;
      }, 1500);
    }
  }
</script>

<div class="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-5">
  <!-- Header with syntax switcher -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
    <div class="flex items-center gap-3">
      <div
        class="w-10 h-10 rounded-xl border border-border shadow-neo flex items-center justify-center transition-colors"
        style="background-color: {cleanFormattedHex}; color: {textColor};"
      >
        <Code class="w-5 h-5" aria-hidden="true" />
      </div>
      <div>
        <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
          <span>Color Code Generator</span>
          <span class="text-xs font-mono px-2 py-0.5 rounded bg-background border border-border text-muted-foreground font-normal">
            {colorName}: {cleanFormattedHex}
          </span>
        </h3>
        <p class="text-xs text-muted-foreground mt-0.5">
          Instant developer representations generated locally via Phase 4 color engine.
        </p>
      </div>
    </div>

    <!-- Toggle raw vs CSS syntax -->
    <div class="flex items-center gap-2 self-start sm:self-auto">
      <span class="text-xs font-mono text-muted-foreground">Syntax:</span>
      <div class="inline-flex p-0.5 rounded-lg border border-border bg-background text-xs font-mono">
        <button
          type="button"
          onclick={() => (useCssSyntax = true)}
          class="px-2.5 py-1 rounded-md transition-colors cursor-pointer {useCssSyntax ? 'bg-surface font-bold text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
        >
          CSS
        </button>
        <button
          type="button"
          onclick={() => (useCssSyntax = false)}
          class="px-2.5 py-1 rounded-md transition-colors cursor-pointer {!useCssSyntax ? 'bg-surface font-bold text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
        >
          Raw
        </button>
      </div>
    </div>
  </div>

  <!-- Formats Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
    {#each formats as item (item.id)}
      {@const displayValue = useCssSyntax ? item.css : item.raw}
      <div class="rounded-xl border border-border bg-background p-3 flex flex-col justify-between hover:border-border-strong transition-colors group">
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-foreground">{item.name}</span>
            <span class="text-[10px] font-mono text-muted-foreground uppercase">{useCssSyntax ? 'CSS' : 'Numeric'}</span>
          </div>
          <p class="text-[11px] text-muted-foreground line-clamp-1">{item.description}</p>
        </div>

        <div class="mt-3 pt-2 border-t border-border/50 flex items-center justify-between gap-2">
          <code class="text-xs font-mono font-bold text-foreground truncate select-all">
            {displayValue}
          </code>

          <button
            type="button"
            onclick={() => handleCopy(displayValue, item.id)}
            title="Copy {item.name} value"
            aria-label="Copy {item.name} representation {displayValue}"
            class="p-1.5 rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground hover:border-border-strong cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {#if copiedId === item.id}
              <Check class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            {:else}
              <Copy class="w-3.5 h-3.5" aria-hidden="true" />
            {/if}
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>
