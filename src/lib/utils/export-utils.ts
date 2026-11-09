/**
 * Escapes characters for safe inclusion in XML / SVG text elements and attributes.
 * Prevents SVG injection or malformed XML structures.
 */
export function escapeXml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Normalizes an arbitrary text string into a clean, safe CSS/JS identifier.
 * - Replaces non-alphanumeric characters with hyphens
 * - Collapses consecutive hyphens
 * - Removes leading and trailing hyphens
 * - If identifier starts with a digit, prefixes with 'color-'
 * - Applies lowercase if requested
 */
export function normalizeIdentifier(
  text: string | null | undefined,
  fallback = 'color',
  lowercase = true
): string {
  if (!text || typeof text !== 'string') return fallback;

  let cleaned = text
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (lowercase) {
    cleaned = cleaned.toLowerCase();
  }

  if (!cleaned || cleaned.length === 0) {
    return fallback;
  }

  // Identifiers in CSS cannot start with a digit unless escaped
  if (/^[0-9]/.test(cleaned)) {
    cleaned = `c-${cleaned}`;
  }

  return cleaned;
}

/**
 * Generates an array of guaranteed-unique, sanitized identifiers matching the order of input colors.
 * - If a color has a name, normalizes the name.
 * - If no name is provided, uses `${prefix}-${i + 1}`.
 * - If multiple colors share the same normalized name, suffixes duplicates with `-2`, `-3`, etc.
 */
export function generateDisambiguatedIdentifiers(
  colors: Array<{ name?: string; hex: string }>,
  prefix = 'color',
  lowercase = true
): string[] {
  const seenCounts = new Map<string, number>();
  const results: string[] = [];

  for (let i = 0; i < colors.length; i++) {
    const item = colors[i]!;
    let base: string;

    if (item.name && item.name.trim().length > 0) {
      base = normalizeIdentifier(item.name, `${prefix}-${i + 1}`, lowercase);
    } else {
      base = `${prefix}-${i + 1}`;
      if (lowercase) base = base.toLowerCase();
    }

    const currentCount = seenCounts.get(base) || 0;
    if (currentCount === 0) {
      seenCounts.set(base, 1);
      results.push(base);
    } else {
      const nextCount = currentCount + 1;
      seenCounts.set(base, nextCount);
      results.push(`${base}-${nextCount}`);
    }
  }

  return results;
}
