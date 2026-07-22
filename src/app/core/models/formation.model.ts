import { FormateurSummary } from './formateur.model';
import { CategorieSummary } from './category.model';
import { SessionSummary } from './session.model';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

/** Lightweight formation used inside category / trainer cards. */
export interface FormationSummary {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  durationHours: number;
  categorieId: string;
  formateurId?: string | null;
}

/** Full formation detail. */
export interface Formation extends FormationSummary {
  objectives: string[];
  technologies: string[];
  prerequisites: string[];
  categorie?: CategorieSummary | null;
  formateur?: FormateurSummary | null;
  sessions: SessionSummary[];
}

/** Payload used to create / update a formation. */
export interface FormationInput {
  title: string;
  description?: string;
  difficulty?: Difficulty;
  durationHours: number;
  objectives?: string[];
  technologies?: string[];
  prerequisites?: string[];
  categorieId: string;
  formateurId?: string | null;
}
