<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from './lib/components/layout/Navbar.svelte';
  import Footer from './lib/components/layout/Footer.svelte';
  import WorkspaceHero from './lib/components/workspace/WorkspaceHero.svelte';
  import { getInitialTheme, applyTheme } from './lib/utils/theme';
  import type { Theme } from './lib/types';

  let currentTheme = $state<Theme>('light');
  let activeNav = $state<string>('export');

  onMount(() => {
    currentTheme = getInitialTheme();
    applyTheme(currentTheme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't explicitly set a preference in localStorage
      let hasExplicitPreference = false;
      try {
        hasExplicitPreference = Boolean(localStorage.getItem('palettea-theme'));
      } catch {
        // Ignored in restricted environments
      }

      if (!hasExplicitPreference) {
        currentTheme = e.matches ? 'dark' : 'light';
        applyTheme(currentTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  });

  function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
  }

  function handleSelectNav(id: string) {
    activeNav = id;
    const target = document.getElementById(`${id}-section`) || document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
</script>

<div class="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
  <!-- Accessible Skip Link for Keyboard Navigation (WCAG 2.2 AA SC 2.4.1) -->
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-foreground focus:text-background focus:font-mono focus:text-xs focus:font-bold focus:shadow-neo focus:outline-none focus:ring-2 focus:ring-accent"
  >
    Skip to main content
  </a>

  <Navbar
    theme={currentTheme}
    ontoggleTheme={toggleTheme}
    {activeNav}
    onselectNav={handleSelectNav}
  />

  <main class="flex-1 w-full" id="main-content" tabindex="-1">
    <WorkspaceHero {activeNav} onselectSection={handleSelectNav} />
  </main>

  <Footer />
</div>
