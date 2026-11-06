<script lang="ts">
  import AlertTriangle from 'lucide-svelte/icons/alert-triangle';
  import Modal from './Modal.svelte';
  import Button from './Button.svelte';

  interface Props {
    isOpen: boolean;
    onclose: () => void;
    onconfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
  }

  let {
    isOpen = false,
    onclose,
    onconfirm,
    title,
    message,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    isDestructive = true,
  }: Props = $props();

  function handleConfirm() {
    onconfirm();
    onclose();
  }
</script>

<Modal {isOpen} {onclose} {title} size="sm">
  {#snippet children()}
    <div class="flex items-start gap-4">
      <div class="flex-shrink-0 h-10 w-10 rounded-xl bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-center justify-center text-red-600 dark:text-red-400">
        <AlertTriangle class="w-5 h-5" aria-hidden="true" />
      </div>
      <div class="space-y-1">
        <p class="text-sm text-muted-foreground leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  {/snippet}

  {#snippet footer()}
    <Button variant="secondary" size="sm" onclick={onclose}>
      {cancelLabel}
    </Button>
    <button
      type="button"
      onclick={handleConfirm}
      class="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 {isDestructive ? 'bg-red-600 hover:bg-red-700 text-white shadow-neo focus-visible:ring-red-500' : 'bg-foreground hover:bg-foreground/90 text-background shadow-neo focus-visible:ring-accent'}"
    >
      {confirmLabel}
    </button>
  {/snippet}
</Modal>
