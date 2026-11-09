import type { ExportPayload, JsonExportOptions } from '../../types/export';
import { hexToRgb, convertAllFormats, formatHex } from '../../utils/color-utils';

export const DEFAULT_JSON_OPTIONS: JsonExportOptions = {
  indent: 2,
  includeAllFormats: true,
};

export interface JsonExportColor {
  name?: string;
  hex: string;
  rgb: string;
  hsl: string;
  hsv?: string;
  cmyk?: string;
}

export interface JsonExportStructure {
  name: string;
  description?: string;
  colors: JsonExportColor[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Exports a palette payload into a cleanly formatted, valid JSON string.
 */
export function exportJsonPalette(
  payload: ExportPayload,
  options?: Partial<JsonExportOptions>
): string {
  const opts = { ...DEFAULT_JSON_OPTIONS, ...options };
  const indent = typeof opts.indent === 'number' && opts.indent >= 0 ? opts.indent : 2;

  const colorsList: JsonExportColor[] = (payload.colors || []).map((item, index) => {
    const formattedHex = formatHex(item.hex);
    const rgbChannels = hexToRgb(formattedHex);

    const colorObj: JsonExportColor = {
      name: item.name && item.name.trim().length > 0 ? item.name.trim() : `Color ${index + 1}`,
      hex: formattedHex,
      rgb: rgbChannels ? `${rgbChannels.r}, ${rgbChannels.g}, ${rgbChannels.b}` : '0, 0, 0',
      hsl: '0, 0%, 0%',
    };

    if (rgbChannels) {
      const converted = convertAllFormats(rgbChannels);
      colorObj.rgb = converted.rgb.value;
      colorObj.hsl = converted.hsl.value;

      if (opts.includeAllFormats) {
        colorObj.hsv = converted.hsv.value;
        colorObj.cmyk = converted.cmyk.value;
      }
    }

    return colorObj;
  });

  const output: JsonExportStructure = {
    name: payload.name || 'Color Palette',
    colors: colorsList,
  };

  if (payload.description && payload.description.trim().length > 0) {
    output.description = payload.description.trim();
  }

  if (payload.createdAt) {
    output.createdAt = payload.createdAt;
  }

  if (payload.updatedAt) {
    output.updatedAt = payload.updatedAt;
  }

  return JSON.stringify(output, null, indent);
}
