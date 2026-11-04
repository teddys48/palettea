import { describe, it, expect } from 'bun:test';
import { HARMONY_MODES } from './scheme';

describe('scheme definitions and harmony modes', () => {
  it('defines all required harmony types from Phase 3 specification', () => {
    const modes = HARMONY_MODES.map((m) => m.mode);
    expect(modes).toContain('complement'); // Complementary
    expect(modes).toContain('analogic'); // Analogous
    expect(modes).toContain('triad'); // Triadic
    expect(modes).toContain('analogic-complement'); // Split Complementary
    expect(modes).toContain('monochrome'); // Monochromatic
  });

  it('provides readable labels, descriptions, and wheel angles for each harmony mode', () => {
    for (const harmony of HARMONY_MODES) {
      expect(harmony.label.length).toBeGreaterThan(0);
      expect(harmony.shortLabel.length).toBeGreaterThan(0);
      expect(harmony.description.length).toBeGreaterThan(0);
      expect(harmony.angle).toMatch(/\d+°/);
    }
  });
});
