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
