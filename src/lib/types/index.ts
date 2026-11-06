export type Theme = 'light' | 'dark';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  active?: boolean;
  badge?: string;
  disabled?: boolean;
}

export interface ColorSwatch {
  hex: string;
  name: string;
  rgb: string;
  role: string;
  isLight: boolean;
}

export interface PreviewPalette {
  id: string;
  title: string;
  description: string;
  tag: string;
  colors: ColorSwatch[];
}

export * from './color';
export * from './scheme';
export * from './contrast';
export * from './palette';
export * from './collection';
