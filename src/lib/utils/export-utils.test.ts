import { describe, it, expect } from 'bun:test';
import {
  escapeXml,
  normalizeIdentifier,
  generateDisambiguatedIdentifiers,
} from './export-utils';

describe('export-utils', () => {
  describe('escapeXml', () => {
    it('escapes &, <, >, ", and \'', () => {
      const input = `<script>alert("XSS & 'injection'")</script>`;
      const expected = `&lt;script&gt;alert(&quot;XSS &amp; &apos;injection&apos;&quot;)&lt;/script&gt;`;
      expect(escapeXml(input)).toBe(expected);
    });

    it('returns empty string for null or undefined', () => {
      expect(escapeXml(null)).toBe('');
      expect(escapeXml(undefined)).toBe('');
    });
  });

  describe('normalizeIdentifier', () => {
    it('normalizes spaces and special characters to hyphens', () => {
      expect(normalizeIdentifier('Teal Forest')).toBe('teal-forest');
      expect(normalizeIdentifier('Electric Iris (Accent)')).toBe('electric-iris-accent');
    });

    it('prefixes numeric identifiers with c-', () => {
      expect(normalizeIdentifier('500')).toBe('c-500');
      expect(normalizeIdentifier('1st-color')).toBe('c-1st-color');
    });

    it('preserves uppercase when lowercase is false', () => {
      expect(normalizeIdentifier('BrandPrimary', 'color', false)).toBe('BrandPrimary');
    });

    it('falls back to default fallback when string is empty', () => {
      expect(normalizeIdentifier('')).toBe('color');
      expect(normalizeIdentifier('   ')).toBe('color');
    });
  });

  describe('generateDisambiguatedIdentifiers', () => {
    it('generates identifiers from color names', () => {
      const colors = [
        { hex: '#112233', name: 'Primary' },
        { hex: '#445566', name: 'Secondary' },
      ];
      expect(generateDisambiguatedIdentifiers(colors)).toEqual(['primary', 'secondary']);
    });

    it('disambiguates identical color names', () => {
      const colors = [
        { hex: '#112233', name: 'Blue' },
        { hex: '#445566', name: 'Blue' },
        { hex: '#778899', name: 'Blue' },
      ];
      expect(generateDisambiguatedIdentifiers(colors)).toEqual(['blue', 'blue-2', 'blue-3']);
    });

    it('falls back to indexed prefix when color name is missing', () => {
      const colors = [
        { hex: '#112233' },
        { hex: '#445566', name: '' },
      ];
      expect(generateDisambiguatedIdentifiers(colors, 'color')).toEqual(['color-1', 'color-2']);
    });
  });
});
