<script lang="ts">
  import Layers from 'lucide-svelte/icons/layers';
  import Palette from 'lucide-svelte/icons/palette';
  import Search from 'lucide-svelte/icons/search';
  import Sparkles from 'lucide-svelte/icons/sparkles';
  import { paletteStore } from '../../stores/palette-store.svelte';
  import type { ExportPayload, ExportColorItem } from '../../types/export';
  import ColorSwatchMenu from './ColorSwatchMenu.svelte';
  import { getContrastColor } from '../../utils/color-utils';

  interface Props {
    payload: ExportPayload;
    schemeColors: Array<{ hex: string; name?: string }>;
    inspectorHex: string;
    onselectPayload: (newPayload: ExportPayload) => void;
  }

  let { payload, schemeColors, inspectorHex, onselectPayload }: Props = $props();

  let activeSourceType = $state<'saved' | 'scheme' | 'inspector' | 'preset'>('preset');
  let selectedSavedPaletteId = $state<string>('');

  const curatedPresets: Array<{ id: string; name: string; colors: ExportColorItem[] }> = [
    {
      id: 'dawn-harmony',
      name: 'Dawn Harmony',
      colors: [
        { hex: '#191919', name: 'Ink Obsidian' },
        { hex: '#4F46E5', name: 'Electric Iris' },
        { hex: '#93C5FD', name: 'Periwinkle Cloud' },
        { hex: '#38BDF8', name: 'Cyan Glow' },
        { hex: '#FAF9F6', name: 'Alabaster Canvas' },
      ],
    },
    {
      id: 'nordic-slate',
      name: 'Nordic Slate',
      colors: [
        { hex: '#0F172A', name: 'Deep Space' },
        { hex: '#0D9488', name: 'Teal Forest' },
        { hex: '#14B8A6', name: 'Mint Jade' },
        { hex: '#5EEAD4', name: 'Seafoam Breeze' },
        { hex: '#F0FDFA', name: 'Glacial Mist' },
      ],
    },
    {
      id: 'solar-terracotta',
      name: 'Solar Terracotta',
      colors: [
        { hex: '#271B17', name: 'Roasted Cacao' },
        { hex: '#EA580C', name: 'Burnt Persimmon' },
        { hex: '#F97316', name: 'Tangerine Dusk' },
        { hex: '#FDBA74', name: 'Apricot Cream' },
        { hex: '#FFF7ED', name: 'Warm Linen' },
      ],
    },
  ];

  function selectPreset(preset: (typeof curatedPresets)[0]) {
    activeSourceType = 'preset';
    onselectPayload({
      name: preset.name,
      colors: preset.colors,
    });
  }

  function selectScheme() {
    activeSourceType = 'scheme';
    onselectPayload({
      name: 'Harmonic Scheme',
      description: 'Generated with Color Scheme Generator',
      colors: schemeColors.map((c, i) => ({
        hex: c.hex,
        name: c.name || `Scheme Color ${i + 1}`,
      })),
    });
  }

  function selectInspector() {
    activeSourceType = 'inspector';
    onselectPayload({
      name: 'Inspected Color',
      description: `Color ${inspectorHex}`,
      colors: [{ hex: `#${inspectorHex.replace(/^#/, '')}`, name: 'Inspected Color' }],
    });
  }

  function selectSavedPalette(paletteId: string) {
    selectedSavedPaletteId = paletteId;
    const target = paletteStore.palettes.find((p) => p.id === paletteId);
    if (target) {
      activeSourceType = 'saved';
      onselectPayload({
        name: target.name,
        description: target.description,
        createdAt: target.createdAt,
        updatedAt: target.updatedAt,
        colors: target.colors.map((c) => ({
          id: c.id,
          hex: c.hex,
          name: c.name,
          position: c.position,
        })),
      });
    }
  }
</script>

