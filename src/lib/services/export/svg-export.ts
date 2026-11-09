import type { ExportPayload, SvgExportOptions } from '../../types/export';
import { formatHex, getContrastColor } from '../../utils/color-utils';
import { escapeXml } from '../../utils/export-utils';

export const DEFAULT_SVG_OPTIONS: SvgExportOptions = {
  layout: 'horizontal',
  showLabels: true,
  showColorNames: true,
  swatchSize: 120,
};

/**
 * Generates valid, injection-safe SVG markup representing the color palette.
 */
export function exportSvgPalette(
  payload: ExportPayload,
  options?: Partial<SvgExportOptions>
): string {
  const opts = { ...DEFAULT_SVG_OPTIONS, ...options };
  const colors = payload.colors || [];
  const count = Math.max(1, colors.length);

  const titleText = escapeXml(payload.name || 'Color Palette');
  const hasTitle = Boolean(payload.name && payload.name.trim().length > 0);
  const headerHeight = hasTitle ? 56 : 16;
  const footerHeight = 24;

  let width: number;
  let height: number;
  let swatchesSvg = '';

  if (opts.layout === 'vertical') {
    // Vertical layout: stack swatches as horizontal strips
    const rowHeight = 56;
    const swatchWidth = 480;
    width = swatchWidth + 32;
    height = headerHeight + count * rowHeight + footerHeight;

    const swatchElements: string[] = [];

    colors.forEach((item, index) => {
      const hex = formatHex(item.hex);
      const textColor = getContrastColor(hex);
      const y = headerHeight + index * rowHeight;
      const colorName = escapeXml(item.name || `Color ${index + 1}`);

      // Swatch rectangle
      const rect = `  <rect x="16" y="${y}" width="${swatchWidth}" height="${rowHeight}" fill="${hex}" />`;

      // Labels inside swatch
      let labelSvg = '';
      if (opts.showLabels) {
        if (opts.showColorNames && item.name) {
          labelSvg = `  <text x="32" y="${y + 26}" fill="${textColor}" font-size="14" font-weight="600" font-family="system-ui, -apple-system, sans-serif">${colorName}</text>
  <text x="32" y="${y + 44}" fill="${textColor}" font-size="12" font-family="monospace" opacity="0.9">${hex}</text>`;
        } else {
          labelSvg = `  <text x="32" y="${y + 34}" fill="${textColor}" font-size="14" font-family="monospace" font-weight="600">${hex}</text>`;
        }
      }

      swatchElements.push(`${rect}\n${labelSvg}`);
    });

    swatchesSvg = swatchElements.join('\n');
  } else {
    // Horizontal layout: columns side-by-side
    const colWidth = 110;
    const swatchHeight = 160;
    const contentWidth = count * colWidth;
    width = Math.max(480, contentWidth + 32);
    height = headerHeight + swatchHeight + footerHeight;

    // Center content if width > contentWidth
    const startX = Math.round((width - contentWidth) / 2);
    const swatchElements: string[] = [];

    colors.forEach((item, index) => {
      const hex = formatHex(item.hex);
      const textColor = getContrastColor(hex);
      const x = startX + index * colWidth;
      const y = headerHeight;
      const colorName = escapeXml(item.name || `Color ${index + 1}`);

      const rect = `  <rect x="${x}" y="${y}" width="${colWidth}" height="${swatchHeight}" fill="${hex}" />`;

      let labelSvg = '';
      if (opts.showLabels) {
        if (opts.showColorNames && item.name) {
          labelSvg = `  <text x="${x + 12}" y="${y + swatchHeight - 34}" fill="${textColor}" font-size="12" font-weight="600" font-family="system-ui, -apple-system, sans-serif">${colorName}</text>
  <text x="${x + 12}" y="${y + swatchHeight - 16}" fill="${textColor}" font-size="11" font-family="monospace" opacity="0.9">${hex}</text>`;
        } else {
          labelSvg = `  <text x="${x + 12}" y="${y + swatchHeight - 20}" fill="${textColor}" font-size="12" font-family="monospace" font-weight="600">${hex}</text>`;
        }
      }

      swatchElements.push(`${rect}\n${labelSvg}`);
    });

    swatchesSvg = swatchElements.join('\n');
  }

  // Header markup
  const headerSvg = hasTitle
    ? `  <text x="16" y="34" fill="#191919" font-size="18" font-weight="700" font-family="system-ui, -apple-system, sans-serif">${titleText}</text>`
    : '';

  // Palettea watermark / credit text
  const footerSvg = `  <text x="${width - 16}" y="${height - 8}" text-anchor="end" fill="#888888" font-size="10" font-family="system-ui, -apple-system, sans-serif">Generated with Palettea</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#FAF9F6" rx="8" />
${headerSvg ? headerSvg + '\n' : ''}${swatchesSvg}
${footerSvg}
</svg>
`;
}
