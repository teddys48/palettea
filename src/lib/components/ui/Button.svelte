<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
    'aria-label'?: string;
    class?: string;
    title?: string;
  }

  let {
    variant = 'secondary',
    size = 'md',
    disabled = false,
    type = 'button',
    onclick,
    children,
    'aria-label': ariaLabel,
    class: customClass = '',
    title,
  }: Props = $props();

  const variantStyles = {
    primary:
      'bg-accent text-white border-border-strong dark:border-indigo-400/60 hover:bg-accent-hover shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] disabled:bg-accent/60 disabled:border-transparent',
    secondary:
      'bg-surface text-foreground border-border hover:border-border-strong shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] disabled:bg-surface/60 disabled:border-border disabled:text-muted-foreground',
    outline:
      'bg-transparent text-foreground border-border hover:bg-surface-hover hover:border-border-strong disabled:text-muted-foreground disabled:border-border/60',
    ghost:
      'bg-transparent text-foreground border-transparent hover:bg-surface-hover disabled:text-muted-foreground',
  };

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 min-h-[36px] sm:min-h-0 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2 min-h-[40px] sm:min-h-0 rounded-lg gap-2',
    lg: 'text-base px-5 py-2.5 min-h-[44px] rounded-xl gap-2.5 font-medium',
    icon: 'p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg',
  };
</script>

<button
  {type}
  {disabled}
  {onclick}
  title={title}
  aria-label={ariaLabel}
  class="relative inline-flex items-center justify-center font-medium border select-none transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background {variantStyles[variant]} {sizeStyles[size]} {customClass}"
>
  {#if children}
    {@render children()}
  {/if}
</button>
