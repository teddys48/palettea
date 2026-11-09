<script lang="ts">
  import Sliders from 'lucide-svelte/icons/sliders';
  import Copy from 'lucide-svelte/icons/copy';
  import Check from 'lucide-svelte/icons/check';
  import Download from 'lucide-svelte/icons/download';
  import Info from 'lucide-svelte/icons/info';
  import Button from '../ui/Button.svelte';
  import Badge from '../ui/Badge.svelte';
  import { copyToClipboard } from '../../utils/clipboard';
  import { downloadFile } from '../../services/export/file-download';
  import {
    STANDARD_SEMANTIC_ROLES,
    createTokensFromColors,
    exportTokensToCss,
  } from '../../services/export/token-service';
  import type { SemanticTokenDefinition, ExportColorItem } from '../../types/export';
  import { formatHex } from '../../utils/color-utils';

  interface Props {
    colors: ExportColorItem[];
    paletteName?: string;
  }

  let { colors, paletteName = 'Palette' }: Props = $props();

  let tokens = $state<SemanticTokenDefinition[]>([]);
  let prefix = $state('color');
  let selector = $state(':root');
  let copied = $state(false);
  let copyTimeout: ReturnType<typeof setTimeout> | null = null;
  let downloadToast = $state<string | null>(null);

  $effect(() => {
    tokens = createTokensFromColors(colors);
  });

  const generatedCss = $derived(exportTokensToCss(tokens, prefix, selector));

  const unassignedRoles = $derived(
    STANDARD_SEMANTIC_ROLES.filter(
      (role) => !tokens.some((t) => t.tokenName.toLowerCase() === role.role.toLowerCase())
    )
  );

  async function handleCopy() {
    const success = await copyToClipboard(generatedCss);
    if (success) {
      if (copyTimeout) clearTimeout(copyTimeout);
      copied = true;
      copyTimeout = setTimeout(() => {
        copied = false;
      }, 1500);
    }
  }

  function handleDownload() {
    const filename = `${paletteName.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}-tokens.css`;
    const res = downloadFile(generatedCss, filename, 'text/css;charset=utf-8');
    if (res.success) {
      downloadToast = 'Tokens downloaded!';
      setTimeout(() => (downloadToast = null), 2000);
    }
  }

  function updateTokenName(id: string, newName: string) {
    tokens = tokens.map((t) => (t.id === id ? { ...t, tokenName: newName } : t));
  }

  function updateTokenColor(id: string, newHex: string) {
    tokens = tokens.map((t) => (t.id === id ? { ...t, hex: formatHex(newHex) } : t));
  }

  function assignRoleToSlot(roleName: string, availableHex: string) {
    tokens = [
      ...tokens,
      {
        id: `token-${Date.now()}-${Math.random()}`,
        tokenName: roleName,
        hex: formatHex(availableHex),
        description: STANDARD_SEMANTIC_ROLES.find((r) => r.role === roleName)?.description,
      },
    ];
  }

  function removeToken(id: string) {
    tokens = tokens.filter((t) => t.id !== id);
  }
</script>

