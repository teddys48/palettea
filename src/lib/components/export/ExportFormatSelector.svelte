<script lang="ts">
  import type { ExportFormat } from '../../types/export';

  interface Props {
    selectedFormat: ExportFormat;
    onselectFormat: (format: ExportFormat) => void;
  }

  let { selectedFormat, onselectFormat }: Props = $props();

  interface FormatTabItem {
    id: ExportFormat;
    label: string;
    description: string;
    extension: string;
  }

  const formatTabs: FormatTabItem[] = [
    {
      id: 'css-variables',
      label: 'CSS Variables',
      description: ':root custom properties',
      extension: '.css',
    },
    {
      id: 'css-classes',
      label: 'CSS Classes',
      description: 'Utility text & bg classes',
      extension: '.css',
    },
    {
      id: 'tailwind',
      label: 'Tailwind CSS',
      description: 'v4 @theme & v3 configs',
      extension: '.css / .js',
    },
    {
      id: 'json',
      label: 'JSON',
      description: 'Structured palette data',
      extension: '.json',
    },
    {
      id: 'svg',
      label: 'SVG Preview',
      description: 'Scalable vector preview',
      extension: '.svg',
    },
  ];
</script>

<div class="space-y-2">
  <div class="flex items-center justify-between">
    <label for="format-selector" class="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
      Export Format
    </label>
    <span class="text-xs font-mono text-muted-foreground">
      Target: <strong class="text-foreground">{formatTabs.find(t => t.id === selectedFormat)?.label}</strong>
    </span>
  </div>

  <div id="format-selector" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
    {#each formatTabs as tab (tab.id)}
      {@const isActive = selectedFormat === tab.id}
      <button
        type="button"
        onclick={() => onselectFormat(tab.id)}
        class="p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {isActive ? 'bg-surface border-border-strong text-foreground shadow-neo translate-x-[-1px] translate-y-[-1px]' : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-surface/60'}"
      >
        <div class="flex items-center justify-between w-full">
          <span class="text-xs font-mono font-bold text-foreground">{tab.label}</span>
          <span class="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-background text-muted-foreground">
            {tab.extension}
          </span>
        </div>
        <p class="text-[11px] text-muted-foreground line-clamp-1">{tab.description}</p>
      </button>
    {/each}
  </div>
</div>
