<script lang="ts">
  import Sparkles from 'lucide-svelte/icons/sparkles';
  import Check from 'lucide-svelte/icons/check';
  import ArrowRight from 'lucide-svelte/icons/arrow-right';
  import ShieldCheck from 'lucide-svelte/icons/shield-check';
  import type { ContrastSuggestion } from '../../types/contrast';

  interface Props {
    suggestions: ContrastSuggestion[];
    currentRatio: number;
    onapplySuggestion: (suggestion: ContrastSuggestion) => void;
  }

  let { suggestions, currentRatio, onapplySuggestion }: Props = $props();

  let appliedId = $state<string | null>(null);

  function handleApply(suggestion: ContrastSuggestion) {
    appliedId = suggestion.id;
    onapplySuggestion(suggestion);
    setTimeout(() => {
      appliedId = null;
    }, 1500);
  }
</script>

<div class="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-neo space-y-4">
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
    <div>
      <h3 class="text-sm font-bold uppercase tracking-wider text-foreground font-mono flex items-center gap-2">
        <Sparkles class="w-4 h-4 text-accent" aria-hidden="true" />
        <span>Color Improvement Suggestions</span>
      </h3>
      <p class="text-xs text-muted-foreground mt-0.5">
        Mathematically calculated and verified recommendations that preserve color harmony while reaching WCAG targets.
      </p>
    </div>

    <div class="flex items-center gap-1.5">
      <span class="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md border border-border bg-background text-muted-foreground">
        <ShieldCheck class="w-3 h-3 text-emerald-500" aria-hidden="true" />
        <span>Verified Engine</span>
      </span>
    </div>
  </div>

  {#if currentRatio >= 7.0}
    <!-- Already exceeds AAA -->
    <div class="rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 flex items-center gap-3">
      <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
        <Check class="w-4 h-4" aria-hidden="true" />
      </div>
      <div>
        <h4 class="text-xs sm:text-sm font-bold text-foreground">
          Exceptional Contrast Achieved
        </h4>
        <p class="text-xs text-muted-foreground leading-normal mt-0.5">
          This color combination already satisfies and exceeds the highest WCAG AAA requirements (≥ 7:1). No adjustment is required!
        </p>
      </div>
    </div>
  {:else if suggestions.length === 0}
    <div class="rounded-xl border border-border bg-background/50 p-4 text-xs text-muted-foreground">
      No automated adjustments available for this specific combination.
    </div>
  {:else}
    <!-- Grid of suggestions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {#each suggestions as suggestion (suggestion.id)}
        <div class="rounded-xl border border-border bg-background/50 p-4 flex flex-col justify-between gap-3 hover:border-border-strong transition-all">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="inline-flex items-center gap-1 text-[11px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-surface border border-border text-foreground">
                {suggestion.label}
              </span>

              <span class="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {suggestion.formattedRatio} (Target: {suggestion.targetRatio}:1)
              </span>
            </div>

            <p class="text-xs text-muted-foreground leading-normal">
              {suggestion.explanation}
            </p>

            <!-- Color Swatches Comparison -->
            <div class="flex items-center gap-3 pt-1">
              <div class="flex items-center gap-1.5">
                <span
                  class="w-5 h-5 rounded-md border border-border shrink-0 shadow-sm"
                  style="background-color: {suggestion.currentHex};"
                  title="Current: {suggestion.currentHex}"
                ></span>
                <span class="text-[11px] font-mono line-through text-muted-foreground">
                  {suggestion.currentHex}
                </span>
              </div>

              <ArrowRight class="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />

              <div class="flex items-center gap-1.5">
                <span
                  class="w-5 h-5 rounded-md border border-border shrink-0 shadow-sm"
                  style="background-color: {suggestion.suggestedHex};"
                  title="Suggested: {suggestion.suggestedHex}"
                ></span>
                <span class="text-xs font-mono font-bold text-foreground">
                  {suggestion.suggestedHex}
                </span>
              </div>
            </div>
          </div>

          <!-- Apply Button -->
          <button
            type="button"
            onclick={() => handleApply(suggestion)}
            class="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {appliedId === suggestion.id ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-surface hover:bg-surface-hover text-foreground border-border hover:border-border-strong shadow-sm active:scale-98'}"
          >
            {#if appliedId === suggestion.id}
              <Check class="w-3.5 h-3.5" aria-hidden="true" />
              <span>Applied Successfully</span>
            {:else}
              <span>Apply {suggestion.type === 'foreground' ? 'Text' : 'Background'} Color</span>
              <ArrowRight class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            {/if}
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>
