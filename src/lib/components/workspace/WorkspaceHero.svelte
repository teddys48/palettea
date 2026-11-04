<script lang="ts">
  import Check from 'lucide-svelte/icons/check';
  import Sparkles from 'lucide-svelte/icons/sparkles';
  import RefreshCw from 'lucide-svelte/icons/refresh-cw';
  import Palette from 'lucide-svelte/icons/palette';
  import Search from 'lucide-svelte/icons/search';
  import Button from '../ui/Button.svelte';
  import Badge from '../ui/Badge.svelte';
  import ColorInspector from '../color/ColorInspector.svelte';
  import SchemeGenerator from '../scheme/SchemeGenerator.svelte';
  import ColorSwatchPreview from './ColorSwatchPreview.svelte';
  import type { PreviewPalette } from '../../types';

  interface Props {
    activeNav?: string;
    onselectSection?: (id: string) => void;
  }

  let { activeNav = 'generator', onselectSection }: Props = $props();

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
  let activeInspectHex = $state('4F46E5');
  let activeSchemeHex = $state('4F46E5');

  const currentPalette = $derived(previewPalettes[selectedPaletteIndex] ?? previewPalettes[0]!);

  function cyclePresetPalette() {
    selectedPaletteIndex = (selectedPaletteIndex + 1) % previewPalettes.length;
  }

  function handleSelectColorFromSwatch(hex: string) {
    activeInspectHex = hex;
    const inspectorElem = document.getElementById('inspector-section') || document.getElementById('color-inspector-section');
    if (inspectorElem) {
      inspectorElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleInspectColorFromScheme(cleanHex: string) {
    activeInspectHex = cleanHex;
    const inspectorElem = document.getElementById('inspector-section') || document.getElementById('color-inspector-section');
    if (inspectorElem) {
      inspectorElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function scrollToSection(id: string) {
    if (onselectSection) {
      onselectSection(id);
    } else {
      const target = document.getElementById(`${id}-section`) || document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
</script>

<section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-12">
  <!-- Top Hero Header -->
  <div class="text-center max-w-3xl mx-auto space-y-4">
    <div class="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 shadow-sm">
      <span class="flex h-2 w-2 rounded-full bg-accent animate-ping" aria-hidden="true"></span>
      <span class="text-xs font-mono text-muted-foreground">Explore colors. Build harmony.</span>
      <span class="text-xs font-mono text-muted-foreground">•</span>
      <span class="text-xs font-mono text-foreground font-semibold">Phase 3 Active</span>
    </div>

    <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
      Build harmony. Explore color schemes.
    </h1>

    <p class="text-base sm:text-lg text-muted-foreground leading-relaxed">
      Generate complementary, analogous, triadic, split-complementary, and monochromatic color schemes from any base hue. Powered by The Color API with zero-layout-shift and instant clipboard copy.
    </p>

    <!-- Quick Tool Switcher Pills -->
    <div class="pt-2 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onclick={() => scrollToSection('generator')}
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {activeNav === 'generator' ? 'bg-surface border-border-strong text-foreground shadow-neo' : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-surface'}"
      >
        <Palette class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span>Scheme Generator</span>
        <span class="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-accent/15 text-accent font-bold">
          Phase 3
        </span>
      </button>

      <button
        type="button"
        onclick={() => scrollToSection('inspector')}
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {activeNav === 'inspector' ? 'bg-surface border-border-strong text-foreground shadow-neo' : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-surface'}"
      >
        <Search class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span>Color Inspector</span>
        <span class="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-muted-foreground">
          Phase 2
        </span>
      </button>
    </div>
  </div>

  <!-- Primary Feature: Color Scheme Generator (Phase 3) -->
  <div id="generator-section" class="scroll-mt-24 space-y-3">
    <div class="flex items-center justify-between border-b border-border pb-2">
      <div>
        <h2 class="text-lg font-bold text-foreground flex items-center gap-2">
          <Palette class="w-5 h-5 text-accent" aria-hidden="true" />
          <span>Color Scheme Generator</span>
        </h2>
        <p class="text-xs text-muted-foreground mt-0.5">
          Select base color, harmony mode, and palette size to generate matching swatches.
        </p>
      </div>

      <Badge variant="accent" size="sm">Phase 3</Badge>
    </div>

    <SchemeGenerator
      initialHex={activeSchemeHex}
      inspectorHex={activeInspectHex}
      oninspectColor={handleInspectColorFromScheme}
    />
  </div>

  <!-- Secondary Feature: Color Picker & Inspector (Phase 2) -->
  <div id="inspector-section" class="scroll-mt-24 pt-8 border-t border-border space-y-4">
    <div id="color-inspector-section" class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
      <div>
        <h2 class="text-lg font-bold text-foreground flex items-center gap-2">
          <Search class="w-5 h-5 text-accent" aria-hidden="true" />
          <span>Color Inspector & Formats</span>
        </h2>
        <p class="text-xs text-muted-foreground mt-0.5">
          Inspect color representations across HEX, RGB, HSL, HSV, CMYK, and XYZ formats.
        </p>
      </div>

      <Badge variant="neutral" size="sm">Phase 2</Badge>
    </div>

    <ColorInspector initialHex={activeInspectHex} />
  </div>

  <!-- Curated Preset Palettes Section -->
  <div id="inspirations-section" class="space-y-4 pt-6 border-t border-border">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-base font-bold text-foreground flex items-center gap-2">
          <Sparkles class="w-4 h-4 text-accent" aria-hidden="true" />
          <span>Curated Inspirations</span>
        </h2>
        <p class="text-xs text-muted-foreground mt-0.5">
          Click any swatch to inspect its format breakdown in the Color Inspector above.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <!-- Preset Selector Pills -->
        <div class="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-background border border-border">
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

        <Button
          variant="secondary"
          size="sm"
          onclick={cyclePresetPalette}
          title="Switch to next curated palette"
          aria-label="Switch curated palette preset"
        >
          <RefreshCw class="w-3.5 h-3.5" aria-hidden="true" />
          <span class="hidden sm:inline">Next Preset</span>
        </Button>
      </div>
    </div>

    <ColorSwatchPreview
      colors={currentPalette.colors}
      paletteName={currentPalette.title}
      paletteTag={currentPalette.tag}
      onselectColor={handleSelectColorFromSwatch}
    />
  </div>

  <!-- Roadmap Context Cards -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t border-border">
    <!-- Card 1: Phase 1 Complete -->
    <div class="rounded-xl border border-border bg-surface p-4 shadow-sm flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-2">
          <Badge variant="neutral">Completed</Badge>
          <span class="text-xs font-mono text-muted-foreground">Phase 1</span>
        </div>
        <h3 class="text-sm font-bold text-foreground mb-1">Design System & Shell</h3>
        <p class="text-xs text-muted-foreground leading-relaxed">
          Modern minimalist tokens, responsive layout, Svelte 5 runes, strict TypeScript, light/dark theme.
        </p>
      </div>
      <div class="mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
        <Check class="w-3.5 h-3.5" aria-hidden="true" />
        <span>Verified</span>
      </div>
    </div>

    <!-- Card 2: Phase 2 Complete -->
    <div class="rounded-xl border border-border bg-surface p-4 shadow-sm flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-2">
          <Badge variant="neutral">Completed</Badge>
          <span class="text-xs font-mono text-muted-foreground">Phase 2</span>
        </div>
        <h3 class="text-sm font-bold text-foreground mb-1">Color Picker & Inspector</h3>
        <p class="text-xs text-muted-foreground leading-relaxed">
          The Color API `/id` endpoint, interactive HEX picker, format converters (HEX, RGB, HSL, HSV, CMYK, XYZ).
        </p>
      </div>
      <div class="mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
        <Check class="w-3.5 h-3.5" aria-hidden="true" />
        <span>Verified with tests</span>
      </div>
    </div>

    <!-- Card 3: Phase 3 Active -->
    <div class="rounded-xl border-2 border-indigo-500/80 dark:border-indigo-500 bg-surface p-4 shadow-neo flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-2">
          <Badge variant="accent">Phase 3 Active</Badge>
          <span class="text-xs font-mono text-muted-foreground">Generator</span>
        </div>
        <h3 class="text-sm font-bold text-foreground mb-1">Color Scheme Generator</h3>
        <p class="text-xs text-muted-foreground leading-relaxed">
          The Color API `/scheme` endpoint, harmony modes (Complementary, Analogous, Triadic, Split, Monochrome), Space shortcut.
        </p>
      </div>
      <div class="mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
        <Check class="w-3.5 h-3.5" aria-hidden="true" />
        <span>Live & verified with tests</span>
      </div>
    </div>

    <!-- Card 4: Upcoming Phase 4 -->
    <div class="rounded-xl border border-border bg-surface p-4 flex flex-col justify-between hover:border-border-strong transition-colors">
      <div>
        <div class="flex items-center justify-between mb-2">
          <Badge variant="neutral">Upcoming</Badge>
          <span class="text-xs font-mono text-muted-foreground">Phase 4</span>
        </div>
        <h3 class="text-sm font-bold text-foreground/90 mb-1">Color Converter</h3>
        <p class="text-xs text-muted-foreground leading-relaxed">
          Interactive real-time conversion and input validation between HEX, RGB, HSL, HSV, CMYK.
        </p>
      </div>
      <div class="mt-4 pt-3 border-t border-border text-[11px] font-mono text-muted-foreground">
        Planned in next roadmap phase
      </div>
    </div>
  </div>
</section>
