/** Request to open an Anam.ai avatar session for a trainer. */
export interface AiSessionRequest {
  formateurId: string;
  formationId?: string | null;
}

/** Everything the front-end needs to embed the Anam.ai avatar. */
export interface AiSessionResponse {
  sessionToken: string;
  avatarId: string;
  avatarModel: string;
  voiceId: string;
  llmId: string;
  systemPrompt: string;
  provider: string;
  mocked: boolean;
}

/** A question asked to an AI trainer. */
export interface AiChatRequest {
  formateurId: string;
  message: string;
  formationId?: string | null;
}

/** The AI trainer's reply (proxied from OpenAI). */
export interface AiChatResponse {
  reply: string;
  provider: string;
  mocked: boolean;
}
