<script lang="ts">
  import Bookmark from 'lucide-svelte/icons/bookmark';
  import Info from 'lucide-svelte/icons/info';
  import Check from 'lucide-svelte/icons/check';
  import RefreshCw from 'lucide-svelte/icons/refresh-cw';
  import Button from '../ui/Button.svelte';
  import Badge from '../ui/Badge.svelte';
  import ColorSwatchPreview from './ColorSwatchPreview.svelte';
  import type { PreviewPalette } from '../../types';

  const previewPalettes: PreviewPalette[] = [
    {
      id: 'palettea-core',
      title: 'Dawn Harmony',
      description: 'Default balanced aesthetic featuring Palettea brand accents and neutral foundation.',
      tag: 'Brand Palette',
      colors: [
        { hex: '#191919', name: 'Ink Obsidian', rgb: 'rgb(25, 25, 25)', role: 'Base', isLight: false },
        { hex: '#4F46E5', name: 'Electric Iris', rgb: 'rgb(79, 70, 229)', role: 'Accent', isLight: false },
        { hex: '#93C5FD', name: 'Periwinkle Cloud', rgb: 'rgb(147, 197, 253)', role: 'Secondary', isLight: true },
        { hex: '#38BDF8', name: 'Cyan Glow', rgb: 'rgb(56, 189, 248)', role: 'Vibrant', isLight: true },
        { hex: '#FAF9F6', name: 'Alabaster Canvas', rgb: 'rgb(250, 249, 246)', role: 'Surface', isLight: true },
      ],
    },
    {
      id: 'nordic-sage',
      title: 'Nordic Slate',
      description: 'Calm earthy tones with serene botanical accents.',
      tag: 'Analogous',
      colors: [
        { hex: '#0F172A', name: 'Deep Space', rgb: 'rgb(15, 23, 42)', role: 'Base', isLight: false },
        { hex: '#0D9488', name: 'Teal Forest', rgb: 'rgb(13, 148, 136)', role: 'Primary', isLight: false },
        { hex: '#14B8A6', name: 'Mint Jade', rgb: 'rgb(20, 184, 166)', role: 'Secondary', isLight: false },
        { hex: '#5EEAD4', name: 'Seafoam Breeze', rgb: 'rgb(94, 234, 212)', role: 'Highlight', isLight: true },
        { hex: '#F0FDFA', name: 'Glacial Mist', rgb: 'rgb(240, 253, 250)', role: 'Surface', isLight: true },
      ],
    },
    {
      id: 'terracotta-warmth',
      title: 'Solar Terracotta',
      description: 'Vibrant warm harmony with earthy balance.',
      tag: 'Complementary',
      colors: [
        { hex: '#271B17', name: 'Roasted Cacao', rgb: 'rgb(39, 27, 23)', role: 'Base', isLight: false },
        { hex: '#EA580C', name: 'Burnt Persimmon', rgb: 'rgb(234, 88, 12)', role: 'Accent', isLight: false },
        { hex: '#F97316', name: 'Tangerine Dusk', rgb: 'rgb(249, 115, 22)', role: 'Secondary', isLight: true },
        { hex: '#FDBA74', name: 'Apricot Cream', rgb: 'rgb(253, 186, 116)', role: 'Tint', isLight: true },
        { hex: '#FFF7ED', name: 'Warm Linen', rgb: 'rgb(255, 247, 237)', role: 'Surface', isLight: true },
      ],
    },
  ];

  let selectedPaletteIndex = $state(0);
  let colorInputHex = $state('#4F46E5');
  let noticeMessage = $state<string | null>(null);
  let noticeTimeout: ReturnType<typeof setTimeout> | null = null;

  const currentPalette = $derived(previewPalettes[selectedPaletteIndex] ?? previewPalettes[0]!);

  function showPrototypeNotice(feature: string, phase: string) {
    noticeMessage = `${feature} is scheduled for ${phase}. Palettea is currently in Phase 1 (Foundation & UI Setup).`;
    if (noticeTimeout) clearTimeout(noticeTimeout);
    noticeTimeout = setTimeout(() => {
      noticeMessage = null;
    }, 4000);
  }

  function cyclePresetPalette() {
    selectedPaletteIndex = (selectedPaletteIndex + 1) % previewPalettes.length;
  }
