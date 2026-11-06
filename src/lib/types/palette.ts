export interface PaletteColor {
  id: string;
  hex: string; // Normalized uppercase #RRGGBB
  name?: string;
  position: number;
}

export interface Palette {
  id: string;
  name: string;
  description?: string;
  colors: PaletteColor[];
  collectionId?: string;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export type PaletteSortOption = 'updated-desc' | 'created-desc' | 'name-asc' | 'name-desc';

export interface CreatePaletteInput {
  name: string;
  description?: string;
  colors: Array<{
    hex: string;
    name?: string;
  }>;
  collectionId?: string;
}

export interface UpdatePaletteInput {
  name?: string;
  description?: string;
  colors?: Array<{
    id?: string;
    hex: string;
    name?: string;
    position?: number;
  }>;
  collectionId?: string;
}
