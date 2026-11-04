import type { ColorApiResponse } from './color';

export type SchemeMode =
  | 'monochrome'
  | 'monochrome-dark'
  | 'monochrome-light'
  | 'analogic'
  | 'complement'
  | 'analogic-complement'
  | 'triad'
  | 'quad';

export interface HarmonyDefinition {
  mode: SchemeMode;
  label: string;
  shortLabel: string;
  description: string;
  angle: string;
}

export const HARMONY_MODES: readonly HarmonyDefinition[] = [
  {
    mode: 'complement',
    label: 'Complementary',
    shortLabel: 'Complement',
    description: 'Opposite hues on the color wheel creating dynamic, high-contrast visual energy.',
    angle: '180°',
  },
  {
    mode: 'analogic',
    label: 'Analogous',
    shortLabel: 'Analogous',
    description: 'Adjacent colors on the wheel providing gentle, comfortable, harmonious flow.',
    angle: '30°',
  },
  {
    mode: 'triad',
    label: 'Triadic',
    shortLabel: 'Triad',
    description: 'Three evenly-spaced hues (120° apart) delivering vibrant yet balanced diversity.',
    angle: '120°',
  },
  {
    mode: 'analogic-complement',
    label: 'Split Complementary',
    shortLabel: 'Split Comp',
    description: 'Base color paired with the two colors adjacent to its direct complement.',
    angle: '150°',
  },
  {
    mode: 'monochrome',
    label: 'Monochromatic',
    shortLabel: 'Monochrome',
    description: 'Variations in tint, tone, and shade derived from a single hue.',
    angle: '0°',
  },
  {
    mode: 'quad',
    label: 'Tetradic (Quad)',
    shortLabel: 'Tetradic',
    description: 'Four colors formed by two complementary pairs for rich, colorful palettes.',
    angle: '90°',
  },
] as const;

export interface SchemeApiResponse {
  mode: string;
  count: string | number;
  colors: ColorApiResponse[];
  seed: ColorApiResponse;
  image?: {
    bare: string;
    named: string;
  };
  _links?: Record<string, unknown>;
}

export type SchemeRequestStatus = 'idle' | 'loading' | 'success' | 'error';
