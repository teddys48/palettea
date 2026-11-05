import { describe, it, expect } from 'bun:test';
import {
  calculateContrastRatio,
  getContrastRatio,
  formatContrastRatio,
  getRelativeLuminance,
} from './color-utils';
import {
  evaluateWcagCompliance,
  generateContrastSuggestions,
  CONTRAST_PRESETS,
  WCAG_CRITERIA_SPECS,
} from './contrast-utils';

describe('contrast-utils & color-utils WCAG calculations', () => {
  describe('Relative Luminance calculation (WCAG 2.2)', () => {
    it('calculates pure black luminance as exactly 0', () => {
      expect(getRelativeLuminance(0, 0, 0)).toBe(0);
    });

    it('calculates pure white luminance as exactly 1', () => {
      expect(getRelativeLuminance(255, 255, 255)).toBeCloseTo(1.0, 5);
    });

    it('calculates primary colors luminance accurately according to sRGB coefficients', () => {
      // Pure Red (255, 0, 0): R linearized is 1.0, G is 0, B is 0 => L = 0.2126
      expect(getRelativeLuminance(255, 0, 0)).toBeCloseTo(0.2126, 4);

      // Pure Green (0, 255, 0): G linearized is 1.0 => L = 0.7152
      expect(getRelativeLuminance(0, 255, 0)).toBeCloseTo(0.7152, 4);

      // Pure Blue (0, 0, 255): B linearized is 1.0 => L = 0.0722
      expect(getRelativeLuminance(0, 0, 255)).toBeCloseTo(0.0722, 4);
    });

    it('calculates middle gray correctly', () => {
      // Mid-gray RGB(128, 128, 128): channel normalized is 128/255 ≈ 0.50196
      // Linearized: ((0.50196 + 0.055) / 1.055)^2.4 ≈ 0.21586
      const lum = getRelativeLuminance(128, 128, 128);
      expect(lum).toBeGreaterThan(0.21);
      expect(lum).toBeLessThan(0.22);
    });

    it('handles low channels below the 0.04045 linearization threshold', () => {
      // Channel 10/255 ≈ 0.039215 <= 0.04045 => linear channel = (10/255)/12.92
      const lum = getRelativeLuminance(10, 10, 10);
      expect(lum).toBeGreaterThan(0);
      expect(lum).toBeLessThan(0.005);
    });
  });

  describe('Contrast Ratio calculation', () => {
    it('calculates maximum contrast 21:1 for Black on White', () => {
      const ratio = getContrastRatio('#000000', '#FFFFFF');
      expect(ratio !== null).toBe(true);
      expect(ratio).toBeCloseTo(21.0, 4);
      expect(formatContrastRatio(ratio!)).toBe('21.00:1');
    });

    it('calculates maximum contrast 21:1 for White on Black (order symmetry)', () => {
      const ratio = getContrastRatio('#FFFFFF', '#000000');
      expect(ratio !== null).toBe(true);
      expect(ratio).toBeCloseTo(21.0, 4);
      expect(formatContrastRatio(ratio!)).toBe('21.00:1');
    });

    it('calculates minimum contrast 1:1 for identical colors', () => {
      const ratioWhite = getContrastRatio('#FFFFFF', '#FFFFFF');
      expect(ratioWhite).toBeCloseTo(1.0, 4);

      const ratioCustom = getContrastRatio('#4F46E5', '#4F46E5');
      expect(ratioCustom).toBeCloseTo(1.0, 4);
      expect(formatContrastRatio(ratioCustom!)).toBe('1.00:1');
    });

    it('returns symmetrical results when swapping foreground and background', () => {
      const fg = '#7C83FD';
      const bg = '#191919';
      const ratio1 = getContrastRatio(fg, bg);
      const ratio2 = getContrastRatio(bg, fg);

      expect(ratio1).toBe(ratio2);
    });

    it('returns null when given invalid hex strings', () => {
      expect(getContrastRatio('invalid', '#FFFFFF')).toBeNull();
      expect(getContrastRatio('#000000', 'xyz')).toBeNull();
    });

    it('handles shorthand 3-digit hex strings correctly', () => {
      const ratio1 = getContrastRatio('#000', '#fff');
      const ratio2 = getContrastRatio('#000000', '#FFFFFF');
      expect(ratio1).toBe(ratio2);
    });
  });

  describe('WCAG 2.2 Compliance Evaluation', () => {
    it('evaluates all 5 required criteria specs', () => {
      expect(WCAG_CRITERIA_SPECS.length).toBe(5);
      const ids = WCAG_CRITERIA_SPECS.map((s) => s.id);
      expect(ids).toContain('normal-aa');
      expect(ids).toContain('large-aa');
      expect(ids).toContain('normal-aaa');
      expect(ids).toContain('large-aaa');
      expect(ids).toContain('ui-aa');
    });

    it('passes all criteria (AAA) for Black on White', () => {
      const evalResult = evaluateWcagCompliance('#000000', '#FFFFFF');
      expect(evalResult.ratio).toBeCloseTo(21.0, 3);
      expect(evalResult.passedCount).toBe(5);
      expect(evalResult.totalCount).toBe(5);
      expect(evalResult.overallStatus).toBe('pass-aaa');
      expect(evalResult.criteria.every((c) => c.passed)).toBe(true);
    });

    it('fails all criteria for low-contrast colors (e.g. #CCCCCC on #FFFFFF)', () => {
      const evalResult = evaluateWcagCompliance('#CCCCCC', '#FFFFFF');
      expect(evalResult.ratio).toBeLessThan(3.0);
      expect(evalResult.passedCount).toBe(0);
      expect(evalResult.overallStatus).toBe('fail');
      expect(evalResult.criteria.every((c) => !c.passed)).toBe(true);
    });

    it('correctly evaluates partial pass for large text / UI elements (3:1 to 4.5:1)', () => {
      // #7C83FD on #FFFFFF has ratio ~3.21:1
      // Passes Large Text AA (3:1), UI AA (3:1), but fails Normal Text AA (4.5:1)
      const evalResult = evaluateWcagCompliance('#7C83FD', '#FFFFFF');
      expect(evalResult.ratio).toBeGreaterThanOrEqual(3.0);
      expect(evalResult.ratio).toBeLessThan(4.5);
      expect(evalResult.overallStatus).toBe('partial');

      const normalAa = evalResult.criteria.find((c) => c.id === 'normal-aa');
      const largeAa = evalResult.criteria.find((c) => c.id === 'large-aa');
      const uiAa = evalResult.criteria.find((c) => c.id === 'ui-aa');

      expect(normalAa?.passed).toBe(false);
      expect(largeAa?.passed).toBe(true);
      expect(uiAa?.passed).toBe(true);
    });

    it('correctly evaluates pass-aa for colors passing AA normal (>= 4.5:1) but failing AAA (< 7:1)', () => {
      // #2563EB (blue-600) on #FFFFFF gives ratio ~4.93:1
      const evalResult = evaluateWcagCompliance('#2563EB', '#FFFFFF');
      expect(evalResult.ratio).toBeGreaterThanOrEqual(4.5);
      expect(evalResult.ratio).toBeLessThan(7.0);
      expect(evalResult.overallStatus).toBe('pass-aa');

      const normalAa = evalResult.criteria.find((c) => c.id === 'normal-aa');
      const normalAaa = evalResult.criteria.find((c) => c.id === 'normal-aaa');
      expect(normalAa?.passed).toBe(true);
      expect(normalAaa?.passed).toBe(false);
    });

    it('evaluates boundary conditions at exactly 4.5:1 and 3.0:1 thresholds', () => {
      // Direct calculation check for ratio values
      // lumA = 0.20
      // Solve for lumB where (lumB + 0.05)/(lumA + 0.05) = 4.5
      // lumB + 0.05 = 4.5 * 0.25 = 1.125 => lumB = 1.075 (clamped to 1.0)
      // When ratio is exactly >= threshold it passes
      expect(calculateContrastRatio(0.40, 0.05)).toBe((0.40 + 0.05) / (0.05 + 0.05)); // 0.45 / 0.10 = 4.5:1
      const ratioExact45 = calculateContrastRatio(0.40, 0.05);
      expect(ratioExact45).toBe(4.5);
      expect(ratioExact45 >= 4.5).toBe(true);
    });
  });

  describe('Quick Presets', () => {
    it('provides valid hex colors for all presets', () => {
      for (const preset of CONTRAST_PRESETS) {
        expect(preset.foreground).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(preset.background).toMatch(/^#[0-9A-Fa-f]{6}$/);
        const ratio = getContrastRatio(preset.foreground, preset.background);
        expect(ratio !== null).toBe(true);
        expect(ratio).toBeGreaterThanOrEqual(4.5); // All presets should be accessible
      }
    });
  });

  describe('Color Improvement Suggestions', () => {
    it('returns empty array when color combination already exceeds AAA (>= 7:1)', () => {
      const suggestions = generateContrastSuggestions('#000000', '#FFFFFF');
      expect(suggestions.length).toBe(0);
    });

    it('generates suggestions for colors failing AA (< 4.5:1)', () => {
      // #7C83FD on #FFFFFF has ratio ~3.21:1
      const fg = '#7C83FD';
      const bg = '#FFFFFF';
      const suggestions = generateContrastSuggestions(fg, bg);

      expect(suggestions.length).toBeGreaterThan(0);

      // Verify that all suggestions have resulting ratio meeting or exceeding their target
      for (const s of suggestions) {
        expect(s.resultingRatio).toBeGreaterThanOrEqual(s.targetRatio);
        const verifiedRatio = getContrastRatio(s.suggestedHex, s.fixedHex);
        expect(verifiedRatio !== null).toBe(true);
        expect(verifiedRatio!).toBeCloseTo(s.resultingRatio, 4);
        expect(verifiedRatio!).toBeGreaterThanOrEqual(s.targetRatio);
      }
    });

    it('prioritizes foreground suggestions to preserve user background', () => {
      const suggestions = generateContrastSuggestions('#7C83FD', '#FFFFFF');
      const firstSuggestion = suggestions[0];
      expect(firstSuggestion !== undefined).toBe(true);
      expect(firstSuggestion!.type).toBe('foreground');
      expect(firstSuggestion!.fixedHex.toUpperCase()).toBe('#FFFFFF');
    });

    it('generates deterministic results across multiple invocations', () => {
      const fg = '#A855F7';
      const bg = '#FFFFFF';
      const run1 = generateContrastSuggestions(fg, bg);
      const run2 = generateContrastSuggestions(fg, bg);

      expect(run1).toEqual(run2);
    });

    it('adjusts background when requested or necessary', () => {
      const suggestions = generateContrastSuggestions('#7C83FD', '#FFFFFF');
      const bgSuggestions = suggestions.filter((s) => s.type === 'background');
      expect(bgSuggestions.length).toBeGreaterThan(0);

      for (const bgS of bgSuggestions) {
        expect(bgS.resultingRatio).toBeGreaterThanOrEqual(bgS.targetRatio);
        const verified = getContrastRatio('#7C83FD', bgS.suggestedHex);
        expect(verified!).toBeGreaterThanOrEqual(bgS.targetRatio);
      }
    });
  });
});
