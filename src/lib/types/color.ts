export interface ColorFraction {
  r?: number;
  g?: number;
  b?: number;
  h?: number;
  s?: number;
  l?: number;
  v?: number;
  c?: number;
  m?: number;
  y?: number;
  k?: number;
  X?: number;
  Y?: number;
  Z?: number;
}

export interface ColorHexFormat {
  value: string;
  clean: string;
}

export interface ColorRgbFormat {
  r: number;
  g: number;
  b: number;
  value: string;
  fraction?: ColorFraction;
}

export interface ColorHslFormat {
  h: number;
  s: number;
  l: number;
  value: string;
  fraction?: ColorFraction;
}

export interface ColorHsvFormat {
  h: number;
  s: number;
  v: number;
  value: string;
  fraction?: ColorFraction;
}

export interface ColorCmykFormat {
  c: number;
  m: number;
  y: number;
  k: number;
  value: string;
  fraction?: ColorFraction;
}

export interface ColorXyzFormat {
  X: number;
  Y: number;
  Z: number;
  value: string;
  fraction?: ColorFraction;
}

export interface ColorNameInfo {
  value: string;
  closest_named_hex: string;
  exact_match_name: boolean;
  distance: number;
}

export interface ColorContrastInfo {
  value: string;
}

export interface ColorApiResponse {
  hex: ColorHexFormat;
  rgb: ColorRgbFormat;
  hsl: ColorHslFormat;
  hsv: ColorHsvFormat;
  cmyk: ColorCmykFormat;
  name: ColorNameInfo;
  contrast: ColorContrastInfo;
  XYZ?: ColorXyzFormat;
  image?: {
    bare: string;
    named: string;
  };
  _links?: {
    self: { href: string };
  };
}

export type ColorRequestStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'invalid'
  | 'error';

export interface ColorFormatItem {
  id: 'hex' | 'rgb' | 'hsl' | 'hsv' | 'cmyk' | 'xyz';
  label: string;
  value: string;
  description: string;
}

/* =========================================================================
   Phase 4: Color Converter Types
   ========================================================================= */

export type SupportedColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsv' | 'cmyk';

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export interface HsvColor {
  h: number;
  s: number;
  v: number;
}

export interface CmykColor {
  c: number;
  m: number;
  y: number;
  k: number;
}

export interface ConvertedColorResult {
  hex: {
    value: string; // e.g. '#7C83FD'
    raw: string; // e.g. '7C83FD'
  };
  rgb: {
    value: string; // e.g. '124, 131, 253'
    css: string; // e.g. 'rgb(124, 131, 253)'
    channels: RgbColor;
  };
  hsl: {
    value: string; // e.g. '237, 98%, 74%'
    css: string; // e.g. 'hsl(237, 98%, 74%)'
    channels: HslColor;
  };
  hsv: {
    value: string; // e.g. '237, 51%, 99%'
    css: string; // e.g. 'hsv(237, 51%, 99%)'
    channels: HsvColor;
  };
  cmyk: {
    value: string; // e.g. '51%, 48%, 0%, 1%'
    css: string; // e.g. 'cmyk(51%, 48%, 0%, 1%)'
    channels: CmykColor;
  };
}

export type ParseColorResult =
  | { success: true; rgb: RgbColor }
  | { success: false; error: string };

export type ConvertColorResult =
  | { success: true; data: ConvertedColorResult }
  | { success: false; error: string };
