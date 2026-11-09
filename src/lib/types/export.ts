export type ExportFormat = 'css-variables' | 'css-classes' | 'tailwind' | 'json' | 'svg';

export type TailwindVersion = 'v4' | 'v3-js' | 'v3-ts' | 'v3-cjs';

export interface ExportColorItem {
  id?: string;
  hex: string;
  name?: string;
  position?: number;
}

export interface ExportPayload {
  name: string;
  description?: string;
  colors: ExportColorItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CssVariableOptions {
  prefix: string; // e.g. "color" -> --color-primary
  selector: string; // e.g. ":root"
  lowercase: boolean;
}

export interface CssClassOptions {
  prefix: string; // e.g. "color" -> .color-primary
  mode: 'both' | 'text-only' | 'bg-only';
  lowercase: boolean;
}

export interface TailwindExportOptions {
  version: TailwindVersion;
  prefix: string;
}

export interface JsonExportOptions {
  indent: number;
  includeAllFormats: boolean;
}

export interface SvgExportOptions {
  layout: 'horizontal' | 'vertical';
  showLabels: boolean;
  showColorNames: boolean;
  swatchSize?: number;
}

export interface SemanticTokenDefinition {
  id: string;
  tokenName: string; // e.g. "primary", "secondary", "background", "foreground", "accent"
  hex: string;
  description?: string;
}

export type ExportSourceType =
  | 'saved-palette'
  | 'collection'
  | 'scheme'
  | 'inspector'
  | 'curated';
