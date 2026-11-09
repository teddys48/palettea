<script lang="ts">
  import Pipette from 'lucide-svelte/icons/pipette';
  import Check from 'lucide-svelte/icons/check';
  import AlertCircle from 'lucide-svelte/icons/alert-circle';
  import ArrowRight from 'lucide-svelte/icons/arrow-right';
  import { normalizeHex, formatHex } from '../../utils/color-utils';

  interface Props {
    selectedHex: string;
    isLoading?: boolean;
    onapplyColor: (cleanHex: string) => void;
  }

  let { selectedHex, isLoading = false, onapplyColor }: Props = $props();

  // Local state for user typing so unfinished text isn't lost
  let typedHex = $state('');
  let inputTouched = $state(false);

  // Sync typedHex when selectedHex prop changes from external source
  $effect(() => {
    typedHex = selectedHex.replace(/^#/, '');
    inputTouched = false;
  });

  const normalized = $derived(normalizeHex(typedHex));
  const isInputValid = $derived(normalized !== null);
  const showError = $derived(inputTouched && typedHex.trim().length > 0 && !isInputValid);

  // Native picker expects a 7-character `#RRGGBB` format
  const nativePickerValue = $derived.by(() => {
    const valid = normalizeHex(typedHex);
    return valid ? `#${valid}` : formatHex(selectedHex);
  });

  function handleTextInput(e: Event) {
    const target = e.target as HTMLInputElement;
    typedHex = target.value;
    inputTouched = true;
  }

  function handleNativePickerChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    const clean = normalizeHex(value);
    if (clean) {
      typedHex = clean;
      inputTouched = false;
      onapplyColor(clean);
    }
  }

  function handleFormSubmit(e: SubmitEvent) {
    e.preventDefault();
    inputTouched = true;
    if (normalized) {
      onapplyColor(normalized);
    }
  }

  function handlePresetClick(presetCleanHex: string) {
    typedHex = presetCleanHex;
    inputTouched = false;
    onapplyColor(presetCleanHex);
  }

  const quickPresets = [
    { name: 'Indigo Accent', hex: '4F46E5' },
    { name: 'Electric Violet', hex: '7C83FD' },
    { name: 'Emerald Forest', hex: '10B981' },
    { name: 'Amber Glow', hex: 'F59E0B' },
    { name: 'Rose Sunset', hex: 'F43F5E' },
    { name: 'Ink Noir', hex: '18181B' },
  ];
</script>

<div class="rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-neo transition-all">
  <form onsubmit={handleFormSubmit} class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
      <div>
        <h2 class="text-sm font-bold uppercase tracking-wider text-foreground font-mono flex items-center gap-2">
          <Pipette class="w-4 h-4 text-accent" aria-hidden="true" />
          <span>Color Input</span>
        </h2>
        <p class="text-xs text-muted-foreground mt-0.5">
          Type a 3 or 6-digit HEX, pick with the eyedropper, or choose a preset.
        </p>
      </div>

      <div class="flex items-center gap-1.5 self-start sm:self-auto">
        <span class="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md border border-border bg-background text-muted-foreground">
          Live sync
        </span>
      </div>
    </div>

    <!-- Main Input Bar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <!-- Native HTML Color Picker Container -->
      <div class="relative flex items-center shrink-0">
        <label for="native-color-picker" class="sr-only">Choose color using native picker</label>
        <input
          id="native-color-picker"
          type="color"
          value={nativePickerValue}
          oninput={handleNativePickerChange}
          onchange={handleNativePickerChange}
          class="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          title="Open native color picker"
        />
        <div
          class="h-11 w-11 rounded-xl border-2 border-border-strong/40 dark:border-zinc-700 shadow-neo flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer overflow-hidden group"
          style="background-color: {nativePickerValue};"
        >
          <div class="opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full p-1 text-white">
            <Pipette class="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </div>
      </div>

      <!-- Text Input with # prefix -->
      <div class="relative flex-1">
        <label for="hex-color-input" class="sr-only">HEX Color Code</label>
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono text-muted-foreground pointer-events-none font-bold">
          #
        </span>
        <input
          id="hex-color-input"
          type="text"
          value={typedHex}
          oninput={handleTextInput}
          placeholder="4F46E5"
          maxlength="9"
          spellcheck="false"
          autocomplete="off"
          aria-invalid={showError ? 'true' : 'false'}
          aria-describedby={showError ? 'hex-error-message' : undefined}
          class="h-11 w-full rounded-xl border bg-background pl-8 pr-10 text-sm font-mono font-semibold text-foreground transition-colors placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {showError ? 'border-red-500 dark:border-red-400 focus-visible:ring-red-400' : 'border-border hover:border-border-strong'}"
        />
        {#if isInputValid}
          <div class="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400">
            <Check class="w-4 h-4" aria-hidden="true" />
          </div>
        {/if}
      </div>

      <!-- Apply / Confirm Button -->
      <button
        type="submit"
        disabled={!isInputValid || isLoading}
        class="h-11 px-5 rounded-xl border border-border-strong bg-accent text-accent-foreground font-semibold text-sm shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {#if isLoading}
          <span class="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden="true"></span>
          <span>Inspecting...</span>
        {:else}
          <span>Inspect</span>
          <ArrowRight class="w-4 h-4" aria-hidden="true" />
        {/if}
      </button>
    </div>

    <!-- Error validation feedback -->
    {#if showError}
      <div
        id="hex-error-message"
        role="alert"
        class="flex items-center gap-1.5 text-xs font-mono text-red-600 dark:text-red-400 animate-in fade-in duration-150"
      >
        <AlertCircle class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Invalid HEX format. Enter 3 or 6 hex characters (e.g., #4F46E5 or #FFF).</span>
      </div>
    {/if}

    <!-- Quick Presets -->
    <div class="pt-2 flex flex-wrap items-center gap-2">
      <span class="text-xs font-mono text-muted-foreground mr-1">Presets:</span>
      {#each quickPresets as preset (preset.hex)}
        <button
          type="button"
          onclick={() => handlePresetClick(preset.hex)}
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-surface-hover hover:border-border-strong text-xs font-mono text-foreground transition-all cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {normalizeHex(typedHex) === preset.hex ? 'ring-2 ring-accent border-accent font-bold' : ''}"
        >
          <span
            class="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
            style="background-color: #{preset.hex};"
            aria-hidden="true"
          ></span>
          <span>#{preset.hex}</span>
        </button>
      {/each}
    </div>
  </form>
</div>
