<script lang="ts">
  import Sliders from 'lucide-svelte/icons/sliders';
  import Info from 'lucide-svelte/icons/info';
  import type {
    ExportFormat,
    CssVariableOptions,
    CssClassOptions,
    TailwindExportOptions,
    TailwindVersion,
    JsonExportOptions,
    SvgExportOptions,
  } from '../../types/export';
  import { getTailwindFormatDescription } from '../../services/export/tailwind-export';

  interface Props {
    format: ExportFormat;
    cssVarOptions: CssVariableOptions;
    cssClassOptions: CssClassOptions;
    tailwindOptions: TailwindExportOptions;
    jsonOptions: JsonExportOptions;
    svgOptions: SvgExportOptions;
    onupdateCssVar: (opts: CssVariableOptions) => void;
    onupdateCssClass: (opts: CssClassOptions) => void;
    onupdateTailwind: (opts: TailwindExportOptions) => void;
    onupdateJson: (opts: JsonExportOptions) => void;
    onupdateSvg: (opts: SvgExportOptions) => void;
  }

  let {
    format,
    cssVarOptions,
    cssClassOptions,
    tailwindOptions,
    jsonOptions,
    svgOptions,
    onupdateCssVar,
    onupdateCssClass,
    onupdateTailwind,
    onupdateJson,
    onupdateSvg,
  }: Props = $props();

  const tailwindVersions: Array<{ id: TailwindVersion; label: string }> = [
    { id: 'v4', label: 'Tailwind v4 (CSS @theme)' },
    { id: 'v3-js', label: 'Tailwind v3 (ESM JS)' },
    { id: 'v3-ts', label: 'Tailwind v3 (TypeScript)' },
    { id: 'v3-cjs', label: 'Tailwind v3 (CommonJS)' },
  ];
</script>

