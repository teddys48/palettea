<script lang="ts">
  import SlidersHorizontal from 'lucide-svelte/icons/sliders-horizontal';
  import ColorFormatRow from './ColorFormatRow.svelte';
  import type { ConvertedColorResult, SupportedColorFormat } from '../../types/color';

  interface Props {
    result: ConvertedColorResult;
    activeFormat: SupportedColorFormat;
    onselectFormat?: (format: SupportedColorFormat) => void;
  }

  let { result, activeFormat, onselectFormat }: Props = $props();

  let useCssFormat = $state(false);

  const formatRows = $derived([
    {
      id: 'hex' as const,
      label: 'HEX',
      value: result.hex.value,
      cssValue: result.hex.value,
      rawValue: result.hex.raw,
      description: 'Canonical 6-digit hex notation for CSS and design tools.',
    },
    {
      id: 'rgb' as const,
      label: 'RGB',
      value: result.rgb.value,
      cssValue: result.rgb.css,
      rawValue: result.rgb.value,
      description: 'Red, Green, Blue components in 0-255 additive color model.',
    },
    {
      id: 'hsl' as const,
      label: 'HSL',
      value: result.hsl.value,
      cssValue: result.hsl.css,
      rawValue: result.hsl.value,
      description: 'Hue (0-360°), Saturation (0-100%), Lightness (0-100%).',
    },
    {
      id: 'hsv' as const,
      label: 'HSV / HSB',
      value: result.hsv.value,
      cssValue: result.hsv.css,
      rawValue: result.hsv.value,
      description: 'Hue (0-360°), Saturation (0-100%), Brightness Value (0-100%).',
    },
    {
      id: 'cmyk' as const,
      label: 'CMYK',
      value: result.cmyk.value,
      cssValue: result.cmyk.css,
      rawValue: result.cmyk.value,
      description: 'Cyan, Magenta, Yellow, Key/Black percentages for print media.',
    },
  ]);
</script>

<div class="space-y-4">
  <!-- Header with CSS syntax toggle -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
    <div>
      <h3 class="text-sm font-bold uppercase tracking-wider text-foreground font-mono flex items-center gap-2">
        <SlidersHorizontal class="w-4 h-4 text-accent" aria-hidden="true" />
        <span>Converted Formats</span>
      </h3>
      <p class="text-xs text-muted-foreground mt-0.5">
        Mathematically synchronized across all 5 color spaces in real-time.
      </p>
    </div>

    <!-- Output syntax toggle pill -->
    <div class="flex items-center gap-2 self-start sm:self-auto">
      <span class="text-xs font-mono text-muted-foreground hidden sm:inline">Format style:</span>
      <div class="inline-flex items-center rounded-lg border border-border bg-background p-0.5 shadow-sm">
        <button
          type="button"
          onclick={() => (useCssFormat = false)}
          class="px-2.5 py-1 text-xs font-mono rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {!useCssFormat ? 'bg-surface text-foreground font-bold shadow-neo border border-border' : 'text-muted-foreground hover:text-foreground'}"
          aria-pressed={!useCssFormat}
        >
          Numeric Values
        </button>
        <button
          type="button"
          onclick={() => (useCssFormat = true)}
          class="px-2.5 py-1 text-xs font-mono rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {useCssFormat ? 'bg-surface text-foreground font-bold shadow-neo border border-border' : 'text-muted-foreground hover:text-foreground'}"
          aria-pressed={useCssFormat}
        >
          CSS Syntax
        </button>
      </div>
    </div>
  </div>

  <!-- Cards Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {#each formatRows as row (row.id)}
      <ColorFormatRow
        formatId={row.id}
        label={row.label}
        value={row.value}
        cssValue={row.cssValue}
        rawValue={row.rawValue}
        description={row.description}
        isActiveInput={activeFormat === row.id}
        {useCssFormat}
        onselectInput={onselectFormat}
      />
    {/each}
  </div>
</div>