<div class="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-5">
  <!-- Source Tabs -->
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
      <label for="source-tabs" class="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
        Export Color Source
      </label>
      <span class="text-xs font-mono text-muted-foreground">
        Active: <strong class="text-foreground">{payload.name}</strong> ({payload.colors.length} colors)
      </span>
    </div>

    <div id="source-tabs" class="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-background border border-border">
      <!-- Saved Palettes -->
      <button
        type="button"
        onclick={() => {
          activeSourceType = 'saved';
          if (paletteStore.palettes.length > 0) {
            selectSavedPalette(selectedSavedPaletteId || paletteStore.palettes[0]!.id);
          }
        }}
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border transition-all cursor-pointer {activeSourceType === 'saved' ? 'bg-surface border-border-strong text-foreground font-bold shadow-neo' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-surface/50'}"
      >
        <Layers class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span>Saved Palettes</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-muted-foreground font-bold">
          {paletteStore.palettes.length}
        </span>
      </button>

      <!-- Scheme Generator -->
      <button
        type="button"
        onclick={selectScheme}
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border transition-all cursor-pointer {activeSourceType === 'scheme' ? 'bg-surface border-border-strong text-foreground font-bold shadow-neo' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-surface/50'}"
      >
        <Palette class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span>Scheme Generator</span>
      </button>

      <!-- Inspector Color -->
      <button
        type="button"
        onclick={selectInspector}
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border transition-all cursor-pointer {activeSourceType === 'inspector' ? 'bg-surface border-border-strong text-foreground font-bold shadow-neo' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-surface/50'}"
      >
        <Search class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span>Color Inspector</span>
      </button>

      <!-- Curated Presets -->
      <button
        type="button"
        onclick={() => selectPreset(curatedPresets[0]!)}
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border transition-all cursor-pointer {activeSourceType === 'preset' ? 'bg-surface border-border-strong text-foreground font-bold shadow-neo' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-surface/50'}"
      >
        <Sparkles class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span>Curated Presets</span>
      </button>
    </div>
  </div>

  <!-- Sub-selection when 'saved' or 'preset' is active -->
  {#if activeSourceType === 'saved'}
    <div class="p-3 rounded-xl bg-background border border-border space-y-2">
      {#if paletteStore.palettes.length === 0}
        <p class="text-xs text-muted-foreground">
          No saved palettes found in Palette Management. Save a palette first, or use a curated preset / scheme.
        </p>
      {:else}
        <div class="flex items-center gap-2">
          <label for="saved-palette-select" class="text-xs font-mono text-muted-foreground whitespace-nowrap">Choose Palette:</label>
          <select
            id="saved-palette-select"
            value={selectedSavedPaletteId}
            onchange={(e) => selectSavedPalette((e.target as HTMLSelectElement).value)}
            class="w-full text-xs font-mono rounded-lg border border-border bg-surface px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
          >
            {#each paletteStore.palettes as p (p.id)}
              <option value={p.id}>
                {p.name} ({p.colors.length} colors) {p.collectionId ? `• [${paletteStore.getCollectionById(p.collectionId)?.name || 'Collection'}]` : ''}
              </option>
            {/each}
          </select>
        </div>
      {/if}
    </div>
  {:else if activeSourceType === 'preset'}
    <div class="flex flex-wrap items-center gap-2">
      {#each curatedPresets as preset (preset.id)}
        <button
          type="button"
          onclick={() => selectPreset(preset)}
          class="px-3 py-1.5 text-xs font-mono rounded-lg border transition-colors cursor-pointer {payload.name === preset.name ? 'bg-background border-border-strong text-foreground font-bold shadow-sm' : 'border-border text-muted-foreground hover:text-foreground hover:bg-background'}"
        >
          {preset.name}
        </button>
      {/each}
    </div>
  {/if}

  <!-- Active Source Swatches Preview -->
  <div class="space-y-2">
    <div class="flex items-center justify-between text-xs font-mono text-muted-foreground">
      <span>Current Palette Swatches:</span>
      <span>Hover swatch for individual format copy</span>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
      {#each payload.colors as item, index (item.hex + index)}
        {@const contrast = getContrastColor(item.hex)}
        <div
          class="relative rounded-xl border border-border shadow-neo p-3 flex flex-col justify-between h-24 transition-transform hover:-translate-y-0.5 group overflow-hidden"
          style="background-color: {item.hex}; color: {contrast};"
        >
          <!-- Top row: name and copy popover -->
          <div class="flex items-start justify-between gap-1">
            <span class="text-[11px] font-semibold tracking-tight truncate" title={item.name || `Color ${index + 1}`}>
              {item.name || `Color ${index + 1}`}
            </span>

            <ColorSwatchMenu
              hex={item.hex}
              name={item.name || `color-${index + 1}`}
            />
          </div>

          <!-- Bottom: HEX code -->
          <span class="text-xs font-mono font-bold uppercase tracking-wider">
            {item.hex}
          </span>
        </div>
      {/each}
    </div>
  </div>
</div>
