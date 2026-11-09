import type { SemanticTokenDefinition } from '../../types/export';
import { formatHex } from '../../utils/color-utils';
import { normalizeIdentifier } from '../../utils/export-utils';

export interface SemanticRoleDescriptor {
  role: string;
  label: string;
  description: string;
}

export const STANDARD_SEMANTIC_ROLES: SemanticRoleDescriptor[] = [
  { role: 'primary', label: 'Primary', description: 'Main brand or focal interactive color' },
  { role: 'secondary', label: 'Secondary', description: 'Supporting elements and secondary actions' },
  { role: 'accent', label: 'Accent', description: 'Highlights, badges, and attention points' },
  { role: 'background', label: 'Background', description: 'Page canvas or main application background' },
  { role: 'surface', label: 'Surface', description: 'Cards, sheets, menus, and elevated containers' },
  { role: 'foreground', label: 'Foreground', description: 'Primary text, headings, and high-emphasis icons' },
  { role: 'muted', label: 'Muted', description: 'Subtle text, placeholders, and inactive states' },
  { role: 'success', label: 'Success', description: 'Positive confirmations and completion states' },
  { role: 'warning', label: 'Warning', description: 'Cautionary alerts and pending indications' },
  { role: 'danger', label: 'Danger', description: 'Destructive actions and critical errors' },
];

/**
 * Creates initial semantic token definitions from a palette.
 * Only maps colors that are actually present in the palette.
 * Never invents or fabricates colors for unassigned slots.
 */
export function createTokensFromColors(
  colors: Array<{ hex: string; name?: string }>
): SemanticTokenDefinition[] {
  if (!colors || colors.length === 0) return [];

  const tokens: SemanticTokenDefinition[] = [];

  for (let i = 0; i < colors.length; i++) {
    const color = colors[i]!;
    const defaultRole = STANDARD_SEMANTIC_ROLES[i]?.role || `token-${i + 1}`;
    const defaultDesc = STANDARD_SEMANTIC_ROLES[i]?.description || (color.name ? `Derived from ${color.name}` : undefined);

    tokens.push({
      id: `token-${i}-${Date.now()}`,
      tokenName: defaultRole,
      hex: formatHex(color.hex),
      description: defaultDesc,
    });
  }

  return tokens;
}

/**
 * Exports assigned semantic tokens as CSS custom properties.
 */
export function exportTokensToCss(
  tokens: SemanticTokenDefinition[],
  prefix = 'color',
  selector = ':root'
): string {
  if (!tokens || tokens.length === 0) {
    return `${selector} {\n  /* No semantic tokens assigned */\n}\n`;
  }

  const cleanPrefix = prefix ? normalizeIdentifier(prefix, 'color', true) : '';
  const lines: string[] = [];

  for (const token of tokens) {
    const cleanName = normalizeIdentifier(token.tokenName, 'token', true);
    const varName = cleanPrefix ? `--${cleanPrefix}-${cleanName}` : `--${cleanName}`;
    const comment = token.description ? ` /* ${token.description} */` : '';
    lines.push(`  ${varName}: ${formatHex(token.hex)};${comment}`);
  }

  return `${selector} {\n${lines.join('\n')}\n}\n`;
}
