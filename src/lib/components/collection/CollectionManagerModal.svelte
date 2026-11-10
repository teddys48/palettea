<script lang="ts">
  import FolderPlus from 'lucide-svelte/icons/folder-plus';
  import Pencil from 'lucide-svelte/icons/pencil';
  import Trash2 from 'lucide-svelte/icons/trash-2';
  import Check from 'lucide-svelte/icons/check';
  import X from 'lucide-svelte/icons/x';
  import Folder from 'lucide-svelte/icons/folder';
  import AlertCircle from 'lucide-svelte/icons/alert-circle';
  import Modal from '../ui/Modal.svelte';
  import Button from '../ui/Button.svelte';
  import ConfirmDialog from '../ui/ConfirmDialog.svelte';
  import { paletteStore } from '../../stores/palette-store.svelte';
  import type { Collection } from '../../types/collection';

  interface Props {
    isOpen: boolean;
    onclose: () => void;
  }

  let { isOpen = false, onclose }: Props = $props();

  let isCreating = $state(false);
  let newName = $state('');
  let newDescription = $state('');
  let errorMessage = $state<string | null>(null);

  // Editing state for existing collections
  let editingId = $state<string | null>(null);
  let editName = $state('');
  let editDescription = $state('');

  // Delete confirmation
  let collectionToDelete = $state<Collection | null>(null);

  $effect(() => {
    if (isOpen) {
      isCreating = false;
      newName = '';
      newDescription = '';
      errorMessage = null;
      editingId = null;
      collectionToDelete = null;
    }
  });

  function handleCreate() {
    errorMessage = null;
    if (!newName.trim()) {
      errorMessage = 'Collection name is required.';
      return;
    }

    const res = paletteStore.createCollection({
      name: newName.trim(),
      description: newDescription.trim() || undefined,
    });

    if (res.success) {
      newName = '';
      newDescription = '';
      isCreating = false;
    } else {
      errorMessage = res.error || 'Failed to create collection.';
    }
  }

  function startEdit(col: Collection) {
    editingId = col.id;
    editName = col.name;
    editDescription = col.description || '';
    errorMessage = null;
  }

  function cancelEdit() {
    editingId = null;
    editName = '';
    editDescription = '';
  }

  function saveEdit(id: string) {
    if (!editName.trim()) {
      errorMessage = 'Collection name cannot be empty.';
      return;
    }

    const res = paletteStore.updateCollection(id, {
      name: editName.trim(),
      description: editDescription.trim() || undefined,
    });

    if (res.success) {
      cancelEdit();
    } else {
      errorMessage = res.error || 'Failed to update collection.';
    }
  }

  function confirmDelete(col: Collection) {
    collectionToDelete = col;
  }

  function handleDeleteConfirmed() {
    if (!collectionToDelete) return;
    paletteStore.deleteCollection(collectionToDelete.id);
    collectionToDelete = null;
  }
</script>

<Modal
  {isOpen}
  {onclose}
  title="Manage Collections"
  description="Group and organize your color palettes. Deleting a collection will unassign its palettes without deleting them."
  size="lg"
