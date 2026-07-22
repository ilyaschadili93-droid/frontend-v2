import {
  AiChatRequest, AiChatResponse, AiSessionRequest, AiSessionResponse,
  AppUser, AuthResponse, Category, CategoryInput, CategorieSummary,
  Formateur, FormateurInput, FormateurSummary,
  Formation, FormationInput, FormationSummary,
  Session, SessionInput, SessionSummary, UserInput, UserSummary,
} from '../models';
import {
  CategoryRow, DEMO_PASSWORD, FormateurRow, FormationRow, SessionRow, UserRow,
  categoryRows, formateurRows, formationRows, sessionRows, userRows,
} from './seed';

/** unique-ish id generator for mock-created entities */
function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * In-memory data store used when environment.useMockData === true.
 * Holds normalized rows and assembles API-shaped DTOs on demand, mirroring
 * the backend's EF Core includes. A module-level singleton keeps CRUD changes
 * alive across navigation within a session.
 */
export class MockStore {
  private categories: CategoryRow[] = categoryRows.map((c) => ({ ...c }));
  private formateurs: FormateurRow[] = formateurRows.map((f) => ({ ...f }));
  private formations: FormationRow[] = formationRows.map((f) => ({ ...f, objectives: [...f.objectives], technologies: [...f.technologies], prerequisites: [...f.prerequisites] }));
  private sessions: SessionRow[] = sessionRows.map((s) => ({ ...s, userIds: [...s.userIds] }));
  private users: UserRow[] = userRows.map((u) => ({ ...u }));
  /** userId -> password (admin uses "admin"; other seeded users share DEMO_PASSWORD). */
  private passwords = new Map<string, string>(userRows.map((u) => [u.id, u.isAdmin ? 'admin' : DEMO_PASSWORD]));

  // ---------------- Mappers ----------------
  private categorySummary(c: CategoryRow): CategorieSummary {
    return { id: c.id, name: c.name, icon: c.icon, colorHex: c.colorHex };
  }
  private formateurSummary(f: FormateurRow): FormateurSummary {
    return { id: f.id, name: f.name, avatarModel: f.avatarModel, expertise: f.expertise, avatarVideoUrl: f.avatarVideoUrl };
  }
  private formationSummary(f: FormationRow): FormationSummary {
    return { id: f.id, title: f.title, description: f.description, difficulty: f.difficulty, durationHours: f.durationHours, categorieId: f.categorieId, formateurId: f.formateurId };
  }
  private sessionSummary(s: SessionRow): SessionSummary {
    return { id: s.id, title: s.title, startDate: s.startDate, endDate: s.endDate, progress: s.progress, formationId: s.formationId, userCount: s.userIds.length };
  }
  private userSummary(u: UserRow): UserSummary {
    return { id: u.id, userName: u.userName, email: u.email, avatarUrl: u.avatarUrl };
  }

  private toCategory(c: CategoryRow): Category {
    const forms = this.formations.filter((f) => f.categorieId === c.id);
    return { ...this.categorySummary(c), description: c.description, formationCount: forms.length, formations: forms.map((f) => this.formationSummary(f)) };
  }
  private toFormateur(f: FormateurRow): Formateur {
    const forms = this.formations.filter((x) => x.formateurId === f.id);
    return { ...this.formateurSummary(f), bio: f.bio, avatarId: f.avatarId, voiceId: f.voiceId, llmId: f.llmId, systemPrompt: f.systemPrompt, formations: forms.map((x) => this.formationSummary(x)) };
  }
  private toFormation(f: FormationRow): Formation {
    const cat = this.categories.find((c) => c.id === f.categorieId);
    const trainer = this.formateurs.find((t) => t.id === f.formateurId);
    const sess = this.sessions.filter((s) => s.formationId === f.id);
    return {
      ...this.formationSummary(f),
      objectives: [...f.objectives], technologies: [...f.technologies], prerequisites: [...f.prerequisites],
      categorie: cat ? this.categorySummary(cat) : null,
      formateur: trainer ? this.formateurSummary(trainer) : null,
      sessions: sess.map((s) => this.sessionSummary(s)),
    };
  }
  private toSession(s: SessionRow): Session {
    const form = this.formations.find((f) => f.id === s.formationId);
    const trainer = this.formateurs.find((t) => t.id === s.formateurId);
    const enrolled = this.users.filter((u) => s.userIds.includes(u.id));
    return {
      id: s.id, title: s.title, startDate: s.startDate, endDate: s.endDate, progress: s.progress,
      formationId: s.formationId, formationTitle: form?.title ?? '',
      formateurId: s.formateurId, formateur: trainer ? this.formateurSummary(trainer) : null,
      users: enrolled.map((u) => this.userSummary(u)),
    };
  }
  private toUser(u: UserRow): AppUser {
    const sess = this.sessions.filter((s) => s.userIds.includes(u.id));
    return { ...this.userSummary(u), isAdmin: !!u.isAdmin, sessions: sess.map((s) => this.sessionSummary(s)) };
  }

