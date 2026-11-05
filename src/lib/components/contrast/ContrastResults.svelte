<script lang="ts">
  import Check from 'lucide-svelte/icons/check';
  import X from 'lucide-svelte/icons/x';
  import Info from 'lucide-svelte/icons/info';
  import ShieldCheck from 'lucide-svelte/icons/shield-check';
  import ShieldAlert from 'lucide-svelte/icons/shield-alert';
  import type { ContrastEvaluation } from '../../types/contrast';

  interface Props {
    evaluation: ContrastEvaluation;
    oninspectColor?: (cleanHex: string) => void;
  }

  let { evaluation, oninspectColor }: Props = $props();

  const statusConfig = $derived.by(() => {
    switch (evaluation.overallStatus) {
      case 'pass-aaa':
        return {
          badgeClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
          icon: ShieldCheck,
          label: 'Passes AAA Enhanced',
        };
      case 'pass-aa':
        return {
          badgeClass: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-700 dark:text-indigo-400',
          icon: ShieldCheck,
          label: 'Passes WCAG AA',
        };
      case 'partial':
        return {
          badgeClass: 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400',
          icon: ShieldAlert,
          label: 'Passes Large Text Only',
        };
      case 'fail':
      default:
        return {
          badgeClass: 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-400',
          icon: ShieldAlert,
          label: 'Fails WCAG Standards',
        };
    }
  });
</script>

<div class="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-neo space-y-6">
  <!-- Top Section: Main Contrast Ratio & Overall Verdict -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
    <div class="space-y-1">
      <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
        WCAG 2.2 Contrast Ratio
      </span>
      <div class="flex items-baseline gap-3">
        <span class="text-4xl sm:text-5xl font-black font-mono tracking-tight text-foreground">
          {evaluation.formattedRatio}
        </span>
        <span class="text-xs font-mono text-muted-foreground">
          ({evaluation.ratio >= 21 ? 'Maximum' : evaluation.ratio >= 7 ? 'Superb' : evaluation.ratio >= 4.5 ? 'Good' : evaluation.ratio >= 3 ? 'Marginal' : 'Poor'})
        </span>
      </div>

      <div class="flex items-center gap-2 pt-1">
        <button
          type="button"
          onclick={() => oninspectColor?.(evaluation.foreground.replace(/^#/, ''))}
          class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border border-border bg-background hover:bg-surface text-foreground transition-colors cursor-pointer"
          title="Inspect foreground color in Color Inspector"
        >
          <span class="w-2.5 h-2.5 rounded-full border border-border" style="background-color: {evaluation.foreground};"></span>
          <span>Text: {evaluation.foreground}</span>
        </button>

        <button
          type="button"
          onclick={() => oninspectColor?.(evaluation.background.replace(/^#/, ''))}
          class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border border-border bg-background hover:bg-surface text-foreground transition-colors cursor-pointer"
          title="Inspect background color in Color Inspector"
        >
          <span class="w-2.5 h-2.5 rounded-full border border-border" style="background-color: {evaluation.background};"></span>
          <span>BG: {evaluation.background}</span>
        </button>
      </div>
    </div>

    <!-- Status Badge -->
    <div class="flex flex-col sm:items-end gap-1.5">
      <div
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold {statusConfig.badgeClass}"
        role="status"
        aria-label="Overall compliance status: {statusConfig.label}"
      >
        <statusConfig.icon class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{statusConfig.label}</span>
      </div>

      <span class="text-[11px] font-mono text-muted-foreground">
        {evaluation.passedCount} of {evaluation.totalCount} criteria satisfied
      </span>
    </div>
  </div>

  <!-- Summary Description -->
  <p class="text-xs sm:text-sm text-muted-foreground leading-relaxed">
    {evaluation.summary}
  </p>

  <!-- Large Text Definition Notice -->
  <div class="rounded-xl border border-border/80 bg-background/50 p-3 flex items-start gap-2.5 text-xs text-muted-foreground">
    <Info class="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
    <div class="space-y-0.5">
      <span class="font-bold text-foreground font-mono">Large Text Definition (WCAG):</span>
      <p class="leading-normal">
        Text formatted at at least <strong class="text-foreground">18pt (24px) regular</strong> or <strong class="text-foreground">14pt (18.66px) bold</strong> requires lower contrast (3:1 for AA) than standard body text (4.5:1 for AA).
      </p>
    </div>
  </div>

  <!-- Detailed Criteria Checklist Grid -->
  <div class="space-y-2.5">
    <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
      Independent WCAG 2.2 Criteria Evaluation
    </h4>

    <div class="grid grid-cols-1 gap-2.5" role="list">
      {#each evaluation.criteria as criterion (criterion.id)}
        <div
          class="flex items-center justify-between p-3 rounded-xl border transition-colors {criterion.passed ? 'border-border bg-background/40' : 'border-rose-200 dark:border-rose-950/60 bg-rose-50/30 dark:bg-rose-950/20'}"
          role="listitem"
        >
          <div class="space-y-0.5 pr-2">
            <div class="flex items-center gap-2">
              <span class="text-xs sm:text-sm font-bold text-foreground">
                {criterion.name}
              </span>
              <span class="text-[10px] font-mono px-1.5 py-0.2 rounded border border-border bg-surface text-muted-foreground">
                Min {criterion.minRatio}:1
              </span>
            </div>
            <p class="text-[11px] text-muted-foreground leading-normal">
              {criterion.description}
            </p>
          </div>

          <!-- Pass/Fail Badge (Visual + Text + Accessible) -->
          <div class="shrink-0">
            {#if criterion.passed}
              <div
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold"
                role="status"
                aria-label="{criterion.name}: Pass"
              >
                <Check class="w-3.5 h-3.5" aria-hidden="true" />
                <span>Pass</span>
              </div>
            {:else}
              <div
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-500/40 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-mono font-bold"
                role="status"
                aria-label="{criterion.name}: Fail"
              >
                <X class="w-3.5 h-3.5" aria-hidden="true" />
                <span>Fail</span>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
