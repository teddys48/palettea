<script lang="ts">
  import Code from 'lucide-svelte/icons/code';
  import Eye from 'lucide-svelte/icons/eye';
  import type { ExportFormat } from '../../types/export';

  interface Props {
    code: string;
    format: ExportFormat;
    lineCount: number;
    charCount: number;
  }

  let { code, format, lineCount, charCount }: Props = $props();

  let svgViewMode = $state<'render' | 'code'>('render');
</script>

<div class="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden flex flex-col">
  <!-- Preview Header Bar -->
  <div class="px-4 py-3 border-b border-border bg-background/50 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
    <div class="flex items-center gap-2">
      <span class="w-2.5 h-2.5 rounded-full bg-red-400/80 inline-block"></span>
      <span class="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block"></span>
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400/80 inline-block"></span>
      <span class="text-muted-foreground ml-2 font-bold uppercase tracking-wider">
        Output Preview
      </span>
    </div>

    <!-- Right info & SVG render toggle -->
    <div class="flex items-center gap-3">
      {#if format === 'svg'}
        <div class="inline-flex p-0.5 rounded-lg border border-border bg-surface text-xs font-mono">
          <button
            type="button"
            onclick={() => (svgViewMode = 'render')}
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer {svgViewMode === 'render' ? 'bg-background font-bold text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
          >
            <Eye class="w-3 h-3" aria-hidden="true" />
            <span>Visual</span>
          </button>
          <button
            type="button"
            onclick={() => (svgViewMode = 'code')}
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer {svgViewMode === 'code' ? 'bg-background font-bold text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
          >
            <Code class="w-3 h-3" aria-hidden="true" />
            <span>SVG Code</span>
          </button>
        </div>
      {/if}

      <div class="text-muted-foreground text-[11px]">
        <span>{lineCount} lines</span>
        <span class="mx-1">•</span>
        <span>{charCount} chars</span>
      </div>
    </div>
  </div>

  <!-- Content Container -->
  {#if format === 'svg' && svgViewMode === 'render'}
    <!-- Rendered SVG Graphic Canvas -->
    <div class="p-6 bg-zinc-100 dark:bg-zinc-950/80 flex items-center justify-center overflow-x-auto min-h-[220px]">
      <div class="max-w-full drop-shadow-md rounded-lg overflow-hidden border border-border/50 bg-[#FAF9F6]">
        {@html code}
      </div>
    </div>
  {:else}
    <!-- Monospace Syntax Code Block -->
    <div class="relative bg-zinc-950 text-zinc-100 p-4 font-mono text-xs overflow-x-auto max-h-[460px] select-all leading-relaxed focus:outline-none">
      <pre class="m-0 font-mono"><code>{code}</code></pre>
    </div>
  {/if}
</div>