  // ---------------- Categories ----------------
  getCategories(): Category[] { return this.categories.map((c) => this.toCategory(c)); }
  getCategory(id: string): Category | undefined { const c = this.categories.find((x) => x.id === id); return c ? this.toCategory(c) : undefined; }
  createCategory(input: CategoryInput): Category {
    const row: CategoryRow = { id: newId('cat'), name: input.name, description: input.description ?? '', icon: input.icon || 'school', colorHex: input.colorHex || '#6366f1' };
    this.categories.push(row); return this.toCategory(row);
  }
  updateCategory(id: string, input: CategoryInput): Category | undefined {
    const row = this.categories.find((x) => x.id === id); if (!row) return undefined;
    row.name = input.name; row.description = input.description ?? row.description;
    if (input.icon) row.icon = input.icon; if (input.colorHex) row.colorHex = input.colorHex;
    return this.toCategory(row);
  }
  deleteCategory(id: string): boolean {
    const i = this.categories.findIndex((x) => x.id === id); if (i < 0) return false;
    this.categories.splice(i, 1); return true;
  }

  // ---------------- Formateurs ----------------
  getFormateurs(): Formateur[] { return this.formateurs.map((f) => this.toFormateur(f)); }
  getFormateur(id: string): Formateur | undefined { const f = this.formateurs.find((x) => x.id === id); return f ? this.toFormateur(f) : undefined; }
  createFormateur(input: FormateurInput): Formateur {
    const row: FormateurRow = { id: newId('trainer'), name: input.name, bio: input.bio ?? '', expertise: input.expertise ?? '', avatarId: input.avatarId ?? '', avatarModel: input.avatarModel ?? '', voiceId: input.voiceId ?? '', llmId: input.llmId ?? 'gpt-4o-mini', systemPrompt: input.systemPrompt ?? '', avatarVideoUrl: input.avatarVideoUrl ?? '' };
    this.formateurs.push(row); return this.toFormateur(row);
  }
  updateFormateur(id: string, input: FormateurInput): Formateur | undefined {
    const row = this.formateurs.find((x) => x.id === id); if (!row) return undefined;
    row.name = input.name; row.bio = input.bio ?? row.bio; row.expertise = input.expertise ?? row.expertise;
    row.avatarId = input.avatarId ?? row.avatarId; row.avatarModel = input.avatarModel ?? row.avatarModel;
    row.voiceId = input.voiceId ?? row.voiceId; row.llmId = input.llmId ?? row.llmId; row.systemPrompt = input.systemPrompt ?? row.systemPrompt;
    row.avatarVideoUrl = input.avatarVideoUrl ?? row.avatarVideoUrl;
    return this.toFormateur(row);
  }
  deleteFormateur(id: string): boolean {
    const i = this.formateurs.findIndex((x) => x.id === id); if (i < 0) return false;
    this.formateurs.splice(i, 1);
    this.formations.forEach((f) => { if (f.formateurId === id) f.formateurId = null; });
    this.sessions.forEach((s) => { if (s.formateurId === id) s.formateurId = null; });
    return true;
  }

  // ---------------- Formations ----------------
  getFormations(categorieId?: string): Formation[] {
    return this.formations.filter((f) => !categorieId || f.categorieId === categorieId).map((f) => this.toFormation(f));
  }
  getFormation(id: string): Formation | undefined { const f = this.formations.find((x) => x.id === id); return f ? this.toFormation(f) : undefined; }
  createFormation(input: FormationInput): Formation {
    const row: FormationRow = { id: newId('form'), title: input.title, description: input.description ?? '', difficulty: input.difficulty ?? 'Beginner', durationHours: input.durationHours, objectives: input.objectives ?? [], technologies: input.technologies ?? [], prerequisites: input.prerequisites ?? [], categorieId: input.categorieId, formateurId: input.formateurId ?? null };
    this.formations.push(row); return this.toFormation(row);
  }
  updateFormation(id: string, input: FormationInput): Formation | undefined {
    const row = this.formations.find((x) => x.id === id); if (!row) return undefined;
    row.title = input.title; row.description = input.description ?? row.description; row.difficulty = input.difficulty ?? row.difficulty;
    row.durationHours = input.durationHours;
    if (input.objectives) row.objectives = input.objectives; if (input.technologies) row.technologies = input.technologies; if (input.prerequisites) row.prerequisites = input.prerequisites;
    row.categorieId = input.categorieId; row.formateurId = input.formateurId ?? null;
    return this.toFormation(row);
  }
  deleteFormation(id: string): boolean {
    const i = this.formations.findIndex((x) => x.id === id); if (i < 0) return false;
    this.formations.splice(i, 1);
    this.sessions = this.sessions.filter((s) => s.formationId !== id);
    return true;
  }
  assignFormateur(id: string, formateurId: string): boolean {
    const row = this.formations.find((x) => x.id === id); if (!row) return false;
    if (!this.formateurs.some((f) => f.id === formateurId)) return false;
    row.formateurId = formateurId; return true;
  }

