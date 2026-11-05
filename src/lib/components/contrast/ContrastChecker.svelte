<script lang="ts">
  import ContrastColorInput from './ContrastColorInput.svelte';
  import ContrastResults from './ContrastResults.svelte';
  import ContrastPreview from './ContrastPreview.svelte';
  import ContrastSuggestions from './ContrastSuggestions.svelte';
  import { evaluateWcagCompliance, generateContrastSuggestions } from '../../utils/contrast-utils';
  import { formatHex } from '../../utils/color-utils';
  import type { ContrastPreset, ContrastSuggestion } from '../../types/contrast';

  interface Props {
    initialForegroundHex?: string;
    initialBackgroundHex?: string;
    oninspectColor?: (cleanHex: string) => void;
  }

  const DEFAULT_FG = '#191919';
  const DEFAULT_BG = '#FFFFFF';

  let {
    initialForegroundHex = DEFAULT_FG,
    initialBackgroundHex = DEFAULT_BG,
    oninspectColor,
  }: Props = $props();

  let foregroundHex = $state(DEFAULT_FG);
  let backgroundHex = $state(DEFAULT_BG);

  // Sync if parent updates initial colors
  $effect(() => {
    if (initialForegroundHex) {
      foregroundHex = formatHex(initialForegroundHex);
    }
  });

  $effect(() => {
    if (initialBackgroundHex) {
      backgroundHex = formatHex(initialBackgroundHex);
    }
  });

  const evaluation = $derived(evaluateWcagCompliance(foregroundHex, backgroundHex));
  const suggestions = $derived(generateContrastSuggestions(foregroundHex, backgroundHex));

  function handleForegroundChange(hex: string) {
    foregroundHex = formatHex(hex);
  }

  function handleBackgroundChange(hex: string) {
    backgroundHex = formatHex(hex);
  }

  function handleSwapColors() {
    const temp = foregroundHex;
    foregroundHex = backgroundHex;
    backgroundHex = temp;
  }

  function handleSelectPreset(preset: ContrastPreset) {
    foregroundHex = formatHex(preset.foreground);
    backgroundHex = formatHex(preset.background);
  }

  function handleApplySuggestion(suggestion: ContrastSuggestion) {
    if (suggestion.type === 'foreground') {
      foregroundHex = formatHex(suggestion.suggestedHex);
    } else {
      backgroundHex = formatHex(suggestion.suggestedHex);
    }
  }
</script>

<div class="space-y-6">
  <!-- Top Grid: Color Controls & WCAG Contrast Results -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
    <!-- Left Column: Color Selection & Presets (5 cols on lg) -->
    <div class="lg:col-span-5">
      <ContrastColorInput
        {foregroundHex}
        {backgroundHex}
        onchangeForeground={handleForegroundChange}
        onchangeBackground={handleBackgroundChange}
        onswapColors={handleSwapColors}
        onselectPreset={handleSelectPreset}
      />
    </div>

    <!-- Right Column: Contrast Results & WCAG Checklist (7 cols on lg) -->
    <div class="lg:col-span-7">
      <ContrastResults {evaluation} {oninspectColor} />
    </div>
  </div>

  <!-- Full-Width Live Context Preview -->
  <div>
    <ContrastPreview
      {foregroundHex}
      {backgroundHex}
    />
  </div>

  <!-- Full-Width Improvement Suggestions -->
  <div>
    <ContrastSuggestions
      {suggestions}
      currentRatio={evaluation.ratio}
      onapplySuggestion={handleApplySuggestion}
    />
  </div>
</div>