>
  {#snippet children()}
    <div class="space-y-6">
      {#if errorMessage}
        <div class="flex items-center gap-2 p-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-xs text-red-600 dark:text-red-400 font-mono">
          <AlertCircle class="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      {/if}

      <!-- Top Action: Add Collection Form -->
      {#if !isCreating}
        <div class="flex items-center justify-between pb-2 border-b border-border">
          <div class="text-xs font-mono text-muted-foreground">
            {paletteStore.collections.length} {paletteStore.collections.length === 1 ? 'collection' : 'collections'} defined
          </div>
          <Button variant="secondary" size="sm" onclick={() => (isCreating = true)}>
            <FolderPlus class="w-3.5 h-3.5" aria-hidden="true" />
            <span>New Collection</span>
          </Button>
        </div>
      {:else}
        <div class="p-4 rounded-xl border border-accent/40 bg-surface shadow-neo space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
              Create New Collection
            </span>
            <button
              type="button"
              onclick={() => (isCreating = false)}
              class="text-muted-foreground hover:text-foreground p-1 rounded"
              aria-label="Cancel creating collection"
            >
              <X class="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div class="space-y-2">
            <input
              type="text"
              bind:value={newName}
              placeholder="Collection name (e.g. Mobile App, Brand Guidelines)"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            <input
              type="text"
              bind:value={newDescription}
              placeholder="Description (optional)"
              class="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          <div class="flex justify-end gap-2 pt-1">
            <Button variant="secondary" size="sm" onclick={() => (isCreating = false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onclick={handleCreate}>
              Save Collection
            </Button>
          </div>
        </div>
      {/if}

      <!-- Collections List -->
      <div class="space-y-3">
        {#if paletteStore.collections.length === 0}
          <div class="p-8 text-center rounded-2xl border border-dashed border-border bg-background/50 space-y-2">
            <Folder class="w-8 h-8 text-muted-foreground/60 mx-auto" aria-hidden="true" />
            <h4 class="text-sm font-bold text-foreground">No Collections Yet</h4>
            <p class="text-xs text-muted-foreground max-w-sm mx-auto">
              Create collections to group palettes by client, brand, theme, or design project.
            </p>
          </div>
        {:else}
          {#each paletteStore.collections as col (col.id)}
            {@const count = paletteStore.collectionStats.byCollection[col.id] || 0}
            <div class="rounded-xl border border-border bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-border-strong transition-colors">
              {#if editingId === col.id}
                <!-- Inline Edit Form -->
                <div class="flex-1 space-y-2">
                  <input
                    type="text"
                    bind:value={editName}
                    class="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                  <input
                    type="text"
                    bind:value={editDescription}
                    placeholder="Description (optional)"
                    class="w-full px-3 py-1 rounded-lg border border-border bg-background text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onclick={() => saveEdit(col.id)}
                    class="p-2 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors cursor-pointer"
                    title="Save changes"
                    aria-label="Save changes to collection"
                  >
                    <Check class="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onclick={cancelEdit}
                    class="p-2 rounded-lg border border-border hover:bg-background text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Cancel edit"
                    aria-label="Cancel editing"
                  >
                    <X class="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              {:else}
                <!-- Collection Item View -->
                <div class="flex items-start gap-3 min-w-0">
                  <div class="h-9 w-9 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Folder class="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div class="space-y-0.5 min-w-0">
                    <div class="flex items-center gap-2">
                      <h4 class="text-sm font-bold text-foreground tracking-tight truncate">
                        {col.name}
                      </h4>
                      <span class="text-xs font-mono px-2 py-0.5 rounded-full border border-border bg-background text-muted-foreground">
                        {count} {count === 1 ? 'palette' : 'palettes'}
                      </span>
                    </div>
                    {#if col.description}
                      <p class="text-xs text-muted-foreground line-clamp-1">
                        {col.description}
                      </p>
                    {/if}
                  </div>
                </div>

                <div class="flex items-center gap-1 flex-shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onclick={() => startEdit(col)}
                    class="p-1.5 rounded-lg border border-transparent hover:border-border hover:bg-background text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                    title="Rename / Edit description"
                    aria-label="Edit collection {col.name}"
                  >
                    <Pencil class="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onclick={() => confirmDelete(col)}
                    class="p-1.5 rounded-lg border border-transparent hover:border-red-200 dark:hover:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
                    title="Delete collection"
                    aria-label="Delete collection {col.name}"
                  >
                    <Trash2 class="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              {/if}
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {/snippet}

  {#snippet footer()}
    <Button variant="secondary" size="sm" onclick={onclose}>
      Close
    </Button>
  {/snippet}
</Modal>

<!-- Delete Confirmation Dialog -->
<ConfirmDialog
  isOpen={collectionToDelete !== null}
  onclose={() => (collectionToDelete = null)}
  onconfirm={handleDeleteConfirmed}
  title="Delete Collection?"
  message={`Are you sure you want to delete collection "${collectionToDelete?.name}"? All palettes inside it will be safely unassigned and kept in your library.`}
  confirmLabel="Delete Collection"
/>
