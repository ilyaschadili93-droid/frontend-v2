import { FormateurSummary } from './formateur.model';
import { UserSummary } from './user.model';

/** Lightweight session used inside formation / user cards. */
export interface SessionSummary {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  progress: number;
  formationId: string;
  userCount: number;
}

/** Full session with its enrolled learners. */
export interface Session {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  progress: number;
  formationId: string;
  formationTitle: string;
  formateurId?: string | null;
  formateur?: FormateurSummary | null;
  users: UserSummary[];
}

export interface SessionInput {
  title: string;
  formationId: string;
  formateurId?: string | null;
  startDate?: string;
  endDate?: string;
  progress: number;
}
