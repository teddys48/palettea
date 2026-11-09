<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import AlertTriangle from 'lucide-svelte/icons/alert-triangle';
  import RefreshCw from 'lucide-svelte/icons/refresh-cw';
  import ColorInput from './ColorInput.svelte';
  import ColorPreview from './ColorPreview.svelte';
  import ColorFormats from './ColorFormats.svelte';
  import { fetchColorInfo, ColorApiError } from '../../services/color-api';
  import { normalizeHex } from '../../utils/color-utils';
  import type { ColorApiResponse, ColorRequestStatus } from '../../types/color';

  interface Props {
    initialHex?: string;
    onsavePalette?: (color: { hex: string; name?: string }) => void;
  }

  let { initialHex = $bindable('4F46E5'), onsavePalette }: Props = $props();

  const initialClean = normalizeHex(initialHex) || '4F46E5';
  let activeCleanHex = $state(initialClean);
  let previousPropHex = initialClean;
  let status = $state<ColorRequestStatus>('idle');
  let errorMessage = $state<string | null>(null);
  let colorData = $state<ColorApiResponse | null>(null);
  let activeAbortController: AbortController | null = null;
  let isInitialized = false;

  async function loadColor(cleanHex: string) {
    const valid = normalizeHex(cleanHex);
    if (!valid) {
      status = 'invalid';
      errorMessage = 'Please provide a valid 3-character or 6-character hex color.';
      return;
    }

    // Abort previous in-flight request to prevent race conditions
    if (activeAbortController) {
      activeAbortController.abort();
    }
    activeAbortController = new AbortController();

    activeCleanHex = valid;
    previousPropHex = valid;
    initialHex = valid;
    status = 'loading';
    errorMessage = null;

    try {
      const data = await fetchColorInfo(valid, activeAbortController.signal);
      colorData = data;
      status = 'success';
    } catch (err) {
      // Ignore AbortError when a newer request cancelled this one
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      status = 'error';
      colorData = null;
      if (err instanceof ColorApiError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'An unexpected error occurred while inspecting color.';
      }
    } finally {
      if (!activeAbortController?.signal.aborted) {
        activeAbortController = null;
      }
    }
  }

  function handleColorChange(newCleanHex: string) {
    loadColor(newCleanHex);
  }

  function handleRetry() {
    loadColor(activeCleanHex);
  }

  $effect(() => {
    const currentProp = initialHex;
    const normalizedProp = normalizeHex(currentProp);
    if (normalizedProp) {
      if (!isInitialized || normalizedProp !== previousPropHex) {
        isInitialized = true;
        previousPropHex = normalizedProp;
        untrack(() => {
          loadColor(normalizedProp);
        });
      }
    }
  });

  onMount(() => {
    return () => {
      if (activeAbortController) {
        activeAbortController.abort();
      }
    };
  });
</script>

<div class="space-y-6">
  <!-- Color Input Controls -->
  <ColorInput
    selectedHex={activeCleanHex}
    isLoading={status === 'loading'}
    onapplyColor={handleColorChange}
  />

  <!-- Main Inspector State Container -->
  {#if status === 'loading' && !colorData}
    <!-- Zero-layout-shift Skeleton Loading State -->
    <div class="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading color details">
      <div class="w-full h-64 sm:h-72 md:h-80 rounded-3xl bg-zinc-200 dark:bg-zinc-800/60 border border-border"></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {#each Array(6) as _, i (i)}
          <div class="h-28 rounded-xl bg-zinc-200 dark:bg-zinc-800/60 border border-border"></div>
        {/each}
      </div>
    </div>
  {:else if status === 'error'}
    <!-- Accessible Actionable Error State -->
    <div
      role="alert"
      class="rounded-2xl border-2 border-red-500/50 bg-red-50 dark:bg-red-950/30 p-6 text-center space-y-4 shadow-neo"
    >
      <div class="w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
        <AlertTriangle class="w-6 h-6" aria-hidden="true" />
      </div>
      <div>
        <h3 class="text-base font-bold text-red-900 dark:text-red-200">
          Color Inspection Error
        </h3>
        <p class="text-xs text-red-700 dark:text-red-300 mt-1 max-w-md mx-auto">
          {errorMessage || 'Unable to retrieve color data from API.'}
        </p>
      </div>
      <div>
        <button
          type="button"
          onclick={handleRetry}
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-red-600 hover:bg-red-700 text-white shadow-neo cursor-pointer transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <RefreshCw class="w-3.5 h-3.5" aria-hidden="true" />
          <span>Retry Color Inspection</span>
        </button>
      </div>
    </div>
  {:else if colorData}
    <!-- Main Two-Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left Column: Visual Swatch & Details (5 cols on lg) -->
      <div class="lg:col-span-5">
        <ColorPreview
          hex={activeCleanHex}
          {colorData}
          onsave={onsavePalette}
        />
      </div>

      <!-- Right Column: 6 Color Format Blocks (7 cols on lg) -->
      <div class="lg:col-span-7">
        <ColorFormats {colorData} />
      </div>
    </div>
  {/if}
</div>
