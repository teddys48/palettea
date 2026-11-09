<script lang="ts">
  import ArrowRightLeft from 'lucide-svelte/icons/arrow-right-left';
  import Pipette from 'lucide-svelte/icons/pipette';
  import Sparkles from 'lucide-svelte/icons/sparkles';
  import AlertCircle from 'lucide-svelte/icons/alert-circle';
  import { normalizeHex, formatHex, hexToRgb, getRelativeLuminance } from '../../utils/color-utils';
  import { CONTRAST_PRESETS } from '../../utils/contrast-utils';
  import type { ContrastPreset } from '../../types/contrast';

  interface Props {
    foregroundHex: string;
    backgroundHex: string;
    onchangeForeground: (hex: string) => void;
    onchangeBackground: (hex: string) => void;
    onswapColors: () => void;
    onselectPreset: (preset: ContrastPreset) => void;
  }

  let {
    foregroundHex,
    backgroundHex,
    onchangeForeground,
    onchangeBackground,
    onswapColors,
    onselectPreset,
  }: Props = $props();

  // Local state for text input typing so uncommitted text is not wiped
  let typedFg = $state('');
  let typedBg = $state('');
  let fgTouched = $state(false);
  let bgTouched = $state(false);

  // Sync when prop changes
  $effect(() => {
    typedFg = foregroundHex.replace(/^#/, '');
    fgTouched = false;
  });

  $effect(() => {
    typedBg = backgroundHex.replace(/^#/, '');
    bgTouched = false;
  });

  const validFg = $derived(normalizeHex(typedFg));
  const validBg = $derived(normalizeHex(typedBg));

  const fgError = $derived(fgTouched && typedFg.trim().length > 0 && validFg === null);
  const bgError = $derived(bgTouched && typedBg.trim().length > 0 && validBg === null);

  const fgPickerValue = $derived(validFg ? `#${validFg}` : formatHex(foregroundHex));
  const bgPickerValue = $derived(validBg ? `#${validBg}` : formatHex(backgroundHex));

  // Compute live relative luminances for immediate feedback
  const fgLuminance = $derived.by(() => {
    const clean = validFg ?? normalizeHex(foregroundHex);
    if (!clean) return 0;
    const rgb = hexToRgb(clean);
    return rgb ? getRelativeLuminance(rgb.r, rgb.g, rgb.b) : 0;
  });

  const bgLuminance = $derived.by(() => {
    const clean = validBg ?? normalizeHex(backgroundHex);
    if (!clean) return 1;
    const rgb = hexToRgb(clean);
    return rgb ? getRelativeLuminance(rgb.r, rgb.g, rgb.b) : 1;
  });

  function handleFgTextInput(e: Event) {
    const target = e.target as HTMLInputElement;
    typedFg = target.value;
    fgTouched = true;
    const clean = normalizeHex(typedFg);
    if (clean) {
      onchangeForeground(`#${clean}`);
    }
  }

  function handleBgTextInput(e: Event) {
    const target = e.target as HTMLInputElement;
    typedBg = target.value;
    bgTouched = true;
    const clean = normalizeHex(typedBg);
    if (clean) {
      onchangeBackground(`#${clean}`);
    }
  }

  function handleFgPickerChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const clean = normalizeHex(target.value);
    if (clean) {
      typedFg = clean;
      fgTouched = false;
      onchangeForeground(`#${clean}`);
    }
  }

  function handleBgPickerChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const clean = normalizeHex(target.value);
    if (clean) {
      typedBg = clean;
      bgTouched = false;
      onchangeBackground(`#${clean}`);
    }
  }
</script>

