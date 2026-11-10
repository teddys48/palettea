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
    accent: 'bg-accent/10 border-accent/30 text-accent dark:bg-accent/20 dark:border-accent/40 dark:text-accent-hover',
    neutral: 'bg-surface-hover border-border text-foreground/85 dark:bg-surface-hover dark:border-border dark:text-foreground/85',
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
