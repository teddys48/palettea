<script lang="ts">
  import Eye from 'lucide-svelte/icons/eye';
  import Sparkles from 'lucide-svelte/icons/sparkles';
  import Heart from 'lucide-svelte/icons/heart';
  import ArrowRight from 'lucide-svelte/icons/arrow-right';
  import Check from 'lucide-svelte/icons/check';

  interface Props {
    foregroundHex: string;
    backgroundHex: string;
  }

  let { foregroundHex, backgroundHex }: Props = $props();

  let previewMode = $state<'ui' | 'editorial' | 'cards'>('ui');
  let buttonClicked = $state(false);

  function handleDemoClick() {
    buttonClicked = true;
    setTimeout(() => {
      buttonClicked = false;
    }, 1500);
  }
</script>

<div class="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-neo space-y-5">
  <!-- Header with Preview Mode Tabs -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
    <div>
      <h3 class="text-sm font-bold uppercase tracking-wider text-foreground font-mono flex items-center gap-2">
        <Eye class="w-4 h-4 text-accent" aria-hidden="true" />
        <span>Live Context Preview</span>
      </h3>
      <p class="text-xs text-muted-foreground mt-0.5">
        Real-time preview rendered directly using foreground <code class="font-mono font-bold text-foreground">{foregroundHex}</code> on background <code class="font-mono font-bold text-foreground">{backgroundHex}</code>.
      </p>
    </div>

    <!-- Mode Selector Pills -->
    <div class="flex items-center gap-1 p-1 rounded-xl bg-background border border-border self-start sm:self-auto">
      <button
        type="button"
        onclick={() => (previewMode = 'ui')}
        class="px-2.5 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer {previewMode === 'ui' ? 'bg-surface text-foreground font-bold shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}"
      >
        UI Elements
      </button>
      <button
        type="button"
        onclick={() => (previewMode = 'editorial')}
        class="px-2.5 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer {previewMode === 'editorial' ? 'bg-surface text-foreground font-bold shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}"
      >
        Typography
      </button>
      <button
        type="button"
        onclick={() => (previewMode = 'cards')}
        class="px-2.5 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer {previewMode === 'cards' ? 'bg-surface text-foreground font-bold shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}"
      >
        Component Cards
      </button>
    </div>
  </div>

  <!-- Dynamic Preview Canvas Canvas -->
  <div
    class="w-full rounded-2xl p-6 sm:p-8 transition-colors duration-150 border border-border/80 shadow-inner overflow-hidden min-h-[300px] flex flex-col justify-center"
    style="background-color: {backgroundHex}; color: {foregroundHex};"
  >
    {#if previewMode === 'ui'}
      <!-- UI Elements Mode -->
      <div class="max-w-2xl mx-auto w-full space-y-6">
        <!-- Heading Sample (Large Text >= 24px) -->
        <div class="space-y-1.5">
          <span
            class="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border inline-block"
            style="border-color: {foregroundHex}; opacity: 0.85;"
          >
            Large Text Sample (≥ 18pt / 24px)
          </span>
          <h3 class="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            Design with accessible harmony
          </h3>
        </div>

        <!-- Body Text Sample (Normal Text 16px) -->
        <p class="text-sm sm:text-base leading-relaxed opacity-90 max-w-xl">
          High-contrast typography ensures readability for all users across varied lighting conditions, display panels, and visual visual acuities.
        </p>

        <!-- Interactive UI Controls Sample -->
        <div class="pt-2 flex flex-wrap items-center gap-3">
          <!-- Button styled with foreground & background -->
          <button
            type="button"
            onclick={handleDemoClick}
            class="px-4 py-2 rounded-xl font-medium text-sm border shadow-sm transition-all flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2"
            style="background-color: {foregroundHex}; color: {backgroundHex}; border-color: {foregroundHex};"
          >
            {#if buttonClicked}
              <Check class="w-4 h-4" aria-hidden="true" />
              <span>Button Clicked</span>
            {:else}
              <span>Primary Button</span>
              <ArrowRight class="w-4 h-4" aria-hidden="true" />
            {/if}
          </button>

          <!-- Secondary Inverted Button -->
          <button
            type="button"
            class="px-4 py-2 rounded-xl font-medium text-sm border transition-all flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2"
            style="background-color: transparent; color: {foregroundHex}; border-color: {foregroundHex};"
          >
            <span>Secondary Button</span>
          </button>

          <!-- Chip / Badge Component -->
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border"
            style="border-color: {foregroundHex};"
          >
            <Sparkles class="w-3.5 h-3.5" aria-hidden="true" />
            <span>UI Badge</span>
          </span>
        </div>

        <!-- Form Input & Helper Component -->
        <div class="pt-2 space-y-2 max-w-md">
          <span class="text-xs font-mono font-bold uppercase tracking-wider block opacity-90">
            Form Field Component
          </span>
          <div
            class="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm"
            style="border-color: {foregroundHex};"
          >
            <Heart class="w-4 h-4 shrink-0" aria-hidden="true" />
            <span class="opacity-80">user@example.com</span>
          </div>
          <span class="text-[11px] font-mono opacity-75 block">
            Border and icon must meet 3:1 non-text contrast under WCAG 2.2 SC 1.4.11.
          </span>
        </div>
      </div>
    {:else if previewMode === 'editorial'}
      <!-- Editorial Typography Mode -->
      <div class="max-w-2xl mx-auto w-full space-y-5">
        <div class="space-y-1">
          <span class="text-xs font-mono uppercase tracking-widest opacity-80">
            Editorial Article Preview
          </span>
          <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
            The Science of Visual Legibility
          </h2>
          <p class="text-xs font-mono opacity-70">
            By Palettea Accessibility Team • 4 min read
          </p>
        </div>

        <p class="text-base sm:text-lg leading-relaxed font-serif italic border-l-2 pl-4 py-1" style="border-color: {foregroundHex};">
          "Contrast is not merely an aesthetic choice; it is the fundamental bridge that allows human eyes to decode digital intent."
        </p>

        <p class="text-sm sm:text-base leading-relaxed opacity-90">
          The Web Content Accessibility Guidelines (WCAG) 2.2 define contrast based on relative luminance rather than raw hue brightness. By calculating the photometric luminance of sRGB channels, digital designers can predict how comfortably both neurotypical readers and individuals with visual impairments can absorb content.
        </p>

        <div class="pt-2 flex items-center gap-4 text-xs font-mono">
          <span class="underline underline-offset-4 cursor-pointer font-bold">
            Read comprehensive case study →
          </span>
        </div>
      </div>
    {:else}
      <!-- Component Cards Mode -->
      <div class="max-w-2xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Card 1 -->
        <div
          class="p-5 rounded-2xl border space-y-3 transition-transform hover:-translate-y-0.5"
          style="border-color: {foregroundHex};"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold uppercase tracking-wider">Metrics Card</span>
            <Sparkles class="w-4 h-4" aria-hidden="true" />
          </div>
          <div class="text-3xl font-extrabold font-mono tracking-tight">
            99.8%
          </div>
          <p class="text-xs opacity-80 leading-relaxed">
            Accessible element pass rate across responsive viewport breakpoints.
          </p>
        </div>

        <!-- Card 2 -->
        <div
          class="p-5 rounded-2xl border space-y-3 transition-transform hover:-translate-y-0.5"
          style="border-color: {foregroundHex};"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold uppercase tracking-wider">Status Alert</span>
            <Check class="w-4 h-4" aria-hidden="true" />
          </div>
          <h4 class="text-base font-bold">
            WCAG Compliant
          </h4>
          <p class="text-xs opacity-80 leading-relaxed">
            Evaluated against relative luminance formula (L1 + 0.05) / (L2 + 0.05).
          </p>
        </div>
      </div>
    {/if}
  </div>
</div>