<div class="space-y-6">
  <!-- Color Selectors Container with Swap Button -->
  <div class="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-neo transition-all">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4 mb-5">
      <div>
        <h3 class="text-sm font-bold uppercase tracking-wider text-foreground font-mono flex items-center gap-2">
          <Pipette class="w-4 h-4 text-accent" aria-hidden="true" />
          <span>Color Pair Selection</span>
        </h3>
        <p class="text-xs text-muted-foreground mt-0.5">
          Select foreground (text) and background colors to evaluate contrast according to WCAG 2.2.
        </p>
      </div>

      <button
        type="button"
        onclick={onswapColors}
        title="Swap text and background colors"
        aria-label="Swap foreground and background colors"
        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-surface text-foreground text-xs font-mono font-medium shadow-sm hover:border-border-strong cursor-pointer transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent self-start sm:self-auto"
      >
        <ArrowRightLeft class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span>Swap Colors</span>
      </button>
    </div>

    <!-- Dual Inputs Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
      <!-- Foreground (Text) Input Card -->
      <div class="space-y-2 rounded-xl border border-border bg-background/60 p-4 relative focus-within:border-accent transition-colors">
        <div class="flex items-center justify-between">
          <label for="fg-hex-input" class="text-xs font-mono font-bold uppercase text-foreground flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full border border-border" style="background-color: {fgPickerValue};"></span>
            <span>Text (Foreground)</span>
          </label>
          <span class="text-[11px] font-mono text-muted-foreground">
            Luminance: {fgLuminance.toFixed(3)}
          </span>
        </div>

        <div class="flex items-center gap-2.5">
          <!-- Color Picker Trigger -->
          <div class="relative w-11 h-11 shrink-0 rounded-xl overflow-hidden border border-border shadow-sm group">
            <input
              type="color"
              id="fg-color-picker"
              value={fgPickerValue}
              oninput={handleFgPickerChange}
              onchange={handleFgPickerChange}
              aria-label="Foreground color eyedropper"
              class="absolute -inset-2 w-16 h-16 cursor-pointer opacity-0 z-10"
            />
            <div
              class="w-full h-full rounded-xl transition-transform group-hover:scale-105"
              style="background-color: {fgPickerValue};"
            ></div>
          </div>

          <!-- HEX Input Box -->
          <div class="relative flex-1">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xs select-none">
              #
            </span>
            <input
              type="text"
              id="fg-hex-input"
              value={typedFg}
              oninput={handleFgTextInput}
              maxlength="7"
              placeholder="191919"
              spellcheck="false"
              class="w-full pl-7 pr-3 py-2 text-sm font-mono font-bold bg-surface border rounded-xl text-foreground placeholder:text-muted-foreground/50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent {fgError ? 'border-red-500 focus:ring-red-400' : 'border-border'}"
            />
          </div>
        </div>

        {#if fgError}
          <p class="text-[11px] font-mono text-red-600 dark:text-red-400 flex items-center gap-1 mt-1 animate-in fade-in duration-150">
            <AlertCircle class="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>Invalid HEX format (enter 3 or 6 hex digits)</span>
          </p>
        {/if}
      </div>

      <!-- Background Input Card -->
      <div class="space-y-2 rounded-xl border border-border bg-background/60 p-4 relative focus-within:border-accent transition-colors">
        <div class="flex items-center justify-between">
          <label for="bg-hex-input" class="text-xs font-mono font-bold uppercase text-foreground flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full border border-border" style="background-color: {bgPickerValue};"></span>
            <span>Background</span>
          </label>
          <span class="text-[11px] font-mono text-muted-foreground">
            Luminance: {bgLuminance.toFixed(3)}
          </span>
        </div>

        <div class="flex items-center gap-2.5">
          <!-- Color Picker Trigger -->
          <div class="relative w-11 h-11 shrink-0 rounded-xl overflow-hidden border border-border shadow-sm group">
            <input
              type="color"
              id="bg-color-picker"
              value={bgPickerValue}
              oninput={handleBgPickerChange}
              onchange={handleBgPickerChange}
              aria-label="Background color eyedropper"
              class="absolute -inset-2 w-16 h-16 cursor-pointer opacity-0 z-10"
            />
            <div
              class="w-full h-full rounded-xl transition-transform group-hover:scale-105"
              style="background-color: {bgPickerValue};"
            ></div>
          </div>

          <!-- HEX Input Box -->
          <div class="relative flex-1">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xs select-none">
              #
            </span>
            <input
              type="text"
              id="bg-hex-input"
              value={typedBg}
              oninput={handleBgTextInput}
              maxlength="7"
              placeholder="FFFFFF"
              spellcheck="false"
              class="w-full pl-7 pr-3 py-2 text-sm font-mono font-bold bg-surface border rounded-xl text-foreground placeholder:text-muted-foreground/50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent {bgError ? 'border-red-500 focus:ring-red-400' : 'border-border'}"
            />
          </div>
        </div>

        {#if bgError}
          <p class="text-[11px] font-mono text-red-600 dark:text-red-400 flex items-center gap-1 mt-1 animate-in fade-in duration-150">
            <AlertCircle class="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>Invalid HEX format (enter 3 or 6 hex digits)</span>
          </p>
        {/if}
      </div>
    </div>

    <!-- Quick Presets -->
    <div class="mt-5 pt-4 border-t border-border">
      <div class="flex items-center gap-1.5 mb-2.5 text-xs font-mono text-muted-foreground">
        <Sparkles class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span>Quick Presets:</span>
      </div>

      <div class="flex flex-wrap gap-2">
        {#each CONTRAST_PRESETS as preset (preset.id)}
          <button
            type="button"
            onclick={() => onselectPreset(preset)}
            title={preset.description}
            class="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-surface text-xs font-mono text-foreground hover:border-border-strong cursor-pointer transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <!-- Dual swatch circle -->
            <span class="relative flex h-4 w-4 shrink-0 rounded-full overflow-hidden border border-border-strong">
              <span class="absolute left-0 top-0 bottom-0 w-1/2" style="background-color: {preset.foreground};"></span>
              <span class="absolute right-0 top-0 bottom-0 w-1/2" style="background-color: {preset.background};"></span>
            </span>
            <span>{preset.name}</span>
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>
