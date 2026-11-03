<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'default' | 'accent' | 'neutral' | 'outline';
    size?: 'sm' | 'md';
    children: Snippet;
    class?: string;
  }

  let {
    variant = 'default',
    size = 'sm',
    children,
    class: customClass = '',
  }: Props = $props();

  const variantStyles = {
    default: 'bg-surface border-border text-foreground',
    accent: 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/70 dark:border-indigo-800/80 dark:text-indigo-300',
    neutral: 'bg-zinc-100 border-zinc-200 text-zinc-700 dark:bg-zinc-800/70 dark:border-zinc-700 dark:text-zinc-300',
    outline: 'border-border text-foreground bg-transparent',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded-full',
    md: 'text-xs px-2.5 py-1 rounded-md',
  };
</script>

<span
  class="inline-flex items-center gap-1.5 font-mono font-medium border transition-colors {variantStyles[variant]} {sizeStyles[size]} {customClass}"
>
  {@render children()}
</span>