</script>

<section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
  <!-- Top Hero Header -->
  <div class="mb-8 sm:mb-12 text-center max-w-3xl mx-auto space-y-4">
    <div class="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 shadow-sm">
      <span class="flex h-2 w-2 rounded-full bg-accent animate-ping" aria-hidden="true"></span>
      <span class="text-xs font-mono text-muted-foreground">Modern Color Toolkit</span>
      <span class="text-xs font-mono text-muted-foreground">•</span>
      <span class="text-xs font-mono text-foreground font-semibold">Phase 1 Foundation</span>
    </div>

    <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
      Find your perfect colors.
    </h1>

    <p class="text-base sm:text-lg text-muted-foreground leading-relaxed">
      Explore harmonized color schemes, inspect formats across HEX, RGB & HSL, and ensure WCAG accessibility. Designed with clarity and precision.
    </p>
  </div>

  <!-- Interactive Visual Prototype Controls Bar -->
  <div class="mb-8 rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-neo">
    <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
      <!-- Color Input Visual Prototype -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <label for="color-picker-prototype" class="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
          Base Color
        </label>
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <!-- Color Swatch Circle / Indicator -->
          <div class="relative flex items-center">
            <span
              class="h-9 w-9 rounded-lg border border-border-strong/30 dark:border-zinc-700 shadow-inner flex items-center justify-center transition-transform hover:scale-105"
              style="background-color: {colorInputHex};"
              aria-hidden="true"
            ></span>
          </div>

          <!-- HEX Input Box (Visual Prototype) -->
          <div class="relative flex items-center">
            <span class="absolute left-3 text-xs font-mono text-muted-foreground pointer-events-none">#</span>
            <input
              id="color-picker-prototype"
              type="text"
              value={colorInputHex.replace('#', '')}
              readonly
              onclick={() => showPrototypeNotice('Live HEX Color Input & Inspector', 'Phase 2')}
              title="HEX input prototype (Editable in Phase 2)"
              class="h-9 w-28 rounded-lg border border-border bg-background pl-6 pr-2 text-xs font-mono font-bold text-foreground cursor-pointer hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          <Badge variant="neutral" size="sm" class="hidden sm:inline-flex">
            Interactive in Phase 2
          </Badge>
        </div>
      </div>

      <!-- Preset Switcher (Pill control with high-contrast active state in light and dark) -->
      <div class="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-background border border-border">
        <span class="text-xs font-mono text-muted-foreground px-2 hidden sm:inline-block">Presets:</span>
        {#each previewPalettes as palette, i (palette.id)}
          <button
            type="button"
            onclick={() => (selectedPaletteIndex = i)}
            class="px-3 py-1 text-xs font-mono rounded-lg border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {selectedPaletteIndex === i ? 'bg-surface border-border-strong dark:border-zinc-600 text-foreground font-bold shadow-neo' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-surface/50'}"
          >
            {palette.title}
          </button>
        {/each}
      </div>

      <!-- Action Buttons (Generate & Save) -->
      <div class="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
        <!-- Generate Button -->
        <Button
          variant="primary"
          size="md"
          onclick={cyclePresetPalette}
          title="Cycle through Phase 1 curated preview palettes"
          aria-label="Cycle preview palette"
        >
          <RefreshCw class="w-4 h-4" aria-hidden="true" />
          <span>Switch Preset</span>
          <span class="hidden sm:inline-flex text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-mono">Click</span>
        </Button>

        <!-- Save Button (Disabled in Phase 1) -->
        <Button
          variant="secondary"
          size="md"
          disabled={true}
          title="Save palette is planned for Phase 6"
          aria-label="Save palette (disabled until Phase 6)"
        >
          <Bookmark class="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <span>Save</span>
          <span class="text-[10px] font-mono text-muted-foreground">Phase 6</span>
        </Button>
      </div>
    </div>

    <!-- Notice Banner for Prototype Interactions -->
    {#if noticeMessage}
      <div
        role="alert"
        class="mt-3 flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/90 dark:border-indigo-800/80 dark:bg-indigo-950/40 px-3.5 py-2.5 text-xs font-mono text-indigo-950 dark:text-indigo-200 animate-in fade-in duration-200"
      >
        <div class="flex items-center gap-2">
          <Info class="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
          <span>{noticeMessage}</span>
        </div>
        <button
          type="button"
          onclick={() => (noticeMessage = null)}
          class="text-xs text-indigo-700 dark:text-indigo-300 hover:text-indigo-950 dark:hover:text-white underline cursor-pointer ml-2"
        >
          Dismiss
        </button>
      </div>
    {/if}
  </div>

  <!-- Color Swatch Preview Area -->
  <div class="mb-10">
    <ColorSwatchPreview
      colors={currentPalette.colors}
      paletteName={currentPalette.title}
      paletteTag={currentPalette.tag}
    />
  </div>

  <!-- Roadmap Context Cards (Transparent status about Phase 1 foundation and future phases) -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- Card 1: Phase 1 Active -->
    <div class="rounded-xl border-2 border-indigo-500/80 dark:border-indigo-500 bg-surface p-5 shadow-neo flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-2">
          <Badge variant="accent">Phase 1 Active</Badge>
          <span class="text-xs font-mono text-muted-foreground">Foundation</span>
        </div>
        <h3 class="text-base font-bold text-foreground mb-1">Design System & Shell</h3>
        <p class="text-xs text-muted-foreground leading-relaxed">
          Clean modern minimalist design tokens, responsive layout, Svelte 5 runes, strict TypeScript, and light/dark theme switching.
        </p>
      </div>
      <div class="mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
        <Check class="w-3.5 h-3.5" aria-hidden="true" />
        <span>Setup verified & active</span>
      </div>
    </div>

    <!-- Card 2: Upcoming Phase 2 -->
    <div class="rounded-xl border border-border bg-surface p-5 flex flex-col justify-between hover:border-border-strong transition-colors">
      <div>
        <div class="flex items-center justify-between mb-2">
          <Badge variant="neutral">Upcoming</Badge>
          <span class="text-xs font-mono text-muted-foreground">Phase 2</span>
        </div>
        <h3 class="text-base font-bold text-foreground/90 mb-1">Color Picker & Inspector</h3>
        <p class="text-xs text-muted-foreground leading-relaxed">
          The Color API integration (`/id` endpoint), interactive hex picker, format converters (HEX, RGB, HSL, HSV, CMYK).
        </p>
      </div>
      <div class="mt-4 pt-3 border-t border-border text-[11px] font-mono text-muted-foreground">
        Planned next in roadmap
      </div>
    </div>

    <!-- Card 3: Upcoming Phase 3 -->
    <div class="rounded-xl border border-border bg-surface p-5 flex flex-col justify-between hover:border-border-strong transition-colors">
      <div>
        <div class="flex items-center justify-between mb-2">
          <Badge variant="neutral">Upcoming</Badge>
          <span class="text-xs font-mono text-muted-foreground">Phase 3</span>
        </div>
        <h3 class="text-base font-bold text-foreground/90 mb-1">Scheme Generator</h3>
        <p class="text-xs text-muted-foreground leading-relaxed">
          Monochromatic, analogous, complementary, and triadic schemes via The Color API `/scheme` endpoint with spacebar shortcut.
        </p>
      </div>
      <div class="mt-4 pt-3 border-t border-border text-[11px] font-mono text-muted-foreground">
        Planned in roadmap
      </div>
    </div>
  </div>
</section>
