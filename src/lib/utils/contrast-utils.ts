import type {
  WcagCriterion,
  ContrastPreset,
  ContrastSuggestion,
  ContrastEvaluation,
  OverallContrastStatus,
} from '../types/contrast';
import {
  normalizeHex,
  formatHex,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  getRelativeLuminance,
  calculateContrastRatio,
  getContrastRatio,
  formatContrastRatio,
} from './color-utils';

export const WCAG_CRITERIA_SPECS: ReadonlyArray<Omit<WcagCriterion, 'passed'>> = [
  {
    id: 'normal-aa',
    name: 'Normal Text (AA)',
    level: 'AA',
    minRatio: 4.5,
    description: 'Standard body copy, paragraphs, and small text (< 18pt regular or < 14pt bold)',
    targetType: 'normal-text',
  },
  {
    id: 'large-aa',
    name: 'Large Text (AA)',
    level: 'AA',
    minRatio: 3.0,
    description: 'Headings, title banners, and large labels',
    targetType: 'large-text',
    largeTextNote: '≥ 18pt (24px) regular or ≥ 14pt (18.66px) bold',
  },
  {
    id: 'normal-aaa',
    name: 'Normal Text (AAA)',
    level: 'AAA',
    minRatio: 7.0,
    description: 'Enhanced contrast for maximum readability across all visual conditions',
    targetType: 'normal-text',
  },
  {
    id: 'large-aaa',
    name: 'Large Text (AAA)',
    level: 'AAA',
    minRatio: 4.5,
    description: 'Enhanced contrast for large headings and display text',
    targetType: 'large-text',
    largeTextNote: '≥ 18pt (24px) regular or ≥ 14pt (18.66px) bold',
  },
  {
    id: 'ui-aa',
    name: 'UI Components & Graphics (AA)',
    level: 'AA',
    minRatio: 3.0,
    description: 'Interactive button states, input borders, icons, and focus indicators (WCAG 2.2 SC 1.4.11)',
    targetType: 'ui-component',
  },
];

export const CONTRAST_PRESETS: ReadonlyArray<ContrastPreset> = [
  {
    id: 'black-on-white',
    name: 'Black on White',
    foreground: '#000000',
    background: '#FFFFFF',
    description: 'Maximum standard contrast 21:1, exceeds AAA',
  },
  {
    id: 'white-on-black',
    name: 'White on Black',
    foreground: '#FFFFFF',
    background: '#000000',
    description: 'High-contrast inverted dark mode 21:1, exceeds AAA',
  },
  {
    id: 'dark-on-light-gray',
    name: 'Dark Gray on Light Gray',
    foreground: '#1F2937',
    background: '#F3F4F6',
    description: 'Modern neutral pairing (~13.6:1), passes AAA',
  },
  {
    id: 'blue-on-white',
    name: 'Blue on White',
    foreground: '#1D4ED8',
    background: '#FFFFFF',
    description: 'Accessible brand primary pairing (~8.3:1), passes AAA',
  },
  {
    id: 'palettea-ink-canvas',
    name: 'Ink on Canvas',
    foreground: '#191919',
    background: '#FAF9F6',
    description: 'Palettea signature foundation pairing (~17.9:1), passes AAA',
  },
  {
    id: 'amber-warning',
    name: 'Amber on Warm Cream',
    foreground: '#78350F',
    background: '#FEF3C7',
    description: 'Accessible high-contrast alert pairing (~7.7:1), passes AAA',
  },
];

/**
 * Evaluates WCAG 2.2 contrast compliance between foreground and background colors.
 */
