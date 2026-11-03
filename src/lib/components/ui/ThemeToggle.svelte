<script lang="ts">
  import Sun from 'lucide-svelte/icons/sun';
  import Moon from 'lucide-svelte/icons/moon';
  import type { Theme } from '../../types';

  interface Props {
    theme: Theme;
    ontoggle: () => void;
  }

  let { theme, ontoggle }: Props = $props();
</script>

<button
  type="button"
  onclick={ontoggle}
  aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
  title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
  class="relative inline-flex items-center justify-center p-2 rounded-lg border border-border bg-surface text-foreground shadow-neo hover:border-border-strong hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
>
  {#if theme === 'dark'}
    <Sun class="w-4 h-4 text-amber-400" aria-hidden="true" />
  {:else}
    <Moon class="w-4 h-4 text-foreground" aria-hidden="true" />
  {/if}
  <span class="sr-only">Toggle theme</span>
</button>
