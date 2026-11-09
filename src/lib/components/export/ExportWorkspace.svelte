<script lang="ts">
  import Download from 'lucide-svelte/icons/download';
  import Code from 'lucide-svelte/icons/code';
  import Sliders from 'lucide-svelte/icons/sliders';
  import Badge from '../ui/Badge.svelte';

  import ExportSourceSelector from './ExportSourceSelector.svelte';
  import ExportFormatSelector from './ExportFormatSelector.svelte';
  import ExportOptions from './ExportOptions.svelte';
  import ExportPreview from './ExportPreview.svelte';
  import ExportActions from './ExportActions.svelte';
  import ColorTokenGenerator from './ColorTokenGenerator.svelte';
  import ColorCodeGenerator from './ColorCodeGenerator.svelte';

  import { exportCssVariables, DEFAULT_CSS_VARIABLE_OPTIONS } from '../../services/export/css-export';
  import { exportCssClasses, DEFAULT_CSS_CLASS_OPTIONS } from '../../services/export/css-export';
  import { exportTailwindConfig, DEFAULT_TAILWIND_OPTIONS } from '../../services/export/tailwind-export';
  import { exportJsonPalette, DEFAULT_JSON_OPTIONS } from '../../services/export/json-export';
  import { exportSvgPalette, DEFAULT_SVG_OPTIONS } from '../../services/export/svg-export';

  import type {
    ExportFormat,
    ExportPayload,
    CssVariableOptions,
    CssClassOptions,
    TailwindExportOptions,
    JsonExportOptions,
    SvgExportOptions,
  } from '../../types/export';

  interface Props {
    schemeColors?: Array<{ hex: string; name?: string }>;
    inspectorHex?: string;
  }

  let {
    schemeColors = [
      { hex: '#4F46E5', name: 'Electric Iris' },
      { hex: '#818CF8', name: 'Soft Indigo' },
      { hex: '#C7D2FE', name: 'Lavender Mist' },
      { hex: '#F43F5E', name: 'Coral Rose' },
      { hex: '#10B981', name: 'Emerald Spark' },
    ],
    inspectorHex = '4F46E5',
  }: Props = $props();

  // Active top-level developer tool mode
  let activeToolTab = $state<'export' | 'tokens' | 'converter'>('export');

  // Active export payload state
  let currentPayload = $state<ExportPayload>({
    name: 'Dawn Harmony',
    description: 'Palettea core aesthetic palette',
    colors: [
      { hex: '#191919', name: 'Ink Obsidian' },
      { hex: '#4F46E5', name: 'Electric Iris' },
      { hex: '#93C5FD', name: 'Periwinkle Cloud' },
      { hex: '#38BDF8', name: 'Cyan Glow' },
      { hex: '#FAF9F6', name: 'Alabaster Canvas' },
    ],
  });

  // Selected Export Format
  let selectedFormat = $state<ExportFormat>('css-variables');

  // Format-specific options
  let cssVarOptions = $state<CssVariableOptions>({ ...DEFAULT_CSS_VARIABLE_OPTIONS });
  let cssClassOptions = $state<CssClassOptions>({ ...DEFAULT_CSS_CLASS_OPTIONS });
  let tailwindOptions = $state<TailwindExportOptions>({ ...DEFAULT_TAILWIND_OPTIONS });
  let jsonOptions = $state<JsonExportOptions>({ ...DEFAULT_JSON_OPTIONS });
  let svgOptions = $state<SvgExportOptions>({ ...DEFAULT_SVG_OPTIONS });

  // Computed generated code
  const generatedCode = $derived.by(() => {
    switch (selectedFormat) {
      case 'css-variables':
        return exportCssVariables(currentPayload, cssVarOptions);
      case 'css-classes':
        return exportCssClasses(currentPayload, cssClassOptions);
      case 'tailwind':
        return exportTailwindConfig(currentPayload, tailwindOptions);
      case 'json':
        return exportJsonPalette(currentPayload, jsonOptions);
      case 'svg':
        return exportSvgPalette(currentPayload, svgOptions);
      default:
        return '';
    }
  });

  const lineCount = $derived(generatedCode.split('\n').length);
  const charCount = $derived(generatedCode.length);