export function evaluateWcagCompliance(
  fgHexInput: string,
  bgHexInput: string
): ContrastEvaluation {
  const normFg = normalizeHex(fgHexInput) ?? '191919';
  const normBg = normalizeHex(bgHexInput) ?? 'FFFFFF';

  const fgHex = formatHex(normFg);
  const bgHex = formatHex(normBg);

  const fgRgb = hexToRgb(normFg)!;
  const bgRgb = hexToRgb(normBg)!;

  const fgLuminance = getRelativeLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLuminance = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  const ratio = calculateContrastRatio(fgLuminance, bgLuminance);
  const formattedRatio = formatContrastRatio(ratio);

  const criteria: WcagCriterion[] = WCAG_CRITERIA_SPECS.map((spec) => ({
    ...spec,
    passed: ratio >= spec.minRatio,
  }));

  const passedCount = criteria.filter((c) => c.passed).length;
  const totalCount = criteria.length;

  let overallStatus: OverallContrastStatus = 'fail';
  let statusLabel = 'Fails WCAG Standards';
  let summary =
    'Insufficient contrast (< 3.0:1). Text and UI components are difficult to read and do not meet WCAG standards.';

  const normalAaPassed = criteria.find((c) => c.id === 'normal-aa')?.passed ?? false;
  const largeAaPassed = criteria.find((c) => c.id === 'large-aa')?.passed ?? false;
  const normalAaaPassed = criteria.find((c) => c.id === 'normal-aaa')?.passed ?? false;
  const uiAaPassed = criteria.find((c) => c.id === 'ui-aa')?.passed ?? false;

  if (passedCount === totalCount && normalAaaPassed) {
    overallStatus = 'pass-aaa';
    statusLabel = 'Passes All (AAA Enhanced)';
    summary =
      'Outstanding contrast. Exceeds the highest WCAG AAA standards across all body text, large headings, and UI elements.';
  } else if (normalAaPassed && largeAaPassed && uiAaPassed) {
    overallStatus = 'pass-aa';
    statusLabel = 'Passes WCAG AA';
    summary =
      'Meets standard WCAG AA requirements for normal text (≥ 4.5:1), large text (≥ 3:1), and UI components.';
  } else if (largeAaPassed || uiAaPassed) {
    overallStatus = 'partial';
    statusLabel = 'Passes for Large Text Only';
    summary =
      'Passes for large text (≥ 18pt or ≥ 14pt bold) and graphical objects, but has insufficient contrast for normal body copy.';
  }

  return {
    foreground: fgHex,
    background: bgHex,
    ratio,
    formattedRatio,
    fgLuminance,
    bgLuminance,
    criteria,
    passedCount,
    totalCount,
    overallStatus,
    statusLabel,
    summary,
  };
}

/**
 * Helper to adjust lightness of a color (keeping hue and saturation) to achieve target contrast ratio.
 */
function findAdjustedLightnessColor(
  baseHex: string,
  fixedHex: string,
  targetRatio: number,
  preferDarker: boolean
): { hex: string; ratio: number } | null {
  const baseRgb = hexToRgb(baseHex);
  if (!baseRgb) return null;

  const hsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
  const currentRatio = getContrastRatio(baseHex, fixedHex);
  if (currentRatio !== null && currentRatio >= targetRatio) {
    return { hex: formatHex(baseHex), ratio: currentRatio };
  }

  // Determine search range and direction
  const step = preferDarker ? -1 : 1;
  const startL = Math.max(0, Math.min(100, hsl.l));
  const endL = preferDarker ? 0 : 100;

  for (let l = startL; preferDarker ? l >= endL : l <= endL; l += step) {
    const candRgb = hslToRgb(hsl.h, hsl.s, l);
    const candHex = rgbToHex(candRgb.r, candRgb.g, candRgb.b);
    const candRatio = getContrastRatio(candHex, fixedHex);

    if (candRatio !== null && candRatio >= targetRatio) {
      return { hex: candHex, ratio: candRatio };
    }
  }

  // If adjusting lightness with original saturation wasn't enough (e.g. highly saturated colors or midtones),
  // try lowering saturation or falling back to pure black/white
  const extremeHex = preferDarker ? '#000000' : '#FFFFFF';
  const extremeRatio = getContrastRatio(extremeHex, fixedHex);
  if (extremeRatio !== null && extremeRatio >= targetRatio) {
    // Try blending with the extreme to preserve as much hue as possible
    for (let s = hsl.s; s >= 0; s -= 5) {
      for (let l = startL; preferDarker ? l >= endL : l <= endL; l += step) {
        const candRgb = hslToRgb(hsl.h, s, l);
        const candHex = rgbToHex(candRgb.r, candRgb.g, candRgb.b);
        const candRatio = getContrastRatio(candHex, fixedHex);
        if (candRatio !== null && candRatio >= targetRatio) {
          return { hex: candHex, ratio: candRatio };
        }
      }
    }
    return { hex: extremeHex, ratio: extremeRatio };
  }

  return null;
}

