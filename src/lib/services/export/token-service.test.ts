import { describe, it, expect } from 'bun:test';
import {
  createTokensFromColors,
  exportTokensToCss,
  STANDARD_SEMANTIC_ROLES,
} from './token-service';

describe('token-service', () => {
  it('creates semantic tokens from colors without fabricating unprovided colors', () => {
    const colors = [
      { hex: '#7C83FD', name: 'Lavender' },
      { hex: '#FAF9F6', name: 'Alabaster' },
    ];
    const tokens = createTokensFromColors(colors);

    // Exactly 2 tokens generated matching 2 colors!
    expect(tokens.length).toBe(2);
    expect(tokens[0]!.tokenName).toBe(STANDARD_SEMANTIC_ROLES[0]!.role); // 'primary'
    expect(tokens[0]!.hex).toBe('#7C83FD');
    expect(tokens[1]!.tokenName).toBe(STANDARD_SEMANTIC_ROLES[1]!.role); // 'secondary'
    expect(tokens[1]!.hex).toBe('#FAF9F6');
  });

  it('exports semantic tokens to clean CSS variables', () => {
    const tokens = [
      { id: '1', tokenName: 'primary', hex: '#7C83FD', description: 'Brand primary' },
      { id: '2', tokenName: 'background', hex: '#FAF9F6', description: 'Canvas' },
    ];
    const css = exportTokensToCss(tokens);
    expect(css).toContain(':root {');
    expect(css).toContain('--color-primary: #7C83FD; /* Brand primary */');
    expect(css).toContain('--color-background: #FAF9F6; /* Canvas */');
  });

  it('handles empty tokens list without crashing', () => {
    const css = exportTokensToCss([]);
    expect(css).toContain('/* No semantic tokens assigned */');
  });
});
