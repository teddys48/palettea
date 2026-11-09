import { describe, it, expect } from 'bun:test';
import { exportSvgPalette } from './svg-export';
import type { ExportPayload } from '../../types/export';

describe('svg-export service', () => {
  const samplePayload: ExportPayload = {
    name: 'Dawn Harmony',
    colors: [
      { hex: '#191919', name: 'Ink Obsidian' },
      { hex: '#4F46E5', name: 'Electric Iris' },
      { hex: '#FAF9F6', name: 'Alabaster Canvas' },
    ],
  };

  it('generates valid SVG structure with xmlns and viewBox', () => {
    const svg = exportSvgPalette(samplePayload);
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox="');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('Dawn Harmony');
  });

  it('supports horizontal layout', () => {
    const svg = exportSvgPalette(samplePayload, { layout: 'horizontal' });
    expect(svg).toContain('fill="#191919"');
    expect(svg).toContain('fill="#4F46E5"');
    expect(svg).toContain('fill="#FAF9F6"');
  });

  it('supports vertical layout', () => {
    const svg = exportSvgPalette(samplePayload, { layout: 'vertical' });
    expect(svg).toContain('fill="#191919"');
    expect(svg).toContain('width="480"');
  });

  it('toggles labels on and off', () => {
    const withLabels = exportSvgPalette(samplePayload, { showLabels: true });
    expect(withLabels).toContain('#191919');
    expect(withLabels).toContain('Ink Obsidian');

    const withoutLabels = exportSvgPalette(samplePayload, { showLabels: false });
    expect(withoutLabels).not.toContain('>#191919<');
    expect(withoutLabels).not.toContain('>Ink Obsidian<');
  });

  it('escapes user content to prevent XSS / SVG injection', () => {
    const dangerousPayload: ExportPayload = {
      name: '<script>alert("hack")</script>',
      colors: [{ hex: '#123456', name: 'Test & "Quote"' }],
    };
    const svg = exportSvgPalette(dangerousPayload);
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;alert(&quot;hack&quot;)&lt;/script&gt;');
    expect(svg).toContain('Test &amp; &quot;Quote&quot;');
  });

  it('calculates contrast-aware text overlay on swatches', () => {
    const svg = exportSvgPalette(samplePayload, { showLabels: true });
    // #191919 is dark -> text should be white (#FFFFFF)
    expect(svg).toContain('fill="#FFFFFF"');
    // #FAF9F6 is light -> text should be dark (#000000)
    expect(svg).toContain('fill="#000000"');
  });
});
