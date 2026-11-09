import type {
  ExportPayload,
  TailwindExportOptions,
  TailwindVersion,
} from '../../types/export';
import { formatHex } from '../../utils/color-utils';
import {
  generateDisambiguatedIdentifiers,
  normalizeIdentifier,
} from '../../utils/export-utils';

export const DEFAULT_TAILWIND_OPTIONS: TailwindExportOptions = {
  version: 'v4',
  prefix: '',
};

/**
 * Returns a concise, user-friendly description explaining the format differences between Tailwind v3 and v4.
 */
export function getTailwindFormatDescription(version: TailwindVersion): string {
  switch (version) {
    case 'v4':
      return 'Tailwind CSS v4 uses CSS-first configuration via the @theme block. Place this in your main CSS file (e.g. app.css).';
    case 'v3-js':
      return 'Tailwind CSS v3 ESM configuration for tailwind.config.js using JavaScript modules (standard for modern Vite projects).';
    case 'v3-ts':
      return 'Tailwind CSS v3 TypeScript configuration with strict types for tailwind.config.ts.';
    case 'v3-cjs':
      return 'Tailwind CSS v3 CommonJS configuration for tailwind.config.js / tailwind.config.cjs.';
    default:
      return '';
  }
}

/**
 * Exports palette colors into Tailwind CSS configuration formats.
 */
export function exportTailwindConfig(
  payload: ExportPayload,
  options?: Partial<TailwindExportOptions>
): string {
  const opts = { ...DEFAULT_TAILWIND_OPTIONS, ...options };
  const prefix = opts.prefix ? opts.prefix.trim() : '';

  if (!payload.colors || payload.colors.length === 0) {
    if (opts.version === 'v4') {
      return '@theme {\n  /* No colors defined in palette */\n}\n';
    }
    return `/** @type {import('tailwindcss').Config} */\nexport default {\n  theme: {\n    extend: {\n      colors: {},\n    },\n  },\n};\n`;
  }

  const rawIdentifiers = generateDisambiguatedIdentifiers(
    payload.colors,
    prefix || 'color',
    true
  );

  // Format keys
  const entries: Array<{ key: string; hex: string }> = [];
  for (let i = 0; i < payload.colors.length; i++) {
    const item = payload.colors[i]!;
    const id = rawIdentifiers[i]!;
    const hex = formatHex(item.hex);

    let keyName = id;
    if (prefix.length > 0) {
      const cleanPrefix = normalizeIdentifier(prefix, 'color', true);
      if (!id.startsWith(`${cleanPrefix}-`)) {
        keyName = `${cleanPrefix}-${id}`;
      }
    }

    entries.push({ key: keyName, hex });
  }

  // --- Tailwind v4 (@theme CSS format) ---
  if (opts.version === 'v4') {
    const lines = entries.map((e) => {
      // In Tailwind v4, custom theme colors are declared as CSS variables under @theme:
      // --color-<name>: <hex>;
      const varKey = e.key.startsWith('color-') ? e.key : `color-${e.key}`;
      return `  --${varKey}: ${e.hex};`;
    });

    const comment = payload.name
      ? `  /* ${payload.name}${payload.description ? ` - ${payload.description}` : ''} */\n`
      : '';

    return `@theme {\n${comment}${lines.join('\n')}\n}\n`;
  }

  // Object color mapping for v3
  const colorLines = entries.map((e) => {
    // If key has hyphens, quote it; otherwise bare key
    const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(e.key) ? e.key : `'${e.key}'`;
    return `        ${safeKey}: '${e.hex}',`;
  });

  // --- Tailwind v3 TypeScript ---
  if (opts.version === 'v3-ts') {
    return `import type { Config } from 'tailwindcss';

export default {
  theme: {
    extend: {
      colors: {
${colorLines.join('\n')}
      },
    },
  },
} satisfies Config;
`;
  }

  // --- Tailwind v3 CommonJS ---
  if (opts.version === 'v3-cjs') {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
${colorLines.join('\n')}
      },
    },
  },
};
`;
  }

  // --- Tailwind v3 ESM JavaScript (default for v3) ---
  return `/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
${colorLines.join('\n')}
      },
    },
  },
};
`;
}
