import { describe, it, expect } from 'bun:test';
import {
  sanitizeFilename,
  getExportFilename,
  getExportMimeType,
} from './filename-utils';

describe('filename-utils', () => {
  describe('sanitizeFilename', () => {
    it('normalizes valid strings to lowercase hyphenated format', () => {
      expect(sanitizeFilename('Ocean Breeze')).toBe('ocean-breeze');
      expect(sanitizeFilename('Dawn Harmony 2026')).toBe('dawn-harmony-2026');
    });

    it('removes forbidden characters and punctuation', () => {
      expect(sanitizeFilename('my/palette:special?version*')).toBe('mypalettespecialversion');
      expect(sanitizeFilename('test#1<tag>|"quote"')).toBe('test1tagquote');
    });

    it('collapses multiple spaces and dashes', () => {
      expect(sanitizeFilename('blue    ocean---sunset')).toBe('blue-ocean-sunset');
    });

    it('trims leading and trailing dashes', () => {
      expect(sanitizeFilename('-warm-orange-')).toBe('warm-orange');
    });

    it('returns default fallback when input is empty or invalid', () => {
      expect(sanitizeFilename('')).toBe('palette');
      expect(sanitizeFilename('   ')).toBe('palette');
      expect(sanitizeFilename('///???')).toBe('palette');
    });
  });

  describe('getExportFilename', () => {
    it('returns .css for css-variables and css-classes', () => {
      expect(getExportFilename('Brand', 'css-variables')).toBe('brand-variables.css');
      expect(getExportFilename('Brand', 'css-classes')).toBe('brand-classes.css');
    });

    it('returns format-appropriate Tailwind config filenames', () => {
      expect(getExportFilename('Brand', 'tailwind', 'v4')).toBe('brand-theme.css');
      expect(getExportFilename('Brand', 'tailwind', 'v3-js')).toBe('tailwind.config.js');
      expect(getExportFilename('Brand', 'tailwind', 'v3-ts')).toBe('tailwind.config.ts');
      expect(getExportFilename('Brand', 'tailwind', 'v3-cjs')).toBe('tailwind.config.cjs');
    });

    it('returns .json for json export', () => {
      expect(getExportFilename('Brand', 'json')).toBe('brand.json');
    });

    it('returns .svg for svg export', () => {
      expect(getExportFilename('Brand', 'svg')).toBe('brand.svg');
    });
  });

  describe('getExportMimeType', () => {
    it('returns correct MIME types for each format', () => {
      expect(getExportMimeType('css-variables')).toBe('text/css;charset=utf-8');
      expect(getExportMimeType('css-classes')).toBe('text/css;charset=utf-8');
      expect(getExportMimeType('tailwind', 'v4')).toBe('text/css;charset=utf-8');
      expect(getExportMimeType('tailwind', 'v3-js')).toBe('text/javascript;charset=utf-8');
      expect(getExportMimeType('tailwind', 'v3-ts')).toBe('text/plain;charset=utf-8');
      expect(getExportMimeType('json')).toBe('application/json;charset=utf-8');
      expect(getExportMimeType('svg')).toBe('image/svg+xml;charset=utf-8');
    });
  });
});