</script>

<div class="space-y-8">
  <!-- Section Sub-Header & Developer Tool Tabs -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
    <div class="space-y-1">
      <div class="flex items-center gap-2">
        <Download class="w-5 h-5 text-accent" aria-hidden="true" />
        <h2 class="text-xl font-bold tracking-tight text-foreground">
          Export & Developer Tools
        </h2>
        <Badge variant="accent" size="sm">Phase 7</Badge>
      </div>
      <p class="text-xs text-muted-foreground">
        Zero-backend local generators: CSS Custom Properties, Tailwind CSS (v4 & v3), valid JSON, and vector SVG swatches.
      </p>
    </div>

    <!-- Developer Tool Mode Tabs -->
    <div class="flex items-center gap-1.5 p-1 rounded-xl bg-background border border-border self-start sm:self-auto">
      <button
        type="button"
        onclick={() => (activeToolTab = 'export')}
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer {activeToolTab === 'export' ? 'bg-surface border border-border-strong text-foreground shadow-neo' : 'text-muted-foreground hover:text-foreground'}"
      >
        <Download class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span>Palette Export</span>
      </button>

      <button
        type="button"
        onclick={() => (activeToolTab = 'tokens')}
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer {activeToolTab === 'tokens' ? 'bg-surface border border-border-strong text-foreground shadow-neo' : 'text-muted-foreground hover:text-foreground'}"
      >
        <Sliders class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span>Token Generator</span>
      </button>

      <button
        type="button"
        onclick={() => (activeToolTab = 'converter')}
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer {activeToolTab === 'converter' ? 'bg-surface border border-border-strong text-foreground shadow-neo' : 'text-muted-foreground hover:text-foreground'}"
      >
        <Code class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span>Color Code Tool</span>
      </button>
    </div>
  </div>

  <!-- Tab 1: Full Palette Export Workflow -->
  {#if activeToolTab === 'export'}
    <div class="space-y-6">
      <!-- 1. Color Source Selector -->
      <ExportSourceSelector
        payload={currentPayload}
        {schemeColors}
        {inspectorHex}
        onselectPayload={(p) => (currentPayload = p)}
      />

      <!-- 2. Format Selector -->
      <ExportFormatSelector
        {selectedFormat}
        onselectFormat={(f) => (selectedFormat = f)}
      />

      <!-- 3. Contextual Options for Format -->
      <ExportOptions
        format={selectedFormat}
        {cssVarOptions}
        {cssClassOptions}
        {tailwindOptions}
        {jsonOptions}
        {svgOptions}
        onupdateCssVar={(opts) => (cssVarOptions = opts)}
        onupdateCssClass={(opts) => (cssClassOptions = opts)}
        onupdateTailwind={(opts) => (tailwindOptions = opts)}
        onupdateJson={(opts) => (jsonOptions = opts)}
        onupdateSvg={(opts) => (svgOptions = opts)}
      />

      <!-- 4. Live Output Preview -->
      <ExportPreview
        code={generatedCode}
        format={selectedFormat}
        {lineCount}
        {charCount}
      />

      <!-- 5. Actions: Copy and Download -->
      <ExportActions
        code={generatedCode}
        paletteName={currentPayload.name}
        colors={currentPayload.colors}
        format={selectedFormat}
        tailwindVersion={tailwindOptions.version}
      />
    </div>

  <!-- Tab 2: Semantic Color Token Generator -->
  {:else if activeToolTab === 'tokens'}
    <div class="space-y-6">
      <ColorTokenGenerator
        colors={currentPayload.colors}
        paletteName={currentPayload.name}
      />
    </div>

  <!-- Tab 3: Color Code Generator -->
  {:else if activeToolTab === 'converter'}
    <div class="space-y-6">
      <ColorCodeGenerator
        colorHex={currentPayload.colors[0]?.hex || inspectorHex}
        colorName={currentPayload.colors[0]?.name || 'Selected Color'}
      />
    </div>
  {/if}
</div>
