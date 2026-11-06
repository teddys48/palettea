<script lang="ts">
  import { onMount } from 'svelte';
  import AlertTriangle from 'lucide-svelte/icons/alert-triangle';
  import RefreshCw from 'lucide-svelte/icons/refresh-cw';
  import SchemeControls from './SchemeControls.svelte';
  import SchemePalette from './SchemePalette.svelte';
  import { fetchColorScheme, ColorApiError } from '../../services/color-api';
  import { normalizeHex, getRandomHex } from '../../utils/color-utils';
  import type { SchemeApiResponse, SchemeMode, SchemeRequestStatus } from '../../types/scheme';

  interface Props {
    initialHex?: string;
    inspectorHex?: string;
    oninspectColor?: (cleanHex: string) => void;
    onsavePalette?: (colors: Array<{ hex: string; name?: string }>, title?: string) => void;
  }

  let {
    initialHex = '4F46E5',
    inspectorHex,
    oninspectColor,
    onsavePalette,
  }: Props = $props();

  let baseHex = $state('4F46E5');
  let harmonyMode = $state<SchemeMode>('complement');
  let count = $state(5);

  let status = $state<SchemeRequestStatus>('idle');
  let errorMessage = $state<string | null>(null);
  let schemeData = $state<SchemeApiResponse | null>(null);

  let activeAbortController: AbortController | null = null;
  let isInitialized = false;

  async function loadScheme(targetHex: string, targetMode: SchemeMode, targetCount: number) {
    const valid = normalizeHex(targetHex);
    if (!valid) {
      status = 'error';
      errorMessage = 'Please provide a valid 3-character or 6-character hex color.';
      return;
    }

    if (activeAbortController) {
      activeAbortController.abort();
    }
    activeAbortController = new AbortController();

    baseHex = valid;
    harmonyMode = targetMode;
    count = targetCount;
    status = 'loading';
    errorMessage = null;

    try {
      const data = await fetchColorScheme(valid, targetMode, targetCount, activeAbortController.signal);
      schemeData = data;
      status = 'success';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      status = 'error';
      schemeData = null;
      if (err instanceof ColorApiError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'Failed to generate color scheme. Please try again.';
      }
    } finally {
      if (!activeAbortController?.signal.aborted) {
        activeAbortController = null;
      }
    }
  }

  function handleBaseHexChange(newCleanHex: string) {
    loadScheme(newCleanHex, harmonyMode, count);
  }

  function handleModeChange(newMode: SchemeMode) {
    if (newMode !== harmonyMode) {
      loadScheme(baseHex, newMode, count);
    }
  }

  function handleCountChange(newCount: number) {
    if (newCount !== count) {
      loadScheme(baseHex, harmonyMode, newCount);
    }
  }

  function handleRandomize() {
    const randomHex = getRandomHex();
    loadScheme(randomHex, harmonyMode, count);
  }

  function handleUseInspectorColor() {
    if (inspectorHex) {
      const valid = normalizeHex(inspectorHex);
      if (valid) {
        loadScheme(valid, harmonyMode, count);
      }
    }
  }

  function handleRegenerate() {
    loadScheme(baseHex, harmonyMode, count);
  }

  function handleRetry() {
    loadScheme(baseHex, harmonyMode, count);
  }

  // Keyboard shortcut: Space triggers random base color (with strict focus guards)
  function handleWindowKeyDown(e: KeyboardEvent) {
    if (e.key === ' ' || e.code === 'Space') {
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName.toLowerCase();
        if (
          tagName === 'input' ||
          tagName === 'textarea' ||
          tagName === 'select' ||
          tagName === 'button' ||
          (activeEl as HTMLElement).isContentEditable
        ) {
          return;
        }
      }
      e.preventDefault();
      handleRandomize();
    }
  }

  $effect(() => {
    const normalizedProp = normalizeHex(initialHex);
    if (normalizedProp && !isInitialized) {
      isInitialized = true;
      loadScheme(normalizedProp, harmonyMode, count);
    }
  });

  onMount(() => {
    window.addEventListener('keydown', handleWindowKeyDown);
    return () => {
      window.removeEventListener('keydown', handleWindowKeyDown);
      if (activeAbortController) {
        activeAbortController.abort();
      }
    };
  });
</script>

<div class="space-y-6">
  <!-- Interactive Scheme Generator Controls -->
  <SchemeControls
    {baseHex}
    {harmonyMode}
    {count}
    isLoading={status === 'loading'}
    {inspectorHex}
    onchangeBaseHex={handleBaseHexChange}
    onchangeMode={handleModeChange}
    onchangeCount={handleCountChange}
    onrandomize={handleRandomize}
    onuseInspectorColor={handleUseInspectorColor}
    onregenerate={handleRegenerate}
  />

  <!-- Main Palette or Error State -->
  {#if status === 'error'}
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
          Scheme Generation Failed
        </h3>
        <p class="text-xs sm:text-sm text-red-700 dark:text-red-300 font-mono">
          {errorMessage ?? 'Could not generate scheme from The Color API.'}
        </p>
      </div>

      <div class="flex items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onclick={handleRetry}
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-medium text-xs font-mono shadow-neo hover:bg-red-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <RefreshCw class="w-3.5 h-3.5" aria-hidden="true" />
          <span>Retry Generation</span>
        </button>

        <button
          type="button"
          onclick={() => loadScheme('4F46E5', 'complement', 5)}
          class="px-4 py-2 rounded-xl border border-red-300 dark:border-red-800 bg-surface text-foreground font-medium text-xs font-mono shadow-sm hover:bg-surface-hover cursor-pointer"
        >
          Reset to Default
        </button>
      </div>
    </div>
  {:else}
    <!-- Scheme Palette Visualization -->
    <SchemePalette
      colors={schemeData?.colors ?? []}
      seedHex={baseHex}
      isLoading={status === 'loading' && !schemeData}
      skeletonCount={count}
      oninspect={oninspectColor}
      onsave={onsavePalette ? (colors: Array<{ hex: string; name?: string }>) => onsavePalette?.(colors, `Scheme ${harmonyMode.charAt(0).toUpperCase() + harmonyMode.slice(1)} #${baseHex}`) : undefined}
    />
  {/if}
</div>
