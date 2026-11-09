import { describe, it, expect } from 'bun:test';
import { exportCssVariables, exportCssClasses } from './css-export';
import type { ExportPayload } from '../../types/export';

describe('css-export service', () => {
  const samplePayload: ExportPayload = {
    name: 'Dawn Harmony',
    description: 'Palettea core branding',
    colors: [
      { hex: '#191919', name: 'Ink Obsidian' },
      { hex: '#4F46E5', name: 'Electric Iris' },
      { hex: '#93C5FD', name: 'Periwinkle Cloud' },
    ],
  };

  describe('exportCssVariables', () => {
    it('generates valid CSS variables with default :root and prefix', () => {
      const output = exportCssVariables(samplePayload);
      expect(output).toContain(':root {');
      expect(output).toContain('--color-ink-obsidian: #191919;');
      expect(output).toContain('--color-electric-iris: #4F46E5;');
      expect(output).toContain('--color-periwinkle-cloud: #93C5FD;');
      expect(output).toContain('/* Dawn Harmony - Palettea core branding */');
    });

    it('respects custom prefix and custom selector', () => {
      const output = exportCssVariables(samplePayload, {
        prefix: 'theme',
        selector: '.dark-mode',
      });
      expect(output).toContain('.dark-mode {');
      expect(output).toContain('--theme-ink-obsidian: #191919;');
    });

    it('handles empty prefix cleanly without double hyphens', () => {
      const output = exportCssVariables(samplePayload, { prefix: '' });
      expect(output).toContain('--ink-obsidian: #191919;');
    });

    it('handles duplicate color names by suffixing disambiguation numbers', () => {
      const payloadWithDuplicates: ExportPayload = {
        name: 'Duplicates',
        colors: [
          { hex: '#111111', name: 'Accent' },
          { hex: '#222222', name: 'Accent' },
        ],
      };
      const output = exportCssVariables(payloadWithDuplicates);
      expect(output).toContain('--color-accent: #111111;');
      expect(output).toContain('--color-accent-2: #222222;');
    });

    it('handles empty palette gracefully', () => {
      const emptyPayload: ExportPayload = { name: 'Empty', colors: [] };
      const output = exportCssVariables(emptyPayload);
      expect(output).toContain(':root {\n  /* No colors defined in palette */\n}\n');
    });
  });

  describe('exportCssClasses', () => {
    it('generates both text color and background color utility classes by default', () => {
      const output = exportCssClasses(samplePayload);
      expect(output).toContain('.color-ink-obsidian {\n  color: #191919;\n}');
      expect(output).toContain('.color-ink-obsidian-background {\n  background-color: #191919;\n}');
    });

    it('supports text-only and bg-only mode', () => {
      const textOnly = exportCssClasses(samplePayload, { mode: 'text-only' });
      expect(textOnly).toContain('  color: #191919;');
      expect(textOnly).not.toContain('background-color:');

      const bgOnly = exportCssClasses(samplePayload, { mode: 'bg-only' });
      expect(bgOnly).toContain('  background-color: #191919;');
      expect(bgOnly).not.toContain('  color: #191919;');
    });

    it('handles empty palette gracefully', () => {
      const emptyPayload: ExportPayload = { name: 'Empty', colors: [] };
      expect(exportCssClasses(emptyPayload)).toBe('/* No colors defined in palette */\n');
    });
  });
});
