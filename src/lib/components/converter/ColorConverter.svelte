<script lang="ts">
  import { untrack } from 'svelte';
  import Sparkles from 'lucide-svelte/icons/sparkles';
  import Search from 'lucide-svelte/icons/search';
  import ColorFormatInput from './ColorFormatInput.svelte';
  import ColorConversionResults from './ColorConversionResults.svelte';
  import {
    convertAllFormats,
    convertColorInput,
    getContrastColor,
    normalizeHex,
  } from '../../utils/color-utils';
  import type {
    ConvertedColorResult,
    SupportedColorFormat,
  } from '../../types/color';

  interface Props {
    initialHex?: string;
    oninspectColor?: (cleanHex: string) => void;
  }

  let { initialHex = $bindable('7C83FD'), oninspectColor }: Props = $props();

  const DEFAULT_HEX = '7C83FD';

  function initColor(hex: string): ConvertedColorResult {
    const clean = normalizeHex(hex) || DEFAULT_HEX;
    const fromHex = convertColorInput('hex', clean);
    if (fromHex.success) {
      return fromHex.data;
    }
    return convertAllFormats({ r: 124, g: 131, b: 253 });
  }

  const initialClean = normalizeHex(initialHex) || DEFAULT_HEX;
  const initialResult = initColor(initialClean);

  // State management
  let activeFormat = $state<SupportedColorFormat>('hex');
  let lastValidResult = $state<ConvertedColorResult>(initialResult);
  let activeInputText = $state(initialResult.hex.value);

  let isInputValid = $state(true);
  let validationErrorMessage = $state<string | null>(null);

  // Track the last processed prop hex to prevent effect loops and self-overwriting
  let previousPropHex = initialClean;

  // Contrast foreground for preview swatch
  const previewTextColor = $derived(getContrastColor(lastValidResult.hex.value));

  // Quick preset colors
  const quickPresets = [
    { name: 'Electric Violet', hex: '7C83FD' },
    { name: 'Indigo Accent', hex: '4F46E5' },
    { name: 'Emerald Forest', hex: '10B981' },
    { name: 'Amber Glow', hex: 'F59E0B' },
    { name: 'Crimson Rose', hex: 'EF4444' },
    { name: 'Obsidian Noir', hex: '09090B' },
    { name: 'Pure Alabaster', hex: 'FFFFFF' },
  ];

  function getFormatValue(result: ConvertedColorResult, format: SupportedColorFormat): string {
    switch (format) {
      case 'hex':
        return result.hex.value;
      case 'rgb':
        return result.rgb.value;
      case 'hsl':
        return result.hsl.value;
      case 'hsv':
        return result.hsv.value;
      case 'cmyk':
        return result.cmyk.value;
    }
  }

  function applyColorResult(result: ConvertedColorResult) {
    lastValidResult = result;
    activeInputText = getFormatValue(result, activeFormat);
    isInputValid = true;
    validationErrorMessage = null;
    previousPropHex = result.hex.raw;
    initialHex = result.hex.raw;
  }

  // Handle user typing into input
  function handleInputChange(newText: string) {
    activeInputText = newText;
    const conversion = convertColorInput(activeFormat, newText);

    if (conversion.success) {
      lastValidResult = conversion.data;
      isInputValid = true;
      validationErrorMessage = null;
      previousPropHex = conversion.data.hex.raw;
      initialHex = conversion.data.hex.raw;
    } else {
      isInputValid = false;
      validationErrorMessage = conversion.error;
    }
  }

  // Handle format tab change
  function handleFormatChange(newFormat: SupportedColorFormat) {
    activeFormat = newFormat;
    activeInputText = getFormatValue(lastValidResult, newFormat);
    isInputValid = true;
    validationErrorMessage = null;
  }

  // Handle native color picker change
  function handlePickerChange(newHex: string) {
    const clean = normalizeHex(newHex);
    if (clean) {
      const conversion = convertColorInput('hex', clean);
      if (conversion.success) {
        applyColorResult(conversion.data);
      }
    }
  }

  // Handle preset click
  function handlePresetClick(cleanHex: string) {
    const conversion = convertColorInput('hex', cleanHex);
    if (conversion.success) {
      applyColorResult(conversion.data);
    }
  }

  // Handle reset to default
  function handleReset() {
    const conversion = convertColorInput('hex', DEFAULT_HEX);
    if (conversion.success) {
      activeFormat = 'hex';
      applyColorResult(conversion.data);
    }
  }

  function handleSendToInspector() {
    if (oninspectColor) {
      oninspectColor(lastValidResult.hex.raw);
    }
  }

  // React to initialHex change if passed from parent
  $effect(() => {
    const currentProp = initialHex;
    const cleanProp = normalizeHex(currentProp);
    if (cleanProp && cleanProp !== previousPropHex) {
      previousPropHex = cleanProp;
      untrack(() => {
        const conversion = convertColorInput('hex', cleanProp);
        if (conversion.success) {
          applyColorResult(conversion.data);
        }
      });
    }
  });
