import type { ExportFormat, TailwindVersion } from '../types/export';

/**
 * Sanitizes a name to be safe for filenames across Linux, macOS, and Windows.
 * Removes forbidden characters: \ / ? % * : | " < > and control chars.
 * Replaces spaces with hyphens, collapses consecutive hyphens, and trims hyphens.
 */
export function sanitizeFilename(name: string, fallback = 'palette'): string {
  if (!name || typeof name !== 'string') return fallback;

  const sanitized = name
    .trim()
    .toLowerCase()
    .replace(/[/\\?%*:|"<>#\x00-\x1f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return sanitized.length > 0 ? sanitized : fallback;
}

/**
 * Determines the appropriate filename and extension for a given export format.
 */
export function getExportFilename(
  paletteName: string,
  format: ExportFormat,
  tailwindVersion: TailwindVersion = 'v4'
): string {
  const base = sanitizeFilename(paletteName, 'palette');

  switch (format) {
    case 'css-variables':
      return `${base}-variables.css`;
    case 'css-classes':
      return `${base}-classes.css`;
    case 'tailwind':
      switch (tailwindVersion) {
        case 'v4':
          return `${base}-theme.css`;
        case 'v3-ts':
          return `tailwind.config.ts`;
        case 'v3-cjs':
          return `tailwind.config.cjs`;
        case 'v3-js':
        default:
          return `tailwind.config.js`;
      }
    case 'json':
      return `${base}.json`;
    case 'svg':
      return `${base}.svg`;
    default:
      return `${base}.txt`;
  }
}

/**
 * Returns standard MIME type with UTF-8 charset for the given export format.
 */
export function getExportMimeType(
  format: ExportFormat,
  tailwindVersion: TailwindVersion = 'v4'
): string {
  switch (format) {
    case 'css-variables':
    case 'css-classes':
      return 'text/css;charset=utf-8';
    case 'tailwind':
      if (tailwindVersion === 'v4') {
        return 'text/css;charset=utf-8';
      }
      if (tailwindVersion === 'v3-ts') {
        return 'text/plain;charset=utf-8';
      }
      return 'text/javascript;charset=utf-8';
    case 'json':
      return 'application/json;charset=utf-8';
    case 'svg':
      return 'image/svg+xml;charset=utf-8';
    default:
      return 'text/plain;charset=utf-8';
  }
}
