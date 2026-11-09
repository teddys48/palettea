<script lang="ts">
  import Copy from 'lucide-svelte/icons/copy';
  import Check from 'lucide-svelte/icons/check';
  import Download from 'lucide-svelte/icons/download';
  import Palette from 'lucide-svelte/icons/palette';
  import Button from '../ui/Button.svelte';
  import { copyToClipboard } from '../../utils/clipboard';
  import { downloadFile } from '../../services/export/file-download';
  import { getExportFilename, getExportMimeType } from '../../utils/filename-utils';
  import type { ExportFormat, TailwindVersion, ExportColorItem } from '../../types/export';
  import { formatHex } from '../../utils/color-utils';

  interface Props {
    code: string;
    paletteName: string;
    colors: ExportColorItem[];
    format: ExportFormat;
    tailwindVersion?: TailwindVersion;
  }

  let { code, paletteName, colors, format, tailwindVersion = 'v4' }: Props = $props();

  let isCopied = $state(false);
  let copyHexCopied = $state(false);
  let isDownloading = $state(false);
  let toastMessage = $state<{ text: string; type: 'success' | 'error' } | null>(null);

  const targetFilename = $derived(getExportFilename(paletteName, format, tailwindVersion));
  const mimeType = $derived(getExportMimeType(format, tailwindVersion));

  async function handleCopy() {
    if (!code) return;
    const success = await copyToClipboard(code);
    if (success) {
      isCopied = true;
      showToast('Export code copied to clipboard!', 'success');
      setTimeout(() => (isCopied = false), 2000);
    } else {
      showToast('Failed to copy to clipboard.', 'error');
    }
  }

  async function handleCopyAllHex() {
    if (!colors || colors.length === 0) return;
    const hexList = colors.map((c) => formatHex(c.hex)).join(', ');
    const success = await copyToClipboard(hexList);
    if (success) {
      copyHexCopied = true;
      showToast('All HEX values copied!', 'success');
      setTimeout(() => (copyHexCopied = false), 2000);
    }
  }

  function handleDownload() {
    if (!code) {
      showToast('Cannot download empty content.', 'error');
      return;
    }

    isDownloading = true;
    const result = downloadFile(code, targetFilename, mimeType);

    if (result.success) {
      showToast(`Downloaded ${targetFilename}!`, 'success');
    } else {
      showToast(result.error || 'Failed to download file.', 'error');
    }

    setTimeout(() => (isDownloading = false), 1000);
  }

  function showToast(text: string, type: 'success' | 'error') {
    toastMessage = { text, type };
    setTimeout(() => {
      toastMessage = null;
    }, 3000);
  }
</script>

<div class="space-y-3">
  <!-- Actions Button Group -->
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="flex flex-wrap items-center gap-2.5">
      <!-- Main Copy Button -->
      <Button
        variant="primary"
        size="md"
        onclick={handleCopy}
        class="min-w-[140px]"
      >
        {#if isCopied}
          <Check class="w-4 h-4 mr-2 text-emerald-300" aria-hidden="true" />
          <span>Copied!</span>
        {:else}
          <Copy class="w-4 h-4 mr-2" aria-hidden="true" />
          <span>Copy Code</span>
        {/if}
      </Button>

      <!-- Download Button -->
      <Button
        variant="secondary"
        size="md"
        onclick={handleDownload}
        class="min-w-[150px]"
      >
        <Download class="w-4 h-4 mr-2 {isDownloading ? 'animate-bounce' : ''}" aria-hidden="true" />
        <span>Download {targetFilename.split('.').pop()?.toUpperCase()}</span>
      </Button>

      <!-- Quick Copy HEX list -->
      <Button
        variant="ghost"
        size="md"
        onclick={handleCopyAllHex}
        title="Copy all colors as comma-separated HEX values"
      >
        {#if copyHexCopied}
          <Check class="w-4 h-4 mr-1 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <span>HEX Copied</span>
        {:else}
          <Palette class="w-4 h-4 mr-1 text-accent" aria-hidden="true" />
          <span>Copy HEX List</span>
        {/if}
      </Button>
    </div>

    <!-- Target File Info Indicator -->
    <div class="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
      <span>File:</span>
      <span class="px-2 py-1 rounded bg-surface border border-border text-foreground font-semibold">
        {targetFilename}
      </span>
    </div>
  </div>

  <!-- Feedback Toast Banner -->
  {#if toastMessage}
    <div
      role="status"
      class="p-3 rounded-xl text-xs font-mono border flex items-center gap-2 animate-in fade-in duration-150 {toastMessage.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300'}"
    >
      {#if toastMessage.type === 'success'}
        <Check class="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      {/if}
      <span>{toastMessage.text}</span>
    </div>
  {/if}
</div>