</script>

<div class="space-y-6">
  <!-- Color Preview Banner with Contrast-aware Overlay -->
  <div
    class="relative w-full rounded-2xl sm:rounded-3xl border-2 border-border-strong/40 dark:border-zinc-800 p-6 sm:p-8 shadow-neo transition-colors duration-200 overflow-hidden flex flex-col justify-between min-h-[180px] sm:min-h-[220px]"
    style="background-color: {lastValidResult.hex.value};"
  >
    <!-- Top Row of Preview Banner -->
    <div class="flex items-center justify-between gap-3">
      <div
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md bg-black/20 text-white border border-white/20 text-xs font-mono font-semibold"
      >
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true"></span>
        <span>Live Color Preview</span>
      </div>

      {#if oninspectColor}
        <button
          type="button"
          onclick={handleSendToInspector}
          title="Inspect this color in Color Inspector"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs font-mono font-bold transition-all cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Search class="w-3.5 h-3.5" aria-hidden="true" />
          <span>Inspect in Detail</span>
        </button>
      {/if}
    </div>

    <!-- Bottom Row of Preview Banner: Color Breakdown Callouts -->
    <div
      class="pt-6 flex flex-wrap items-end justify-between gap-4 transition-colors duration-200"
      style="color: {previewTextColor};"
    >
      <div>
        <div class="text-xs font-mono uppercase tracking-wider opacity-80">
          Canonical HEX
        </div>
        <div class="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight">
          {lastValidResult.hex.value}
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-mono opacity-90">
        <div>
          <span class="opacity-70">RGB: </span>
          <span class="font-bold">{lastValidResult.rgb.value}</span>
        </div>
        <div>
          <span class="opacity-70">HSL: </span>
          <span class="font-bold">{lastValidResult.hsl.value}</span>
        </div>
        <div>
          <span class="opacity-70">CMYK: </span>
          <span class="font-bold">{lastValidResult.cmyk.value}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Interactive Input Controls -->
  <ColorFormatInput
    {activeFormat}
    inputText={activeInputText}
    pickerHex={lastValidResult.hex.value}
    isValid={isInputValid}
    errorMessage={validationErrorMessage}
    onchangeFormat={handleFormatChange}
    onchangeInput={handleInputChange}
    onchangePicker={handlePickerChange}
    onreset={handleReset}
  />

  <!-- Quick Preset Swatches -->
  <div class="rounded-2xl border border-border bg-surface p-4 shadow-neo flex flex-wrap items-center gap-2">
    <div class="flex items-center gap-1.5 text-xs font-mono font-bold text-foreground mr-2">
      <Sparkles class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
      <span>Quick Presets:</span>
    </div>
    {#each quickPresets as preset (preset.hex)}
      <button
        type="button"
        onclick={() => handlePresetClick(preset.hex)}
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-surface hover:border-border-strong text-xs font-mono text-foreground transition-all cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {lastValidResult.hex.raw === preset.hex ? 'ring-2 ring-accent border-accent font-bold' : ''}"
      >
        <span
          class="w-3 h-3 rounded-full border border-black/20 shrink-0 shadow-inner"
          style="background-color: #{preset.hex};"
          aria-hidden="true"
        ></span>
        <span>#{preset.hex}</span>
      </button>
    {/each}
  </div>

  <!-- Real-time Converted Results Breakdown -->
  <ColorConversionResults
    result={lastValidResult}
    {activeFormat}
    onselectFormat={handleFormatChange}
  />
</div>