<div class="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-border shadow-neo flex items-center justify-center">
        <Sliders class="w-5 h-5 text-accent" aria-hidden="true" />
      </div>
      <div>
        <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
          <span>Semantic Color Token Generator</span>
          <Badge variant="accent" size="sm">Dev Tools</Badge>
        </h3>
        <p class="text-xs text-muted-foreground mt-0.5">
          Map palette colors to semantic design tokens. Edit tokens before exporting without fabricating colors.
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2">
      <Button variant="secondary" size="sm" onclick={handleCopy}>
        {#if copied}
          <Check class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mr-1" aria-hidden="true" />
          <span>Copied!</span>
        {:else}
          <Copy class="w-3.5 h-3.5 mr-1" aria-hidden="true" />
          <span>Copy Tokens</span>
        {/if}
      </Button>

      <Button variant="secondary" size="sm" onclick={handleDownload}>
        <Download class="w-3.5 h-3.5 mr-1" aria-hidden="true" />
        <span>Download .css</span>
      </Button>
    </div>
  </div>

  {#if downloadToast}
    <div class="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs font-mono text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
      <Check class="w-4 h-4" />
      <span>{downloadToast}</span>
    </div>
  {/if}

  <!-- Configuration Bar -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-background border border-border">
    <div class="flex items-center gap-2">
      <label for="token-prefix" class="text-xs font-mono text-muted-foreground whitespace-nowrap">Variable Prefix:</label>
      <input
        id="token-prefix"
        type="text"
        bind:value={prefix}
        placeholder="e.g. color"
        class="w-full px-2.5 py-1 text-xs font-mono rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </div>

    <div class="flex items-center gap-2">
      <label for="token-selector" class="text-xs font-mono text-muted-foreground whitespace-nowrap">CSS Selector:</label>
      <input
        id="token-selector"
        type="text"
        bind:value={selector}
        placeholder="e.g. :root"
        class="w-full px-2.5 py-1 text-xs font-mono rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </div>
  </div>

  <!-- Token Editor Rows -->
  <div class="space-y-3">
    <div class="text-xs font-bold uppercase tracking-wider font-mono text-muted-foreground">
      Configured Semantic Tokens ({tokens.length})
    </div>

    {#if tokens.length === 0}
      <div class="p-6 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground space-y-2">
        <p>No colors available in active palette to initialize tokens.</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        {#each tokens as token (token.id)}
          <div class="rounded-xl border border-border bg-background p-3 flex items-center justify-between gap-3 shadow-sm hover:border-border-strong transition-colors">
            <div class="flex items-center gap-2.5 flex-1 min-w-0">
              <label class="relative w-9 h-9 rounded-lg border border-border shadow-neo cursor-pointer flex-shrink-0 overflow-hidden" style="background-color: {token.hex};">
                <input
                  type="color"
                  value={token.hex}
                  oninput={(e) => updateTokenColor(token.id, (e.target as HTMLInputElement).value)}
                  class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </label>

              <div class="flex-1 min-w-0 space-y-1">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-mono text-muted-foreground">--{prefix ? `${prefix}-` : ''}</span>
                  <input
                    type="text"
                    value={token.tokenName}
                    onchange={(e) => updateTokenName(token.id, (e.target as HTMLInputElement).value)}
                    aria-label="Token name for {token.hex}"
                    class="px-1.5 py-0.5 text-xs font-mono font-bold rounded border border-transparent hover:border-border focus:border-accent bg-transparent text-foreground focus:outline-none"
                  />
                </div>
                <div class="text-[11px] font-mono text-muted-foreground truncate">
                  {token.hex} {token.description ? `• ${token.description}` : ''}
                </div>
              </div>
            </div>

            <button
              type="button"
              onclick={() => removeToken(token.id)}
              title="Remove token"
              aria-label="Remove token {token.tokenName}"
              class="text-xs font-mono text-muted-foreground hover:text-red-500 p-1.5 rounded-lg hover:bg-surface cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Unassigned Semantic Roles Warning/Helper -->
  {#if unassignedRoles.length > 0 && colors.length > 0}
    <div class="p-3 rounded-xl border border-border bg-background space-y-2">
      <div class="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
        <Info class="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span class="font-semibold">Unassigned Standard Roles ({unassignedRoles.length}):</span>
      </div>
      <p class="text-[11px] text-muted-foreground">
        Palettea does not fabricate random colors. You can map available palette colors to these roles:
      </p>

      <div class="flex flex-wrap gap-1.5 pt-1">
        {#each unassignedRoles as role (role.role)}
          <button
            type="button"
            onclick={() => assignRoleToSlot(role.role, colors[0]?.hex || '#4F46E5')}
            class="px-2 py-1 rounded-lg border border-border bg-surface hover:border-accent text-[11px] font-mono text-foreground cursor-pointer transition-colors"
            title={role.description}
          >
            + {role.label}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Live Output Preview -->
  <div class="space-y-2">
    <div class="flex items-center justify-between text-xs font-mono text-muted-foreground">
      <span>Generated CSS Tokens Output:</span>
      <span>{tokens.length} variables</span>
    </div>
    <pre class="p-3 rounded-xl bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800 select-all">{generatedCss}</pre>
  </div>
</div>
