<script lang="ts">
  import Shuffle from 'lucide-svelte/icons/shuffle';
  import RefreshCw from 'lucide-svelte/icons/refresh-cw';
  import Pipette from 'lucide-svelte/icons/pipette';
  import Check from 'lucide-svelte/icons/check';
  import AlertCircle from 'lucide-svelte/icons/alert-circle';
  import Sparkles from 'lucide-svelte/icons/sparkles';
  import Search from 'lucide-svelte/icons/search';
  import Sliders from 'lucide-svelte/icons/sliders';
  import { normalizeHex, formatHex } from '../../utils/color-utils';
  import { HARMONY_MODES, type SchemeMode } from '../../types/scheme';

  interface Props {
    baseHex: string;
    harmonyMode: SchemeMode;
    count: number;
    isLoading?: boolean;
    inspectorHex?: string;
    onchangeBaseHex: (cleanHex: string) => void;
    onchangeMode: (mode: SchemeMode) => void;
    onchangeCount: (count: number) => void;
    onrandomize: () => void;
    onuseInspectorColor?: () => void;
    onregenerate: () => void;
  }

  let {
    baseHex,
    harmonyMode,
    count,
    isLoading = false,
    inspectorHex,
    onchangeBaseHex,
    onchangeMode,
    onchangeCount,
    onrandomize,
    onuseInspectorColor,
    onregenerate,
  }: Props = $props();

  // Local state for user typing
  let typedHex = $state('');
  let inputTouched = $state(false);

  $effect(() => {
    typedHex = baseHex.replace(/^#/, '');
    inputTouched = false;
  });

  const normalized = $derived(normalizeHex(typedHex));
  const isInputValid = $derived(normalized !== null);
  const showError = $derived(inputTouched && typedHex.trim().length > 0 && !isInputValid);

  const nativePickerValue = $derived.by(() => {
    const valid = normalizeHex(typedHex);
    return valid ? `#${valid}` : formatHex(baseHex);
  });

  const currentModeInfo = $derived(
    HARMONY_MODES.find((m) => m.mode === harmonyMode) ?? HARMONY_MODES[0]!
  );

  function handleTextInput(e: Event) {
    const target = e.target as HTMLInputElement;
    typedHex = target.value;
    inputTouched = true;
  }

  function handleInputBlur() {
    inputTouched = true;
    if (normalized && normalized !== baseHex) {
      onchangeBaseHex(normalized);
    }
  }

  function handleNativePickerChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const clean = normalizeHex(target.value);
    if (clean) {
      typedHex = clean;
      inputTouched = false;
      onchangeBaseHex(clean);
    }
  }

  function handleHexSubmit(e: SubmitEvent) {
    e.preventDefault();
    inputTouched = true;
    if (normalized) {
      onchangeBaseHex(normalized);
    }
  }

  const countOptions = [3, 4, 5, 6, 8];
</script>