  // ---------------- Sessions ----------------
  getSessions(formationId?: string): Session[] {
    return this.sessions.filter((s) => !formationId || s.formationId === formationId).map((s) => this.toSession(s));
  }
  getSession(id: string): Session | undefined { const s = this.sessions.find((x) => x.id === id); return s ? this.toSession(s) : undefined; }
  createSession(input: SessionInput): Session {
    const row: SessionRow = { id: newId('sess'), title: input.title, formationId: input.formationId, formateurId: input.formateurId ?? null, startDate: input.startDate ?? new Date().toISOString(), endDate: input.endDate ?? new Date(Date.now() + 2592000000).toISOString(), progress: Math.min(100, Math.max(0, input.progress)), userIds: [] };
    this.sessions.push(row); return this.toSession(row);
  }
  updateSession(id: string, input: SessionInput): Session | undefined {
    const row = this.sessions.find((x) => x.id === id); if (!row) return undefined;
    row.title = input.title; row.formationId = input.formationId; row.formateurId = input.formateurId ?? null;
    if (input.startDate) row.startDate = input.startDate; if (input.endDate) row.endDate = input.endDate;
    row.progress = Math.min(100, Math.max(0, input.progress));
    return this.toSession(row);
  }
  deleteSession(id: string): boolean {
    const i = this.sessions.findIndex((x) => x.id === id); if (i < 0) return false;
    this.sessions.splice(i, 1); return true;
  }
  addUserToSession(id: string, userId: string): boolean {
    const row = this.sessions.find((x) => x.id === id); if (!row) return false;
    if (!this.users.some((u) => u.id === userId)) return false;
    if (!row.userIds.includes(userId)) row.userIds.push(userId);
    return true;
  }
  removeUserFromSession(id: string, userId: string): boolean {
    const row = this.sessions.find((x) => x.id === id); if (!row) return false;
    row.userIds = row.userIds.filter((u) => u !== userId); return true;
  }

  // ---------------- Users ----------------
  getUsers(): AppUser[] { return this.users.map((u) => this.toUser(u)); }
  getUser(id: string): AppUser | undefined { const u = this.users.find((x) => x.id === id); return u ? this.toUser(u) : undefined; }
  createUser(input: UserInput): AppUser {
    const row: UserRow = { id: newId('user'), userName: input.userName, email: input.email, avatarUrl: input.avatarUrl };
    this.users.push(row); return this.toUser(row);
  }
  updateUser(id: string, input: UserInput): AppUser | undefined {
    const row = this.users.find((x) => x.id === id); if (!row) return undefined;
    row.userName = input.userName; row.email = input.email; row.avatarUrl = input.avatarUrl ?? row.avatarUrl;
    return this.toUser(row);
  }
  deleteUser(id: string): boolean {
    const i = this.users.findIndex((x) => x.id === id); if (i < 0) return false;
    this.users.splice(i, 1);
    this.sessions.forEach((s) => { s.userIds = s.userIds.filter((u) => u !== id); });
    return true;
  }

  // ---------------- Auth ----------------
  login(email: string, password: string): AuthResponse | undefined {
    const id = (email ?? '').trim().toLowerCase();
    const u = this.users.find((x) => x.email.toLowerCase() === id || x.userName.toLowerCase() === id);
    if (!u || this.passwords.get(u.id) !== password) return undefined;
    return { token: `mock-token-${u.id}`, user: this.toUser(u) };
  }

  register(userName: string, email: string, password: string): AuthResponse | 'conflict' {
    const em = (email ?? '').trim().toLowerCase();
    if (this.users.some((x) => x.email.toLowerCase() === em)) return 'conflict';
    const row: UserRow = { id: newId('user'), userName: (userName ?? '').trim() || em.split('@')[0], email: em };
    this.users.push(row);
    this.passwords.set(row.id, password);
    return { token: `mock-token-${row.id}`, user: this.toUser(row) };
  }

  getUserById(id: string): AppUser | undefined {
    return this.getUser(id);
  }

  // ---------------- AI ----------------
  createAiSession(req: AiSessionRequest): AiSessionResponse | undefined {
    const f = this.formateurs.find((x) => x.id === req.formateurId); if (!f) return undefined;
    const form = req.formationId ? this.formations.find((x) => x.id === req.formationId) : undefined;
    let prompt = f.systemPrompt;
    if (form) prompt += `\n\nYou are currently teaching the course "${form.title}": ${form.description}`;
    return { sessionToken: `mock-anam-token-${f.id}`, avatarId: f.avatarId, avatarModel: f.avatarModel, voiceId: f.voiceId, llmId: f.llmId, systemPrompt: prompt, provider: 'anam.ai (mock)', mocked: true };
  }
  aiChat(req: AiChatRequest): AiChatResponse | undefined {
    const f = this.formateurs.find((x) => x.id === req.formateurId); if (!f) return undefined;
    return { reply: `Hi, I'm ${f.name}, your AI trainer. You asked: "${req.message}". This is a demo reply from local mock data.`, provider: 'openai (mock)', mocked: true };
  }
}

/** Shared singleton so mock CRUD persists across the app session. */
export const mockStore = new MockStore();
