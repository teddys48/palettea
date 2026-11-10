<script lang="ts">
  import Copy from 'lucide-svelte/icons/copy';
  import Check from 'lucide-svelte/icons/check';
  import { copyToClipboard } from '../../utils/clipboard';
  import type { ColorApiResponse, ColorFormatItem } from '../../types/color';

  interface Props {
    colorData: ColorApiResponse;
  }

  let { colorData }: Props = $props();

  let copiedFormat = $state<string | null>(null);
  let copyTimeout: ReturnType<typeof setTimeout> | null = null;

  const formats = $derived<ColorFormatItem[]>([
    {
      id: 'hex',
      label: 'HEX',
      value: colorData.hex.value,
      description: 'Standard 6-character hexadecimal code for web and CSS.',
    },
    {
      id: 'rgb',
      label: 'RGB',
      value: colorData.rgb.value,
      description: 'Red, Green, Blue integer components (0-255).',
    },
    {
      id: 'hsl',
      label: 'HSL',
      value: colorData.hsl.value,
      description: 'Hue, Saturation, and Lightness percentages.',
    },
    {
      id: 'hsv',
      label: 'HSV',
      value: colorData.hsv.value,
      description: 'Hue, Saturation, and Brightness Value.',
    },
    {
      id: 'cmyk',
      label: 'CMYK',
      value: colorData.cmyk.value,
      description: 'Cyan, Magenta, Yellow, Key (Black) for print media.',
    },
    ...(colorData.XYZ
      ? [
          {
            id: 'xyz' as const,
            label: 'CIE XYZ',
            value: colorData.XYZ.value,
            description: 'Device-independent chromaticity coordinates.',
          },
        ]
      : []),
  ]);

  async function handleCopy(formatId: string, value: string) {
    const success = await copyToClipboard(value);
    if (success) {
      copiedFormat = formatId;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        copiedFormat = null;
      }, 2000);
    }
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between border-b border-border pb-2">
    <div>
      <h2 class="text-sm font-bold uppercase tracking-wider text-foreground font-mono">
        Color Representations
      </h2>
      <p class="text-xs text-muted-foreground mt-0.5">
        Official representations from The Color API. Click any card to copy.
      </p>
    </div>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {#each formats as item (item.id)}
      <div
        class="group relative rounded-xl border border-border bg-surface p-4 shadow-neo hover:border-border-strong hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex flex-col justify-between"
      >
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-accent tracking-wide uppercase">
              {item.label}
            </span>

            <button
              type="button"
              onclick={() => handleCopy(item.id, item.value)}
              aria-label="Copy {item.label} value {item.value}"
              class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {copiedFormat === item.id ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-background hover:bg-surface-hover text-muted-foreground hover:text-foreground border-border'}"
            >
              {#if copiedFormat === item.id}
                <Check class="w-3 h-3 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span class="font-bold">Copied!</span>
              {:else}
                <Copy class="w-3 h-3" aria-hidden="true" />
                <span>Copy</span>
              {/if}
            </button>
          </div>

          <p class="text-sm font-mono font-semibold text-foreground select-all break-all pt-1">
            {item.value}
          </p>
        </div>

        <p class="text-xs text-muted-foreground mt-3 pt-2 border-t border-border/60">
          {item.description}
        </p>
      </div>
    {/each}
  </div>
</div>
