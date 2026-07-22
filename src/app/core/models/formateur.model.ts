import { FormationSummary } from './formation.model';

/** Lightweight AI trainer used inside formation / session cards. */
export interface FormateurSummary {
  id: string;
  name: string;
  avatarModel: string;
  expertise: string;
  /** URL of the AI avatar video stream/clip for this trainer. */
  avatarVideoUrl: string;
}

/** Full AI trainer (Formateur IA) with Anam.ai configuration. */
export interface Formateur extends FormateurSummary {
  bio: string;
  avatarId: string;
  voiceId: string;
  llmId: string;
  systemPrompt: string;
  formations: FormationSummary[];
}

export interface FormateurInput {
  name: string;
  bio?: string;
  expertise?: string;
  avatarId?: string;
  avatarModel?: string;
  voiceId?: string;
  llmId?: string;
  systemPrompt?: string;
  avatarVideoUrl?: string;
}
