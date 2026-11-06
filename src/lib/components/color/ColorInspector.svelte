<script lang="ts">
  import { onMount } from 'svelte';
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

  let { initialHex = '4F46E5', onsavePalette }: Props = $props();

  let activeCleanHex = $state('4F46E5');
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
    const normalizedProp = normalizeHex(initialHex);
    if (normalizedProp) {
      if (!isInitialized || normalizedProp !== activeCleanHex) {
        isInitialized = true;
        loadColor(normalizedProp);
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
      <div class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
        <AlertTriangle class="w-6 h-6" aria-hidden="true" />
      </div>

      <div class="space-y-1 max-w-md mx-auto">
        <h3 class="text-base font-bold text-red-900 dark:text-red-200">
          Color Inspection Failed
        </h3>
        <p class="text-xs sm:text-sm text-red-700 dark:text-red-300 font-mono">
          {errorMessage ?? 'Could not fetch color details from The Color API.'}
        </p>
      </div>

      <div class="flex items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onclick={handleRetry}
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-medium text-xs font-mono shadow-neo hover:bg-red-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <RefreshCw class="w-3.5 h-3.5" aria-hidden="true" />
          <span>Retry Inspection</span>
        </button>

        <button
          type="button"
          onclick={() => handleColorChange('4F46E5')}
          class="px-4 py-2 rounded-xl border border-red-300 dark:border-red-800 bg-surface text-foreground font-medium text-xs font-mono shadow-sm hover:bg-surface-hover cursor-pointer"
        >
          Reset to Default
        </button>
      </div>
    </div>
  {:else}
    <!-- Color Preview & Format Breakdown -->
    <div class="space-y-6 animate-in fade-in duration-200">
      <ColorPreview
        hex={activeCleanHex}
        {colorData}
        onsave={onsavePalette}
      />

      {#if colorData}
        <ColorFormats {colorData} />
      {/if}
    </div>
  {/if}
</div>
