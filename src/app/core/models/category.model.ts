import { FormationSummary } from './formation.model';

/** Lightweight category used inside formation cards / banners. */
export interface CategorieSummary {
  id: string;
  name: string;
  icon: string;
  colorHex: string;
}

/** Full category with its formations. */
export interface Category extends CategorieSummary {
  description: string;
  formationCount: number;
  formations: FormationSummary[];
}

export interface CategoryInput {
  name: string;
  description?: string;
  icon?: string;
  colorHex?: string;
}
