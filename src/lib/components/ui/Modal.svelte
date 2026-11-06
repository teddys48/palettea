<script lang="ts">
  import X from 'lucide-svelte/icons/x';
  import type { Snippet } from 'svelte';

  interface Props {
    isOpen: boolean;
    onclose: () => void;
    title: string;
    description?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    children?: Snippet;
    footer?: Snippet;
  }

  let {
    isOpen = false,
    onclose,
    title,
    description,
    size = 'md',
    children,
    footer,
  }: Props = $props();

  let dialogElement = $state<HTMLDivElement | null>(null);
  const titleId = `modal-title-${Math.random().toString(36).substring(2, 9)}`;
  const descId = `modal-desc-${Math.random().toString(36).substring(2, 9)}`;

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen) {
      e.stopPropagation();
      onclose();
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onclose();
    }
  }

  $effect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus modal container
      setTimeout(() => {
        dialogElement?.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  });

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs transition-opacity duration-150 animate-in fade-in"
    onclick={handleBackdropClick}
    role="presentation"
  >
    <div
      bind:this={dialogElement}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      tabindex="-1"
      class="w-full {sizeClasses[size]} rounded-2xl bg-surface border border-border text-foreground shadow-neo flex flex-col max-h-[90vh] overflow-hidden focus-visible:outline-none animate-in zoom-in-95 duration-150"
    >
      <!-- Modal Header -->
      <div class="flex items-start justify-between p-5 sm:p-6 border-b border-border bg-surface">
        <div class="space-y-1 pr-4">
          <h2 id={titleId} class="text-lg font-bold tracking-tight text-foreground">
            {title}
          </h2>
          {#if description}
            <p id={descId} class="text-xs text-muted-foreground">
              {description}
            </p>
          {/if}
        </div>

        <button
          type="button"
          onclick={onclose}
          aria-label="Close modal"
          class="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-background border border-transparent hover:border-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X class="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
        {#if children}
          {@render children()}
        {/if}
      </div>

      <!-- Modal Footer -->
      {#if footer}
        <div class="p-4 sm:p-6 border-t border-border bg-background/50 flex flex-wrap items-center justify-end gap-3">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}