<div class="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-neo space-y-6">
  <!-- Top Bar: Base Color & Primary Action Buttons -->
  <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-5">
    <!-- Left: Base Color Inputs -->
    <div class="space-y-2">
      <div class="flex items-center gap-2">
        <label for="scheme-hex-input" class="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <Pipette class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
          <span>Base Color</span>
        </label>
        <span class="text-[11px] font-mono text-muted-foreground">• Seed</span>
      </div>

      <form onsubmit={handleHexSubmit} class="flex items-center gap-2.5">
        <!-- Native Color Picker Swatch Container -->
        <div class="relative flex items-center shrink-0">
          <label for="scheme-native-picker" class="sr-only">Choose base color</label>
          <input
            id="scheme-native-picker"
            type="color"
            value={nativePickerValue}
            oninput={handleNativePickerChange}
            class="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            title="Open native color picker"
          />
          <div
            class="h-10 w-10 rounded-xl border-2 border-border-strong/40 dark:border-zinc-700 shadow-neo flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer overflow-hidden group"
            style="background-color: {nativePickerValue};"
          >
            <div class="opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full p-1 text-white">
              <Pipette class="w-3 h-3" aria-hidden="true" />
            </div>
          </div>
        </div>

        <!-- Text HEX Input -->
        <div class="relative w-36 sm:w-40">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono text-muted-foreground pointer-events-none font-bold">
            #
          </span>
          <input
            id="scheme-hex-input"
            type="text"
            value={typedHex}
            oninput={handleTextInput}
            onblur={handleInputBlur}
            placeholder="4F46E5"
            maxlength="9"
            spellcheck="false"
            autocomplete="off"
            aria-invalid={showError ? 'true' : 'false'}
            class="h-10 w-full rounded-xl border bg-background pl-7 pr-8 text-sm font-mono font-bold text-foreground transition-colors placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {showError ? 'border-red-500' : 'border-border hover:border-border-strong'}"
          />
          {#if isInputValid}
            <div class="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400">
              <Check class="w-3.5 h-3.5" aria-hidden="true" />
            </div>
          {/if}
        </div>

        <!-- Optional Use From Inspector button -->
        {#if inspectorHex && normalizeHex(inspectorHex) !== normalizeHex(baseHex) && onuseInspectorColor}
          <button
            type="button"
            onclick={onuseInspectorColor}
            class="hidden sm:inline-flex items-center gap-1.5 h-10 px-3 rounded-xl border border-dashed border-border-strong/60 bg-background hover:bg-surface-hover text-xs font-mono font-medium text-foreground transition-all cursor-pointer shadow-sm"
            title="Set base color to Inspector color #{normalizeHex(inspectorHex)}"
          >
            <Search class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>Use Inspector (#{normalizeHex(inspectorHex)})</span>
          </button>
        {/if}
      </form>

      {#if showError}
        <div role="alert" class="flex items-center gap-1.5 text-xs font-mono text-red-600 dark:text-red-400">
          <AlertCircle class="w-3 h-3 shrink-0" aria-hidden="true" />
          <span>Enter valid 3 or 6 hex digits.</span>
        </div>
      {/if}
    </div>

    <!-- Right: Randomize & Regenerate Actions -->
    <div class="flex items-center gap-2 self-start lg:self-center">
      <!-- Random Base Color Button -->
      <button
        type="button"
        onclick={onrandomize}
        disabled={isLoading}
        class="h-10 px-3.5 rounded-xl border border-border bg-background text-foreground text-xs font-mono font-semibold shadow-sm hover:border-border-strong hover:bg-surface-hover active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
        title="Generate random base color (Shortcut: Space)"
      >
        <Shuffle class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span>Random Color</span>
        <kbd class="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-muted-foreground">
          Space
        </kbd>
      </button>

      <!-- Regenerate Scheme Button -->
      <button
        type="button"
        onclick={onregenerate}
        disabled={isLoading}
        class="h-10 px-4 rounded-xl border border-border-strong bg-accent text-accent-foreground text-xs font-mono font-bold shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
        title="Regenerate palette with current settings"
      >
        <RefreshCw class="w-3.5 h-3.5 {isLoading ? 'animate-spin' : ''}" aria-hidden="true" />
        <span>{isLoading ? 'Generating...' : 'Regenerate'}</span>
      </button>
    </div>
  </div>

  <!-- Middle: Harmony Modes Selection -->
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <span class="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
        <Sparkles class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span>Color Harmony Type</span>
      </span>

      <span class="text-xs font-mono text-muted-foreground hidden sm:inline">
        {currentModeInfo.angle} angle • {currentModeInfo.label}
      </span>
    </div>

    <!-- Harmony Mode Tabs / Buttons -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      {#each HARMONY_MODES as modeItem (modeItem.mode)}
        <button
          type="button"
          onclick={() => onchangeMode(modeItem.mode)}
          class="flex flex-col items-start p-2.5 rounded-xl border transition-all cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {harmonyMode === modeItem.mode ? 'bg-background border-border-strong text-foreground shadow-neo font-bold' : 'border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-hover'}"
        >
          <div class="w-full flex items-center justify-between gap-1">
            <span class="text-xs font-mono">{modeItem.shortLabel}</span>
            <span class="text-[10px] font-mono px-1 py-0.2 rounded border border-border bg-surface text-muted-foreground">
              {modeItem.angle}
            </span>
          </div>
          <span class="text-[10px] font-mono text-muted-foreground mt-1 line-clamp-1 opacity-80">
            {modeItem.label}
          </span>
        </button>
      {/each}
    </div>

    <!-- Active Harmony Description Callout -->
    <p class="text-xs text-muted-foreground font-mono bg-background p-2.5 rounded-xl border border-border">
      <span class="font-bold text-foreground">{currentModeInfo.label}:</span>
      {' '}{currentModeInfo.description}
    </p>
  </div>

  <!-- Bottom: Number of Colors Control -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border">
    <div class="flex items-center gap-2">
      <Sliders class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
      <span class="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
        Number of Colors:
      </span>
      <span class="text-xs font-mono font-bold text-accent px-2 py-0.5 rounded border border-accent/20 bg-accent/10">
        {count}
      </span>
    </div>

    <!-- Count Preset Buttons -->
    <div class="flex items-center gap-1.5">
      {#each countOptions as option (option)}
        <button
          type="button"
          onclick={() => onchangeCount(option)}
          class="w-9 h-8 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {count === option ? 'bg-surface border-border-strong text-foreground shadow-neo' : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-surface'}"
        >
          {option}
        </button>
      {/each}

      <!-- Custom Stepper (-) and (+) -->
      <div class="flex items-center ml-2 border border-border rounded-lg bg-background">
        <button
          type="button"
          disabled={count <= 2}
          onclick={() => onchangeCount(Math.max(2, count - 1))}
          class="w-7 h-8 flex items-center justify-center font-mono text-sm hover:bg-surface-hover rounded-l-lg disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none"
          title="Decrease color count"
          aria-label="Decrease color count"
        >
          -
        </button>
        <span class="px-2 font-mono text-xs font-bold text-foreground">
          {count}
        </span>
        <button
          type="button"
          disabled={count >= 10}
          onclick={() => onchangeCount(Math.min(10, count + 1))}
          class="w-7 h-8 flex items-center justify-center font-mono text-sm hover:bg-surface-hover rounded-r-lg disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none"
          title="Increase color count"
          aria-label="Increase color count"
        >
          +
        </button>
      </div>
    </div>
  </div>
</div>
