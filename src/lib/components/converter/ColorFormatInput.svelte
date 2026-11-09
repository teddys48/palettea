<script lang="ts">
  import Pipette from 'lucide-svelte/icons/pipette';
  import Check from 'lucide-svelte/icons/check';
  import AlertCircle from 'lucide-svelte/icons/alert-circle';
  import RotateCcw from 'lucide-svelte/icons/rotate-ccw';
  import type { SupportedColorFormat } from '../../types/color';

  interface Props {
    activeFormat: SupportedColorFormat;
    inputText: string;
    pickerHex: string;
    isValid: boolean;
    errorMessage: string | null;
    onchangeFormat: (format: SupportedColorFormat) => void;
    onchangeInput: (text: string) => void;
    onchangePicker: (hex: string) => void;
    onreset: () => void;
  }

  let {
    activeFormat,
    inputText,
    pickerHex,
    isValid,
    errorMessage,
    onchangeFormat,
    onchangeInput,
    onchangePicker,
    onreset,
  }: Props = $props();

  const formatOptions: { id: SupportedColorFormat; label: string; placeholder: string; helper: string }[] = [
    {
      id: 'hex',
      label: 'HEX',
      placeholder: '#7C83FD or 7C83FD',
      helper: 'Enter 3 or 6 hex digits with or without #',
    },
    {
      id: 'rgb',
      label: 'RGB',
      placeholder: '124, 131, 253 or rgb(124, 131, 253)',
      helper: 'Three channels from 0 to 255',
    },
    {
      id: 'hsl',
      label: 'HSL',
      placeholder: '237, 98%, 74% or hsl(237, 98%, 74%)',
      helper: 'Hue (0-360°), Saturation (0-100%), Lightness (0-100%)',
    },
    {
      id: 'hsv',
      label: 'HSV',
      placeholder: '237, 51%, 99% or hsv(237, 51%, 99%)',
      helper: 'Hue (0-360°), Saturation (0-100%), Value (0-100%)',
    },
    {
      id: 'cmyk',
      label: 'CMYK',
      placeholder: '51%, 48%, 0%, 1% or cmyk(51%, 48%, 0%, 1%)',
      helper: 'Cyan, Magenta, Yellow, Key percentages (0-100%)',
    },
  ];

  const currentOption = $derived(
    formatOptions.find((opt) => opt.id === activeFormat) ?? formatOptions[0]!
  );

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    onchangeInput(target.value);
  }

  function handlePickerInput(e: Event) {
    const target = e.target as HTMLInputElement;
    onchangePicker(target.value);
  }
</script>

<div class="rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-neo transition-all space-y-4">
  <!-- Format Tabs Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
    <div>
      <h3 class="text-sm font-bold uppercase tracking-wider text-foreground font-mono flex items-center gap-2">
        <Pipette class="w-4 h-4 text-accent" aria-hidden="true" />
        <span>Source Format & Input</span>
      </h3>
      <p class="text-xs text-muted-foreground mt-0.5">
        Select any format to edit directly; all other representations update in real-time.
      </p>
    </div>

    <!-- Format Selector Tabs -->
    <div class="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-background border border-border self-start sm:self-auto">
      {#each formatOptions as opt (opt.id)}
        <button
          type="button"
          onclick={() => onchangeFormat(opt.id)}
          aria-pressed={activeFormat === opt.id}
          class="px-3 py-1 text-xs font-mono rounded-lg border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {activeFormat === opt.id ? 'bg-surface border-border-strong text-foreground font-bold shadow-neo' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-surface/50'}"
        >
          {opt.label}
        </button>
      {/each}
    </div>
  </div>

  <!-- Main Input Row -->
  <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
    <!-- Color Swatch / Native Picker -->
    <div class="relative flex items-center shrink-0">
      <label for="converter-native-picker" class="sr-only">Choose color using native picker</label>
      <input
        id="converter-native-picker"
        type="color"
        value={pickerHex}
        oninput={handlePickerInput}
        onchange={handlePickerInput}
        class="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
        title="Open native color picker"
      />
      <div
        class="h-11 w-11 rounded-xl border-2 border-border-strong/40 dark:border-zinc-700 shadow-neo flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer overflow-hidden group"
        style="background-color: {pickerHex};"
      >
        <div class="opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full p-1 text-white">
          <Pipette class="w-3.5 h-3.5" aria-hidden="true" />
        </div>
      </div>
    </div>

    <!-- Text Input -->
    <div class="relative flex-1">
      <label for="color-converter-input" class="sr-only">
        {currentOption.label} Color Input
      </label>
      <input
        id="color-converter-input"
        type="text"
        value={inputText}
        oninput={handleInput}
        placeholder={currentOption.placeholder}
        spellcheck="false"
        autocomplete="off"
        aria-invalid={!isValid}
        aria-describedby={!isValid ? 'converter-error-message' : 'converter-helper-text'}
        class="h-11 w-full rounded-xl border bg-background px-4 pr-10 text-sm font-mono font-semibold text-foreground transition-colors placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {!isValid ? 'border-red-500 dark:border-red-400 focus-visible:ring-red-400' : 'border-border hover:border-border-strong'}"
      />
      {#if isValid}
        <div class="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400">
          <Check class="w-4 h-4" aria-hidden="true" />
        </div>
      {/if}
    </div>

    <!-- Reset / Clear Button -->
    <button
      type="button"
      onclick={onreset}
      title="Reset color to default"
      aria-label="Reset color to default"
      class="h-11 px-4 rounded-xl border border-border bg-background hover:bg-surface text-muted-foreground hover:text-foreground font-mono text-xs font-semibold shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <RotateCcw class="w-3.5 h-3.5" aria-hidden="true" />
      <span>Reset</span>
    </button>
  </div>

  <!-- Real-time Validation Error or Helper Text -->
  <div class="min-h-5 flex items-center">
    {#if !isValid && errorMessage}
      <div
        id="converter-error-message"
        role="alert"
        class="flex items-center gap-1.5 text-xs font-mono text-red-600 dark:text-red-400 animate-in fade-in duration-150"
      >
        <AlertCircle class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{errorMessage}</span>
      </div>
    {:else}
      <span id="converter-helper-text" class="text-xs font-mono text-muted-foreground">
        {currentOption.helper}
      </span>
    {/if}
  </div>
</div>
