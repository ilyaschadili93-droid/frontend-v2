import { SessionSummary } from './session.model';

/** Lightweight learner used inside participant cards. */
export interface UserSummary {
  id: string;
  userName: string;
  email: string;
  avatarUrl?: string | null;
}

/** Full learner with enrolled sessions. */
export interface AppUser extends UserSummary {
  isAdmin: boolean;
  sessions: SessionSummary[];
}

export interface UserInput {
  userName: string;
  email: string;
  avatarUrl?: string | null;
}
