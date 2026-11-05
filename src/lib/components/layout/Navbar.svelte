<script lang="ts">
  import Palette from 'lucide-svelte/icons/palette';
  import Menu from 'lucide-svelte/icons/menu';
  import X from 'lucide-svelte/icons/x';
  import ThemeToggle from '../ui/ThemeToggle.svelte';
  import Badge from '../ui/Badge.svelte';
  import type { Theme, NavItem } from '../../types';

  interface Props {
    theme: Theme;
    ontoggleTheme: () => void;
    activeNav: string;
    onselectNav: (id: string) => void;
  }

  let { theme, ontoggleTheme, activeNav, onselectNav }: Props = $props();

  let isMobileMenuOpen = $state(false);

  const navItems: NavItem[] = [
    { id: 'contrast', label: 'Contrast Checker', href: '#contrast' },
    { id: 'converter', label: 'Color Converter', href: '#converter' },
    { id: 'generator', label: 'Scheme Generator', href: '#generator' },
    { id: 'inspector', label: 'Color Inspector', href: '#inspector' },
    { id: 'collections', label: 'Collections', href: '#collections', badge: 'Phase 6', disabled: true },
  ];

  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }

  function handleNavClick(item: NavItem) {
    if (item.disabled) return;
    onselectNav(item.id);
    isMobileMenuOpen = false;
  }
</script>

<header class="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md transition-colors">
  <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
    <!-- Brand -->
    <div class="flex items-center gap-3">
      <a
        href="/"
        class="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg p-1 -m-1"
        aria-label="Palettea Home"
      >
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white border border-border-strong dark:border-zinc-700 shadow-neo group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] transition-transform">
          <Palette class="h-5 w-5 text-indigo-400" aria-hidden="true" />
        </div>
        <div class="flex flex-col">
          <span class="text-lg font-bold tracking-tight text-foreground">Palettea</span>
          <span class="text-[10px] uppercase font-mono tracking-wider text-muted-foreground -mt-1">Color Toolkit</span>
        </div>
      </a>
      <Badge variant="accent" size="sm" class="hidden sm:inline-flex">Phase 5</Badge>
    </div>

    <!-- Desktop Navigation -->
    <nav class="hidden md:flex items-center gap-1.5" aria-label="Main navigation">
      {#each navItems as item (item.id)}
        <button
          type="button"
          disabled={item.disabled}
          onclick={() => handleNavClick(item)}
          class="relative px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {activeNav === item.id ? 'bg-surface text-foreground border border-border shadow-neo' : 'text-muted-foreground hover:text-foreground hover:bg-surface/60'} {item.disabled ? 'disabled:cursor-not-allowed disabled:text-muted-foreground/50 disabled:hover:bg-transparent' : ''}"
        >
          {item.label}
          {#if item.badge}
            <span class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400">
              {item.badge}
            </span>
          {/if}
        </button>
      {/each}
    </nav>

    <!-- Header Actions -->
    <div class="flex items-center gap-3">
      <ThemeToggle {theme} ontoggle={ontoggleTheme} />

      <!-- Mobile Menu Toggle Button -->
      <button
        type="button"
        onclick={toggleMobileMenu}
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-navigation"
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        class="inline-flex md:hidden items-center justify-center p-2 rounded-lg border border-border bg-surface text-foreground shadow-neo hover:border-border-strong cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {#if isMobileMenuOpen}
          <X class="w-5 h-5" aria-hidden="true" />
        {:else}
          <Menu class="w-5 h-5" aria-hidden="true" />
        {/if}
      </button>
    </div>
  </div>

  <!-- Mobile Drawer / Dropdown -->
  {#if isMobileMenuOpen}
    <div
      id="mobile-navigation"
      class="md:hidden border-b border-border bg-surface px-4 pt-3 pb-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div class="text-xs font-mono uppercase tracking-wider text-muted-foreground px-2 py-1">
        Navigation
      </div>
      {#each navItems as item (item.id)}
        <button
          type="button"
          disabled={item.disabled}
          onclick={() => handleNavClick(item)}
          class="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent {activeNav === item.id ? 'bg-background border-border-strong text-foreground shadow-neo' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-background'} {item.disabled ? 'disabled:cursor-not-allowed disabled:text-muted-foreground/50 disabled:hover:bg-transparent' : ''}"
        >
          <span>{item.label}</span>
          {#if item.badge}
            <span class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400">
              {item.badge}
            </span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</header>
