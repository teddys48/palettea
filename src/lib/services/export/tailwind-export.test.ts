import { describe, it, expect } from 'bun:test';
import {
  exportTailwindConfig,
  getTailwindFormatDescription,
} from './tailwind-export';
import type { ExportPayload } from '../../types/export';

describe('tailwind-export service', () => {
  const samplePayload: ExportPayload = {
    name: 'Ocean Palette',
    colors: [
      { hex: '#7C83FD', name: 'Primary' },
      { hex: '#A5A9FF', name: 'Secondary' },
      { hex: '#F4A261', name: 'Accent' },
    ],
  };

  it('generates Tailwind v4 CSS @theme format', () => {
    const output = exportTailwindConfig(samplePayload, { version: 'v4' });
    expect(output).toContain('@theme {');
    expect(output).toContain('--color-primary: #7C83FD;');
    expect(output).toContain('--color-secondary: #A5A9FF;');
    expect(output).toContain('--color-accent: #F4A261;');
  });

  it('generates Tailwind v3 ESM JavaScript configuration', () => {
    const output = exportTailwindConfig(samplePayload, { version: 'v3-js' });
    expect(output).toContain("export default {");
    expect(output).toContain("theme: {");
    expect(output).toContain("extend: {");
    expect(output).toContain("colors: {");
    expect(output).toContain("primary: '#7C83FD',");
    expect(output).toContain("secondary: '#A5A9FF',");
    expect(output).toContain("accent: '#F4A261',");
  });

  it('generates Tailwind v3 TypeScript configuration', () => {
    const output = exportTailwindConfig(samplePayload, { version: 'v3-ts' });
    expect(output).toContain("import type { Config } from 'tailwindcss';");
    expect(output).toContain("export default {");
    expect(output).toContain("} satisfies Config;");
    expect(output).toContain("primary: '#7C83FD',");
  });

  it('generates Tailwind v3 CommonJS configuration', () => {
    const output = exportTailwindConfig(samplePayload, { version: 'v3-cjs' });
    expect(output).toContain("module.exports = {");
    expect(output).toContain("primary: '#7C83FD',");
  });

  it('quotes keys with hyphens in v3 configs', () => {
    const payloadWithDashes: ExportPayload = {
      name: 'Dash Test',
      colors: [{ hex: '#123456', name: 'Dark Blue' }],
    };
    const output = exportTailwindConfig(payloadWithDashes, { version: 'v3-js' });
    expect(output).toContain("'dark-blue': '#123456',");
  });

  it('provides format descriptions for UI guidance', () => {
    expect(getTailwindFormatDescription('v4')).toContain('@theme');
    expect(getTailwindFormatDescription('v3-js')).toContain('tailwind.config.js');
    expect(getTailwindFormatDescription('v3-ts')).toContain('TypeScript');
    expect(getTailwindFormatDescription('v3-cjs')).toContain('CommonJS');
  });

  it('handles empty palette in v4 and v3', () => {
    const emptyPayload: ExportPayload = { name: 'Empty', colors: [] };
    const v4 = exportTailwindConfig(emptyPayload, { version: 'v4' });
    expect(v4).toContain('@theme {\n  /* No colors defined in palette */\n}\n');

    const v3 = exportTailwindConfig(emptyPayload, { version: 'v3-js' });
    expect(v3).toContain('colors: {},');
  });
});
