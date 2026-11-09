<script lang="ts">
  import Copy from 'lucide-svelte/icons/copy';
  import Check from 'lucide-svelte/icons/check';
  import ChevronDown from 'lucide-svelte/icons/chevron-down';
  import { copyToClipboard } from '../../utils/clipboard';
  import { formatHex, hexToRgb, rgbToHsl } from '../../utils/color-utils';
  import { normalizeIdentifier } from '../../utils/export-utils';

  interface Props {
    hex: string;
    name?: string;
    cssVarName?: string;
    class?: string;
  }

  let { hex, name, cssVarName, class: className = '' }: Props = $props();

  let isOpen = $state(false);
  let copiedFormat = $state<string | null>(null);
  let feedbackTimeout: ReturnType<typeof setTimeout> | null = null;

  const formattedHex = $derived(formatHex(hex));
  const rgbObj = $derived(hexToRgb(formattedHex) || { r: 0, g: 0, b: 0 });
  const hslObj = $derived(rgbToHsl(rgbObj.r, rgbObj.g, rgbObj.b));

  const rgbCss = $derived(`rgb(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b})`);
  const hslCss = $derived(`hsl(${hslObj.h}, ${hslObj.s}%, ${hslObj.l}%)`);
  const effectiveVarName = $derived(
    cssVarName || `--color-${normalizeIdentifier(name || 'custom', 'custom')}`
  );
  const cssVarValue = $derived(`var(${effectiveVarName}, ${formattedHex})`);

  function toggleMenu(e: MouseEvent) {
    e.stopPropagation();
    isOpen = !isOpen;
  }

  function closeMenu() {
    isOpen = false;
  }

  async function handleCopy(text: string, formatId: string, e: MouseEvent) {
    e.stopPropagation();
    const success = await copyToClipboard(text);
    if (success) {
      if (feedbackTimeout) clearTimeout(feedbackTimeout);
      copiedFormat = formatId;
      feedbackTimeout = setTimeout(() => {
        copiedFormat = null;
        isOpen = false;
      }, 1200);
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
    }
  }
</script>

<svelte:window onclick={closeMenu} onkeydown={handleKeydown} />

<div class="relative inline-block {className}">
  <button
    type="button"
    onclick={toggleMenu}
    aria-expanded={isOpen}
    aria-haspopup="true"
    title="Copy color formats"
    aria-label="Copy formats for {formattedHex}"
    class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface/90 hover:bg-surface border border-border shadow-sm text-xs font-mono font-medium text-foreground cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
  >
    <span>Copy</span>
    <ChevronDown class="w-3 h-3 text-muted-foreground transition-transform {isOpen ? 'rotate-180' : ''}" aria-hidden="true" />
  </button>

  {#if isOpen}
    <div
      role="menu"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => {
        if (e.key === 'Escape') closeMenu();
      }}
      class="absolute right-0 top-full mt-1.5 z-50 w-56 rounded-xl border border-border bg-surface p-1.5 shadow-neo text-xs font-mono animate-in fade-in zoom-in-95 duration-100"
    >
      <div class="px-2 py-1 text-[10px] uppercase font-bold text-muted-foreground border-b border-border/50 mb-1 flex items-center justify-between">
        <span>{name || 'Color Code'}</span>
        <span class="w-3 h-3 rounded-full border border-border" style="background-color: {formattedHex};"></span>
      </div>

      <!-- Copy HEX -->
      <button
        type="button"
        role="menuitem"
        onclick={(e) => handleCopy(formattedHex, 'hex', e)}
        class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-background transition-colors text-left text-foreground cursor-pointer"
      >
        <div class="flex flex-col truncate">
          <span class="text-[10px] text-muted-foreground uppercase">HEX</span>
          <span class="font-semibold truncate">{formattedHex}</span>
        </div>
        {#if copiedFormat === 'hex'}
          <span class="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            <Check class="w-3 h-3" aria-hidden="true" />
            <span>Copied</span>
          </span>
        {:else}
          <Copy class="w-3 h-3 text-muted-foreground" aria-hidden="true" />
        {/if}
      </button>

      <!-- Copy RGB -->
      <button
        type="button"
        role="menuitem"
        onclick={(e) => handleCopy(rgbCss, 'rgb', e)}
        class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-background transition-colors text-left text-foreground cursor-pointer"
      >
        <div class="flex flex-col truncate">
          <span class="text-[10px] text-muted-foreground uppercase">RGB</span>
          <span class="font-semibold truncate">{rgbCss}</span>
        </div>
        {#if copiedFormat === 'rgb'}
          <span class="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            <Check class="w-3 h-3" aria-hidden="true" />
            <span>Copied</span>
          </span>
        {:else}
          <Copy class="w-3 h-3 text-muted-foreground" aria-hidden="true" />
        {/if}
      </button>

      <!-- Copy HSL -->
      <button
        type="button"
        role="menuitem"
        onclick={(e) => handleCopy(hslCss, 'hsl', e)}
        class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-background transition-colors text-left text-foreground cursor-pointer"
      >
        <div class="flex flex-col truncate">
          <span class="text-[10px] text-muted-foreground uppercase">HSL</span>
          <span class="font-semibold truncate">{hslCss}</span>
        </div>
        {#if copiedFormat === 'hsl'}
          <span class="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            <Check class="w-3 h-3" aria-hidden="true" />
            <span>Copied</span>
          </span>
        {:else}
          <Copy class="w-3 h-3 text-muted-foreground" aria-hidden="true" />
        {/if}
      </button>

      <!-- Copy CSS Var -->
      <button
        type="button"
        role="menuitem"
        onclick={(e) => handleCopy(cssVarValue, 'cssvar', e)}
        class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-background transition-colors text-left text-foreground cursor-pointer"
      >
        <div class="flex flex-col truncate">
          <span class="text-[10px] text-muted-foreground uppercase">CSS Variable</span>
          <span class="font-semibold truncate">{effectiveVarName}</span>
        </div>
        {#if copiedFormat === 'cssvar'}
          <span class="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            <Check class="w-3 h-3" aria-hidden="true" />
            <span>Copied</span>
          </span>
        {:else}
          <Copy class="w-3 h-3 text-muted-foreground" aria-hidden="true" />
        {/if}
      </button>
    </div>
  {/if}
</div>