<div class="rounded-2xl border border-border bg-surface p-4 shadow-sm space-y-4">
  <div class="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
    <Sliders class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
    <span>Format Options & Settings</span>
  </div>

  <!-- CSS Variables Options -->
  {#if format === 'css-variables'}
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="space-y-1">
        <label for="css-var-prefix" class="text-xs font-mono text-muted-foreground">Variable Prefix:</label>
        <input
          id="css-var-prefix"
          type="text"
          value={cssVarOptions.prefix}
          oninput={(e) => onupdateCssVar({ ...cssVarOptions, prefix: (e.target as HTMLInputElement).value })}
          placeholder="color"
          class="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <span class="text-[10px] font-mono text-muted-foreground block">e.g. --{cssVarOptions.prefix || 'custom'}-primary</span>
      </div>

      <div class="space-y-1">
        <label for="css-var-selector" class="text-xs font-mono text-muted-foreground">CSS Selector:</label>
        <input
          id="css-var-selector"
          type="text"
          value={cssVarOptions.selector}
          oninput={(e) => onupdateCssVar({ ...cssVarOptions, selector: (e.target as HTMLInputElement).value })}
          placeholder=":root"
          class="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <span class="text-[10px] font-mono text-muted-foreground block">Scope selector block</span>
      </div>

      <div class="flex items-center sm:pt-5">
        <label class="flex items-center gap-2 cursor-pointer text-xs font-mono text-foreground">
          <input
            type="checkbox"
            checked={cssVarOptions.lowercase}
            onchange={(e) => onupdateCssVar({ ...cssVarOptions, lowercase: (e.target as HTMLInputElement).checked })}
            class="rounded border-border text-accent focus:ring-accent"
          />
          <span>Lowercase names</span>
        </label>
      </div>
    </div>

  <!-- CSS Classes Options -->
  {:else if format === 'css-classes'}
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="space-y-1">
        <label for="css-class-prefix" class="text-xs font-mono text-muted-foreground">Class Prefix:</label>
        <input
          id="css-class-prefix"
          type="text"
          value={cssClassOptions.prefix}
          oninput={(e) => onupdateCssClass({ ...cssClassOptions, prefix: (e.target as HTMLInputElement).value })}
          placeholder="color"
          class="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <span class="text-[10px] font-mono text-muted-foreground block">e.g. .{cssClassOptions.prefix || 'custom'}-primary</span>
      </div>

      <div class="space-y-1">
        <label for="css-class-mode" class="text-xs font-mono text-muted-foreground">Utility Mode:</label>
        <select
          id="css-class-mode"
          value={cssClassOptions.mode}
          onchange={(e) => onupdateCssClass({ ...cssClassOptions, mode: (e.target as HTMLSelectElement).value as 'both' | 'text-only' | 'bg-only' })}
          class="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
        >
          <option value="both">Both (color + background-color)</option>
          <option value="text-only">Text Color Only (.name)</option>
          <option value="bg-only">Background Color Only (.name-background)</option>
        </select>
        <span class="text-[10px] font-mono text-muted-foreground block">CSS property declarations</span>
      </div>

      <div class="flex items-center sm:pt-5">
        <label class="flex items-center gap-2 cursor-pointer text-xs font-mono text-foreground">
          <input
            type="checkbox"
            checked={cssClassOptions.lowercase}
            onchange={(e) => onupdateCssClass({ ...cssClassOptions, lowercase: (e.target as HTMLInputElement).checked })}
            class="rounded border-border text-accent focus:ring-accent"
          />
          <span>Lowercase class names</span>
        </label>
      </div>
    </div>

  <!-- Tailwind CSS Options -->
  {:else if format === 'tailwind'}
    <div class="space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="space-y-1">
          <label for="tailwind-version-select" class="text-xs font-mono text-muted-foreground">Tailwind Version & Format:</label>
          <select
            id="tailwind-version-select"
            value={tailwindOptions.version}
            onchange={(e) => onupdateTailwind({ ...tailwindOptions, version: (e.target as HTMLSelectElement).value as TailwindVersion })}
            class="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
          >
            {#each tailwindVersions as v (v.id)}
              <option value={v.id}>{v.label}</option>
            {/each}
          </select>
        </div>

        <div class="space-y-1">
          <label for="tailwind-prefix-input" class="text-xs font-mono text-muted-foreground">Optional Prefix:</label>
          <input
            id="tailwind-prefix-input"
            type="text"
            value={tailwindOptions.prefix}
            oninput={(e) => onupdateTailwind({ ...tailwindOptions, prefix: (e.target as HTMLInputElement).value })}
            placeholder="e.g. brand (optional)"
            class="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      <!-- Explainer banner -->
      <div class="p-3 rounded-xl bg-background border border-border flex items-start gap-2.5 text-xs font-mono text-muted-foreground">
        <Info class="w-4 h-4 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <strong class="text-foreground block font-bold mb-0.5">Format Guide:</strong>
          <span>{getTailwindFormatDescription(tailwindOptions.version)}</span>
        </div>
      </div>
    </div>

  <!-- JSON Options -->
  {:else if format === 'json'}
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="flex items-center pt-2">
        <label class="flex items-center gap-2 cursor-pointer text-xs font-mono text-foreground">
          <input
            type="checkbox"
            checked={jsonOptions.includeAllFormats}
            onchange={(e) => onupdateJson({ ...jsonOptions, includeAllFormats: (e.target as HTMLInputElement).checked })}
            class="rounded border-border text-accent focus:ring-accent"
          />
          <span>Include all color models (RGB, HSL, HSV, CMYK)</span>
        </label>
      </div>

      <div class="space-y-1">
        <label for="json-indent-select" class="text-xs font-mono text-muted-foreground">JSON Indentation:</label>
        <select
          id="json-indent-select"
          value={jsonOptions.indent}
          onchange={(e) => onupdateJson({ ...jsonOptions, indent: Number((e.target as HTMLSelectElement).value) })}
          class="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
        >
          <option value="2">2 spaces (compact)</option>
          <option value="4">4 spaces (readable)</option>
        </select>
      </div>
    </div>

  <!-- SVG Preview Options -->
  {:else if format === 'svg'}
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="space-y-1">
        <label for="svg-layout-select" class="text-xs font-mono text-muted-foreground">Swatch Orientation:</label>
        <select
          id="svg-layout-select"
          value={svgOptions.layout}
          onchange={(e) => onupdateSvg({ ...svgOptions, layout: (e.target as HTMLSelectElement).value as 'horizontal' | 'vertical' })}
          class="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
        >
          <option value="horizontal">Horizontal (Side-by-side)</option>
          <option value="vertical">Vertical (Stacked list)</option>
        </select>
      </div>

      <div class="flex items-center pt-3 sm:pt-5">
        <label class="flex items-center gap-2 cursor-pointer text-xs font-mono text-foreground">
          <input
            type="checkbox"
            checked={svgOptions.showLabels}
            onchange={(e) => onupdateSvg({ ...svgOptions, showLabels: (e.target as HTMLInputElement).checked })}
            class="rounded border-border text-accent focus:ring-accent"
          />
          <span>Render HEX color labels</span>
        </label>
      </div>

      <div class="flex items-center pt-3 sm:pt-5">
        <label class="flex items-center gap-2 cursor-pointer text-xs font-mono text-foreground">
          <input
            type="checkbox"
            checked={svgOptions.showColorNames}
            onchange={(e) => onupdateSvg({ ...svgOptions, showColorNames: (e.target as HTMLInputElement).checked })}
            class="rounded border-border text-accent focus:ring-accent"
          />
          <span>Render color names</span>
        </label>
      </div>
    </div>
  {/if}
</div>
