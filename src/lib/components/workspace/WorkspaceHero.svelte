<script lang="ts">
  import Check from 'lucide-svelte/icons/check';
  import Sparkles from 'lucide-svelte/icons/sparkles';
  import RefreshCw from 'lucide-svelte/icons/refresh-cw';
  import Palette from 'lucide-svelte/icons/palette';
  import Search from 'lucide-svelte/icons/search';
  import ArrowRightLeft from 'lucide-svelte/icons/arrow-right-left';
  import Eye from 'lucide-svelte/icons/eye';
  import Layers from 'lucide-svelte/icons/layers';
  import Download from 'lucide-svelte/icons/download';
  import Button from '../ui/Button.svelte';
  import Badge from '../ui/Badge.svelte';
  import ExportWorkspace from '../export/ExportWorkspace.svelte';
  import ColorInspector from '../color/ColorInspector.svelte';
  import SchemeGenerator from '../scheme/SchemeGenerator.svelte';
  import ColorConverter from '../converter/ColorConverter.svelte';
  import ContrastChecker from '../contrast/ContrastChecker.svelte';
  import PaletteManager from '../palette/PaletteManager.svelte';
  import SavePaletteDialog from '../palette/SavePaletteDialog.svelte';
  import ColorSwatchPreview from './ColorSwatchPreview.svelte';
  import type { PreviewPalette } from '../../types';

  interface Props {
    activeNav?: string;
    onselectSection?: (id: string) => void;
  }

  let { activeNav = 'export', onselectSection }: Props = $props();

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
  let activeConverterHex = $state('7C83FD');
  let activeContrastFg = $state('#191919');
  let activeContrastBg = $state('#FFFFFF');
  let currentSchemeColors = $state<Array<{ hex: string; name?: string }>>([
    { hex: '#4F46E5', name: 'Electric Iris' },
    { hex: '#818CF8', name: 'Soft Indigo' },
    { hex: '#C7D2FE', name: 'Lavender Mist' },
    { hex: '#F43F5E', name: 'Coral Rose' },
    { hex: '#10B981', name: 'Emerald Spark' },
  ]);

  // External save palette dialog trigger
  let isSavePaletteOpen = $state(false);
  let savePaletteColors = $state<Array<{ hex: string; name?: string }>>([]);
  let savePaletteName = $state('');

  const currentPalette = $derived(previewPalettes[selectedPaletteIndex] ?? previewPalettes[0]!);

  function cyclePresetPalette() {
    selectedPaletteIndex = (selectedPaletteIndex + 1) % previewPalettes.length;
  }

  function handleSelectColorFromSwatch(hex: string) {
    const clean = hex.replace(/^#/, '');
    activeInspectHex = clean;
    activeConverterHex = clean;
    activeContrastFg = hex;
    const inspectorElem = document.getElementById('inspector-section') || document.getElementById('color-inspector-section');
    if (inspectorElem) {
      inspectorElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleInspectColorFromScheme(cleanHex: string) {
    activeInspectHex = cleanHex;
    activeConverterHex = cleanHex;
    activeContrastFg = '#' + cleanHex;
    const inspectorElem = document.getElementById('inspector-section') || document.getElementById('color-inspector-section');
    if (inspectorElem) {
      inspectorElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleInspectColorFromConverter(cleanHex: string) {
    activeInspectHex = cleanHex;
    activeContrastFg = '#' + cleanHex;
    const inspectorElem = document.getElementById('inspector-section') || document.getElementById('color-inspector-section');
    if (inspectorElem) {
      inspectorElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleInspectColorFromContrast(cleanHex: string) {
    activeInspectHex = cleanHex;
    activeConverterHex = cleanHex;
    const inspectorElem = document.getElementById('inspector-section') || document.getElementById('color-inspector-section');
    if (inspectorElem) {
      inspectorElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleInspectColorFromPalette(cleanHex: string) {
    activeInspectHex = cleanHex;
    activeConverterHex = cleanHex;
    activeContrastFg = '#' + cleanHex;
    const inspectorElem = document.getElementById('inspector-section') || document.getElementById('color-inspector-section');
    if (inspectorElem) {
      inspectorElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleContrastColorFromPalette(hex: string, role: 'fg' | 'bg') {
    if (role === 'fg') {
      activeContrastFg = hex;
    } else {
      activeContrastBg = hex;
    }
    const contrastElem = document.getElementById('contrast-section') || document.getElementById('contrast');
    if (contrastElem) {
      contrastElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleConvertColorFromPalette(cleanHex: string) {
    activeConverterHex = cleanHex;
    const converterElem = document.getElementById('converter-section') || document.getElementById('converter');
    if (converterElem) {
      converterElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleSaveFromScheme(colors: Array<{ hex: string; name?: string }>, title?: string) {
    savePaletteColors = colors;
    savePaletteName = title || 'Harmonic Scheme';
    isSavePaletteOpen = true;
  }

  function handleSaveFromInspector(color: { hex: string; name?: string }) {
    savePaletteColors = [color];
    savePaletteName = color.name ? `${color.name} Palette` : 'Inspected Color';
    isSavePaletteOpen = true;
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
      <span class="flex h-2 w-2 rounded-full bg-accent" aria-hidden="true"></span>
      <span class="text-xs font-mono text-muted-foreground">Explore colors. Build harmony.</span>
      <span class="text-xs font-mono text-muted-foreground">•</span>
      <span class="text-xs font-mono text-foreground font-semibold">Studio Edition</span>
    </div>

    <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
      Explore colors. Build harmony.
    </h1>

    <p class="text-base sm:text-lg text-muted-foreground leading-relaxed">
      A complete color suite for palette exploration, harmony schemes, format conversions, WCAG accessibility checks, and production code export.
    </p>

    <!-- Quick Tool Switcher Pills -->
    <div class="pt-2 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onclick={() => scrollToSection('export')}
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {activeNav === 'export' ? 'bg-surface border-border-strong text-foreground shadow-neo' : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-surface'}"
      >
        <Download class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span>Export & Dev Tools</span>
      </button>

      <button
        type="button"
        onclick={() => scrollToSection('collections')}
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {activeNav === 'collections' ? 'bg-surface border-border-strong text-foreground shadow-neo' : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-surface'}"
      >
        <Layers class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span>Palettes & Collections</span>
      </button>

      <button
        type="button"
        onclick={() => scrollToSection('contrast')}
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {activeNav === 'contrast' ? 'bg-surface border-border-strong text-foreground shadow-neo' : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-surface'}"
      >
        <Eye class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span>Contrast Checker</span>
      </button>

      <button
        type="button"
        onclick={() => scrollToSection('converter')}
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {activeNav === 'converter' ? 'bg-surface border-border-strong text-foreground shadow-neo' : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-surface'}"
      >
        <ArrowRightLeft class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span>Color Converter</span>
      </button>

      <button
        type="button"
        onclick={() => scrollToSection('generator')}
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {activeNav === 'generator' ? 'bg-surface border-border-strong text-foreground shadow-neo' : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-surface'}"
      >
        <Palette class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span>Scheme Generator</span>
      </button>

      <button
        type="button"
        onclick={() => scrollToSection('inspector')}
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {activeNav === 'inspector' ? 'bg-surface border-border-strong text-foreground shadow-neo' : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-surface'}"
      >
        <Search class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span>Color Inspector</span>
      </button>
    </div>
  </div>

  <!-- Primary Feature: Export & Developer Tools -->
  <div id="export-section" class="scroll-mt-24 space-y-3">
    <ExportWorkspace
      schemeColors={currentSchemeColors}
      inspectorHex={activeInspectHex}
    />
  </div>

  <!-- Secondary Feature: Palette Management & Collections -->
  <div id="collections-section" class="scroll-mt-24 pt-8 border-t border-border space-y-3">
    <div class="flex items-center justify-between border-b border-border pb-2">
      <div>
        <h2 class="text-lg font-bold text-foreground flex items-center gap-2">
          <Layers class="w-5 h-5 text-accent" aria-hidden="true" />
          <span>Palettes & Collections Management</span>
        </h2>
        <p class="text-xs text-muted-foreground mt-0.5">
          Organize saved palettes, create collections, search, filter, and modify color order.
        </p>
      </div>

      <Badge variant="neutral" size="sm">Library</Badge>
    </div>

    <PaletteManager
      oninspectColor={handleInspectColorFromPalette}
      oncontrastColor={handleContrastColorFromPalette}
      onconvertColor={handleConvertColorFromPalette}
    />
  </div>

  <!-- Tertiary Feature: Contrast & Accessibility Checker -->
  <div id="contrast-section" class="scroll-mt-24 pt-8 border-t border-border space-y-3">
    <div class="flex items-center justify-between border-b border-border pb-2">
      <div>
        <h2 class="text-lg font-bold text-foreground flex items-center gap-2">
          <Eye class="w-5 h-5 text-accent" aria-hidden="true" />
          <span>Contrast & Accessibility Checker</span>
        </h2>
        <p class="text-xs text-muted-foreground mt-0.5">
          Evaluate foreground and background readability against WCAG 2.2 standards with live preview and smart recommendations.
        </p>
      </div>

      <Badge variant="neutral" size="sm">WCAG 2.2</Badge>
    </div>

    <ContrastChecker
      initialForegroundHex={activeContrastFg}
      initialBackgroundHex={activeContrastBg}
      oninspectColor={handleInspectColorFromContrast}
    />
  </div>

  <!-- Quaternary Feature: Color Converter -->
  <div id="converter-section" class="scroll-mt-24 pt-8 border-t border-border space-y-3">
    <div class="flex items-center justify-between border-b border-border pb-2">
      <div>
        <h2 class="text-lg font-bold text-foreground flex items-center gap-2">
          <ArrowRightLeft class="w-5 h-5 text-accent" aria-hidden="true" />
          <span>Color Converter</span>
        </h2>
        <p class="text-xs text-muted-foreground mt-0.5">
          Real-time bi-directional conversion between HEX, RGB, HSL, HSV, and CMYK formats.
        </p>
      </div>

      <Badge variant="neutral" size="sm">Multi-format</Badge>
    </div>

    <ColorConverter
      bind:initialHex={activeConverterHex}
      oninspectColor={handleInspectColorFromConverter}
    />
  </div>

  <!-- Quinary Feature: Color Scheme Generator -->
  <div id="generator-section" class="scroll-mt-24 pt-8 border-t border-border space-y-3">
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

      <Badge variant="neutral" size="sm">Harmonies</Badge>
    </div>

    <SchemeGenerator
      initialHex={activeSchemeHex}
      inspectorHex={activeInspectHex}
      oninspectColor={handleInspectColorFromScheme}
      onsavePalette={handleSaveFromScheme}
      oncolorsChange={(colors) => (currentSchemeColors = colors)}
    />
  </div>

  <!-- Senary Feature: Color Picker & Inspector -->
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

      <Badge variant="neutral" size="sm">Inspector</Badge>
    </div>

    <ColorInspector
      bind:initialHex={activeInspectHex}
      onsavePalette={handleSaveFromInspector}
    />
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
          Click any swatch to load into Color Inspector, Color Converter, and Contrast Checker.
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

  <!-- Product Feature Highlights -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-border">
    <div class="rounded-xl border border-border bg-surface p-4 shadow-sm flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-2">
          <Badge variant="accent">Design</Badge>
          <Palette class="w-4 h-4 text-accent" aria-hidden="true" />
        </div>
        <h3 class="text-sm font-bold text-foreground mb-1">Color Schemes & Harmonies</h3>
        <p class="text-xs text-muted-foreground leading-relaxed">
          Generate balanced palettes using classical color theory including complementary, analogous, triadic, and monochromatic schemes.
        </p>
      </div>
      <div class="mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-xs font-mono text-accent font-medium">
        <Sparkles class="w-3.5 h-3.5" aria-hidden="true" />
        <span>Instant Harmonies</span>
      </div>
    </div>

    <div class="rounded-xl border border-border bg-surface p-4 shadow-sm flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-2">
          <Badge variant="accent">Accessibility</Badge>
          <Eye class="w-4 h-4 text-accent" aria-hidden="true" />
        </div>
        <h3 class="text-sm font-bold text-foreground mb-1">Contrast & Readability</h3>
        <p class="text-xs text-muted-foreground leading-relaxed">
          Verify contrast compliance with WCAG 2.2 AA and AAA standards with live text previews and automated contrast improvements.
        </p>
      </div>
      <div class="mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-xs font-mono text-accent font-medium">
        <Check class="w-3.5 h-3.5" aria-hidden="true" />
        <span>WCAG 2.2 Verified</span>
      </div>
    </div>

    <div class="rounded-xl border border-border bg-surface p-4 shadow-sm flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-2">
          <Badge variant="accent">Precision</Badge>
          <ArrowRightLeft class="w-4 h-4 text-accent" aria-hidden="true" />
        </div>
        <h3 class="text-sm font-bold text-foreground mb-1">Format Conversion</h3>
        <p class="text-xs text-muted-foreground leading-relaxed">
          Convert color values seamlessly between HEX, RGB, HSL, HSV, CMYK, and CSS formats with instant copy support.
        </p>
      </div>
      <div class="mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-xs font-mono text-accent font-medium">
        <Check class="w-3.5 h-3.5" aria-hidden="true" />
        <span>Multi-format Ready</span>
      </div>
    </div>

    <div class="rounded-xl border border-border bg-surface p-4 shadow-sm flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-2">
          <Badge variant="accent">Export</Badge>
          <Download class="w-4 h-4 text-accent" aria-hidden="true" />
        </div>
        <h3 class="text-sm font-bold text-foreground mb-1">Developer Code Export</h3>
        <p class="text-xs text-muted-foreground leading-relaxed">
          Export production-ready tokens and stylesheets for Tailwind CSS, CSS Custom Properties, JSON design tokens, and vector SVGs.
        </p>
      </div>
      <div class="mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-xs font-mono text-accent font-medium">
        <Check class="w-3.5 h-3.5" aria-hidden="true" />
        <span>Tailwind & CSS Tokens</span>
      </div>
    </div>
  </div>
</section>

<!-- Global Context Save Palette Dialog -->
<SavePaletteDialog
  isOpen={isSavePaletteOpen}
  onclose={() => (isSavePaletteOpen = false)}
  initialColors={savePaletteColors}
  initialName={savePaletteName}
/>
