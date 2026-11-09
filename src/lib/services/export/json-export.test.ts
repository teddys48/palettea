import { describe, it, expect } from 'bun:test';
import { exportJsonPalette } from './json-export';
import type { ExportPayload } from '../../types/export';

describe('json-export service', () => {
  const samplePayload: ExportPayload = {
    name: 'Ocean Palette',
    description: 'Calm ocean gradient',
    createdAt: '2026-11-09T00:00:00.000Z',
    colors: [
      { hex: '#7C83FD', name: 'Primary' },
      { hex: '#A5A9FF', name: 'Secondary' },
    ],
  };

  it('generates valid JSON that parses cleanly with JSON.parse()', () => {
    const jsonString = exportJsonPalette(samplePayload);
    const parsed = JSON.parse(jsonString);

    expect(parsed.name).toBe('Ocean Palette');
    expect(parsed.description).toBe('Calm ocean gradient');
    expect(parsed.createdAt).toBe('2026-11-09T00:00:00.000Z');
    expect(parsed.colors.length).toBe(2);
    expect(parsed.colors[0].name).toBe('Primary');
    expect(parsed.colors[0].hex).toBe('#7C83FD');
    expect(parsed.colors[0].rgb).toBe('124, 131, 253');
    expect(parsed.colors[0].hsl).toBe('237, 97%, 74%');
  });

  it('includes hsv and cmyk when includeAllFormats is true', () => {
    const jsonString = exportJsonPalette(samplePayload, { includeAllFormats: true });
    const parsed = JSON.parse(jsonString);
    expect(parsed.colors[0].hsv).toBeDefined();
    expect(parsed.colors[0].cmyk).toBeDefined();
  });

  it('omits hsv and cmyk when includeAllFormats is false', () => {
    const jsonString = exportJsonPalette(samplePayload, { includeAllFormats: false });
    const parsed = JSON.parse(jsonString);
    expect(parsed.colors[0].hsv).toBeUndefined();
    expect(parsed.colors[0].cmyk).toBeUndefined();
  });

  it('handles empty palette gracefully', () => {
    const emptyPayload: ExportPayload = { name: 'Empty Palette', colors: [] };
    const jsonString = exportJsonPalette(emptyPayload);
    const parsed = JSON.parse(jsonString);
    expect(parsed.colors).toEqual([]);
  });
});
