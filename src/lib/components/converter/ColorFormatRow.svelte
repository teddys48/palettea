<script lang="ts">
  import Copy from 'lucide-svelte/icons/copy';
  import Check from 'lucide-svelte/icons/check';
  import Edit3 from 'lucide-svelte/icons/edit-3';
  import { copyToClipboard } from '../../utils/clipboard';
  import type { SupportedColorFormat } from '../../types/color';

  interface Props {
    formatId: SupportedColorFormat;
    label: string;
    value: string;
    cssValue: string;
    rawValue: string;
    description: string;
    isActiveInput: boolean;
    useCssFormat: boolean;
    onselectInput?: (format: SupportedColorFormat) => void;
  }

  let {
    formatId,
    label,
    value,
    cssValue,
    rawValue,
    description,
    isActiveInput,
    useCssFormat,
    onselectInput,
  }: Props = $props();

  let isCopied = $state(false);
  let copyTimeout: ReturnType<typeof setTimeout> | null = null;
  let copyFailed = $state(false);

  const displayValue = $derived(
    formatId === 'hex' ? value : useCssFormat ? cssValue : rawValue
  );

  async function handleCopy() {
    const success = await copyToClipboard(displayValue);
    if (success) {
      isCopied = true;
      copyFailed = false;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        isCopied = false;
      }, 2000);
    } else {
      copyFailed = true;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        copyFailed = false;
      }, 3000);
    }
  }

  function handleSelect() {
    if (onselectInput) {
      onselectInput(formatId);
    }
  }
</script>

<div
  class="group relative rounded-xl border bg-surface p-4 shadow-neo transition-all duration-150 flex flex-col justify-between {isActiveInput ? 'border-accent ring-2 ring-accent/30 bg-accent/5 dark:bg-accent/10' : 'border-border hover:border-border-strong hover:translate-x-[-1px] hover:translate-y-[-1px]'}"
>
  <div class="space-y-2">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span
          class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-bold tracking-wider uppercase border {isActiveInput ? 'bg-accent text-white border-accent' : 'bg-background text-accent border-border'}"
        >
          {label}
        </span>
        {#if isActiveInput}
          <span class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-accent/15 text-accent font-semibold">
            Active Source
          </span>
        {/if}
      </div>

      <div class="flex items-center gap-1.5">
        {#if !isActiveInput && onselectInput}
          <button
            type="button"
            onclick={handleSelect}
            title="Set {label} as active input format"
            aria-label="Edit {label} format"
            class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono border border-border bg-background hover:bg-surface text-muted-foreground hover:text-foreground transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Edit3 class="w-3 h-3" aria-hidden="true" />
            <span class="hidden sm:inline">Edit</span>
          </button>
        {/if}

        <button
          type="button"
          onclick={handleCopy}
          aria-label="Copy {label} value {displayValue}"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {isCopied ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold' : copyFailed ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' : 'bg-background hover:bg-surface text-muted-foreground hover:text-foreground border-border'}"
        >
          {#if isCopied}
            <Check class="w-3 h-3 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span>Copied!</span>
          {:else if copyFailed}
            <span>Failed</span>
          {:else}
            <Copy class="w-3 h-3" aria-hidden="true" />
            <span>Copy</span>
          {/if}
        </button>
      </div>
    </div>

    <!-- Value Display -->
    <div class="pt-1">
      <span class="text-sm sm:text-base font-mono font-bold text-foreground select-all break-all tracking-wide">
        {displayValue}
      </span>
    </div>
  </div>

  <p class="text-[11px] text-muted-foreground mt-3 pt-2 border-t border-border/70">
    {description}
  </p>
</div>