/**
 * Generates deterministic, verified color suggestions when contrast fails WCAG targets.
 * Prioritizes modifying foreground color to preserve background, and offers background modification as alternative.
 */
export function generateContrastSuggestions(
  fgHexInput: string,
  bgHexInput: string
): ContrastSuggestion[] {
  const normFg = normalizeHex(fgHexInput) ?? '191919';
  const normBg = normalizeHex(bgHexInput) ?? 'FFFFFF';

  const fgHex = formatHex(normFg);
  const bgHex = formatHex(normBg);

  const currentRatio = getContrastRatio(fgHex, bgHex);
  if (currentRatio === null || currentRatio >= 7.0) {
    // Already exceeds AAA requirements or invalid; no suggestions necessary
    return [];
  }

  const suggestions: ContrastSuggestion[] = [];

  const fgRgb = hexToRgb(fgHex)!;
  const bgRgb = hexToRgb(bgHex)!;
  const bgLum = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const fgLum = getRelativeLuminance(fgRgb.r, fgRgb.g, fgRgb.b);

  // Determine direction:
  // If background is light (lum >= 0.179), foreground should be made darker.
  // If background is dark (lum < 0.179), foreground should be made lighter.
  const preferDarkerFg = bgLum >= 0.179;
  // Conversely, if foreground is light, background should be darker; if foreground is dark, background lighter
  const preferDarkerBg = fgLum >= 0.179;

  const targets: Array<{ level: 'AA' | 'AAA'; minRatio: number }> = [];
  if (currentRatio < 4.5) {
    targets.push({ level: 'AA', minRatio: 4.5 });
  }
  if (currentRatio < 7.0) {
    targets.push({ level: 'AAA', minRatio: 7.0 });
  }

  for (const { level, minRatio } of targets) {
    // 1. Primary: Adjust Foreground (preserve user's background)
    const fgAdj = findAdjustedLightnessColor(fgHex, bgHex, minRatio, preferDarkerFg);
    if (fgAdj && fgAdj.ratio >= minRatio && fgAdj.hex.toUpperCase() !== fgHex.toUpperCase()) {
      suggestions.push({
        id: `fg-${level.toLowerCase()}`,
        targetRequirement: level,
        targetRatio: minRatio,
        type: 'foreground',
        suggestedHex: fgAdj.hex,
        currentHex: fgHex,
        fixedHex: bgHex,
        resultingRatio: fgAdj.ratio,
        formattedRatio: formatContrastRatio(fgAdj.ratio),
        label: `Adjust Text (${level})`,
        explanation: `Adjusts text lightness to meet WCAG ${level} (≥ ${minRatio}:1) while keeping your background intact.`,
      });
    }

    // 2. Secondary: Adjust Background (preserve user's text color)
    const bgAdj = findAdjustedLightnessColor(bgHex, fgHex, minRatio, preferDarkerBg);
    if (bgAdj && bgAdj.ratio >= minRatio && bgAdj.hex.toUpperCase() !== bgHex.toUpperCase()) {
      suggestions.push({
        id: `bg-${level.toLowerCase()}`,
        targetRequirement: level,
        targetRatio: minRatio,
        type: 'background',
        suggestedHex: bgAdj.hex,
        currentHex: bgHex,
        fixedHex: fgHex,
        resultingRatio: bgAdj.ratio,
        formattedRatio: formatContrastRatio(bgAdj.ratio),
        label: `Adjust Background (${level})`,
        explanation: `Adjusts background lightness to meet WCAG ${level} (≥ ${minRatio}:1) while keeping your text color intact.`,
      });
    }
  }

  return suggestions;
}
