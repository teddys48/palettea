<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from './lib/components/layout/Navbar.svelte';
  import Footer from './lib/components/layout/Footer.svelte';
  import WorkspaceHero from './lib/components/workspace/WorkspaceHero.svelte';
  import { getInitialTheme, applyTheme } from './lib/utils/theme';
  import type { Theme } from './lib/types';

  let currentTheme = $state<Theme>('light');
  let activeNav = $state<string>('inspector');

  onMount(() => {
    currentTheme = getInitialTheme();
    applyTheme(currentTheme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't explicitly set a preference in localStorage
      if (!localStorage.getItem('palettea-theme')) {
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
  }
</script>

<div class="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
  <Navbar
    theme={currentTheme}
    ontoggleTheme={toggleTheme}
    {activeNav}
    onselectNav={handleSelectNav}
  />

  <main class="flex-1 w-full" id="main-content">
    <WorkspaceHero />
  </main>

  <Footer />
</div>
