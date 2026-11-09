import type {
  ExportPayload,
  CssVariableOptions,
  CssClassOptions,
} from '../../types/export';
import { formatHex } from '../../utils/color-utils';
import {
  generateDisambiguatedIdentifiers,
  normalizeIdentifier,
} from '../../utils/export-utils';

export const DEFAULT_CSS_VARIABLE_OPTIONS: CssVariableOptions = {
  prefix: 'color',
  selector: ':root',
  lowercase: true,
};

export const DEFAULT_CSS_CLASS_OPTIONS: CssClassOptions = {
  prefix: 'color',
  mode: 'both',
  lowercase: true,
};

/**
 * Exports palette colors as CSS Custom Properties (Variables).
 */
export function exportCssVariables(
  payload: ExportPayload,
  options?: Partial<CssVariableOptions>
): string {
  const opts = { ...DEFAULT_CSS_VARIABLE_OPTIONS, ...options };
  const selector = opts.selector?.trim() || ':root';
  const prefix = opts.prefix !== undefined ? opts.prefix.trim() : 'color';

  if (!payload.colors || payload.colors.length === 0) {
    return `${selector} {\n  /* No colors defined in palette */\n}\n`;
  }

  const identifiers = generateDisambiguatedIdentifiers(
    payload.colors,
    prefix || 'color',
    opts.lowercase
  );

  const lines: string[] = [];
  const comment = payload.name
    ? `  /* ${payload.name}${payload.description ? ` - ${payload.description}` : ''} */\n`
    : '';

  for (let i = 0; i < payload.colors.length; i++) {
    const item = payload.colors[i]!;
    const id = identifiers[i]!;
    const hex = formatHex(item.hex);

    // If prefix is specified, ensure it doesn't duplicate if identifier already starts with prefix
    let varName: string;
    if (prefix.length > 0) {
      const cleanPrefix = normalizeIdentifier(prefix, 'color', opts.lowercase);
      if (id.startsWith(`${cleanPrefix}-`)) {
        varName = `--${id}`;
      } else {
        varName = `--${cleanPrefix}-${id}`;
      }
    } else {
      varName = `--${id}`;
    }

    lines.push(`  ${varName}: ${hex};`);
  }

  return `${selector} {\n${comment}${lines.join('\n')}\n}\n`;
}

/**
 * Exports palette colors as CSS utility classes (.name / .name-background or .bg-name).
 */
export function exportCssClasses(
  payload: ExportPayload,
  options?: Partial<CssClassOptions>
): string {
  const opts = { ...DEFAULT_CSS_CLASS_OPTIONS, ...options };
  const prefix = opts.prefix !== undefined ? opts.prefix.trim() : 'color';

  if (!payload.colors || payload.colors.length === 0) {
    return '/* No colors defined in palette */\n';
  }

  const identifiers = generateDisambiguatedIdentifiers(
    payload.colors,
    prefix || 'color',
    opts.lowercase
  );

  const blocks: string[] = [];
  if (payload.name) {
    blocks.push(`/* ${payload.name}${payload.description ? ` - ${payload.description}` : ''} */`);
  }

  for (let i = 0; i < payload.colors.length; i++) {
    const item = payload.colors[i]!;
    const id = identifiers[i]!;
    const hex = formatHex(item.hex);

    let baseName: string;
    if (prefix.length > 0) {
      const cleanPrefix = normalizeIdentifier(prefix, 'color', opts.lowercase);
      if (id.startsWith(`${cleanPrefix}-`)) {
        baseName = id;
      } else {
        baseName = `${cleanPrefix}-${id}`;
      }
    } else {
      baseName = id;
    }

    if (opts.mode === 'both' || opts.mode === 'text-only') {
      blocks.push(`.${baseName} {\n  color: ${hex};\n}`);
    }

    if (opts.mode === 'both' || opts.mode === 'bg-only') {
      blocks.push(`.${baseName}-background {\n  background-color: ${hex};\n}`);
    }
  }

  return blocks.join('\n\n') + '\n';
}
