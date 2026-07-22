import { Difficulty } from '../models';

/**
 * Normalized seed data (mirrors the .NET backend's SeedData).
 * The MockStore assembles these rows into API-shaped DTOs on the fly,
 * exactly like the backend does with EF Core Includes.
 */

export interface CategoryRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  colorHex: string;
}

export interface FormateurRow {
  id: string;
  name: string;
  bio: string;
  expertise: string;
  avatarId: string;
  avatarModel: string;
  voiceId: string;
  llmId: string;
  systemPrompt: string;
  avatarVideoUrl: string;
}

/** Demo password shared by all seeded accounts (mock mode login). */
export const DEMO_PASSWORD = 'password123';

export interface FormationRow {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  durationHours: number;
  objectives: string[];
  technologies: string[];
  prerequisites: string[];
  categorieId: string;
  formateurId: string | null;
}

export interface SessionRow {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  progress: number;
  formationId: string;
  formateurId: string | null;
  userIds: string[];
}

export interface UserRow {
  id: string;
  userName: string;
  email: string;
  avatarUrl?: string | null;
  isAdmin?: boolean;
}

// ---------------- Categories ----------------
export const categoryRows: CategoryRow[] = [
  { id: 'cat-marketing', name: 'Marketing digital', description: 'Master SEO, social media, analytics and modern growth strategies.', icon: 'campaign', colorHex: '#ec4899' },
  { id: 'cat-software', name: 'Software development', description: 'Build robust applications with modern languages, frameworks and APIs.', icon: 'code', colorHex: '#6366f1' },
  { id: 'cat-security', name: 'Network & security', description: 'Networking essentials, ethical hacking and cloud security best practices.', icon: 'security', colorHex: '#10b981' },
  { id: 'cat-finance', name: 'Finance', description: 'Financial analysis, investment, and blockchain fundamentals.', icon: 'trending_up', colorHex: '#f59e0b' },
];

// ---------------- AI Trainers ----------------
export const formateurRows: FormateurRow[] = [
  {
    id: 'trainer-alice', name: 'Alice Martin',
    bio: 'AI trainer specialised in software engineering and clean architecture. Patient, hands-on, loves live coding.',
    expertise: 'C#,.NET,OOP,Software Design',
    avatarId: 'anam-avatar-alice', avatarModel: 'anam-1.0-ava', voiceId: 'voice-alice-en', llmId: 'gpt-4o-mini',
    systemPrompt: 'You are Alice, a friendly and rigorous software engineering trainer. Explain concepts step by step, give concrete code examples, and check the learner\'s understanding with short questions.',
    avatarVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  },
  {
    id: 'trainer-bob', name: 'Bob Durand',
    bio: 'AI trainer for networking and cybersecurity. Turns complex protocols into simple mental models.',
    expertise: 'Networking,Cybersecurity,Cloud,Ethical Hacking',
    avatarId: 'anam-avatar-bob', avatarModel: 'anam-1.0-leo', voiceId: 'voice-bob-en', llmId: 'gpt-4o-mini',
    systemPrompt: 'You are Bob, a calm cybersecurity mentor. Emphasise security best practices, use real-world analogies, and always mention defensive considerations.',
    avatarVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 'trainer-carole', name: 'Carole Petit',
    bio: 'AI trainer focused on digital marketing and growth. Energetic, data-driven and full of practical tips.',
    expertise: 'SEO,Social Media,Content,Analytics',
    avatarId: 'anam-avatar-carole', avatarModel: 'anam-1.0-mia', voiceId: 'voice-carole-en', llmId: 'gpt-4o-mini',
    systemPrompt: 'You are Carole, an upbeat digital marketing coach. Give actionable growth tactics, reference current best practices and encourage experimentation.',
    avatarVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
  {
    id: 'trainer-david', name: 'David Leroy',
    bio: 'AI trainer for finance and blockchain. Makes numbers approachable and investing understandable.',
    expertise: 'Finance,Investing,Blockchain,Analysis',
    avatarId: 'anam-avatar-david', avatarModel: 'anam-1.0-max', voiceId: 'voice-david-en', llmId: 'gpt-4o-mini',
    systemPrompt: 'You are David, a clear and prudent finance educator. Explain concepts without jargon, use simple examples, and always remind learners this is education, not financial advice.',
    avatarVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  },
];

// ---------------- Users ----------------
export const userRows: UserRow[] = [
  { id: 'user-admin', userName: 'admin', email: 'admin@formateur.ai', isAdmin: true },
  { id: 'user-jdupont', userName: 'jdupont', email: 'jdupont@example.com' },
  { id: 'user-msmith', userName: 'msmith', email: 'msmith@example.com' },
  { id: 'user-lgarcia', userName: 'lgarcia', email: 'lgarcia@example.com' },
  { id: 'user-pchen', userName: 'pchen', email: 'pchen@example.com' },
  { id: 'user-nkhan', userName: 'nkhan', email: 'nkhan@example.com' },
];

// ---------------- Formations ----------------
export const formationRows: FormationRow[] = [
  // Software development
  { id: 'form-poo', title: 'POO en C#', description: 'Learn object-oriented programming from scratch with C#.', difficulty: 'Beginner', durationHours: 24, objectives: ['Understand classes and objects', 'Master inheritance & polymorphism', 'Apply SOLID principles'], technologies: ['C#', '.NET', 'Visual Studio'], prerequisites: ['Basic programming logic'], categorieId: 'cat-software', formateurId: 'trainer-alice' },
  { id: 'form-api', title: 'Programmation API REST', description: 'Design and build production-ready REST APIs with ASP.NET Core.', difficulty: 'Intermediate', durationHours: 30, objectives: ['Design RESTful endpoints', 'Handle auth & validation', 'Document with Swagger'], technologies: ['ASP.NET Core', 'C#', 'Entity Framework', 'Swagger'], prerequisites: ['C# fundamentals', 'HTTP basics'], categorieId: 'cat-software', formateurId: 'trainer-alice' },
  { id: 'form-blazor', title: 'Blazor C#', description: 'Build interactive web UIs in C# with Blazor.', difficulty: 'Intermediate', durationHours: 20, objectives: ['Create components', 'Manage state', 'Call APIs from Blazor'], technologies: ['Blazor', 'C#', '.NET', 'Razor'], prerequisites: ['C# basics', 'HTML/CSS'], categorieId: 'cat-software', formateurId: 'trainer-alice' },
  { id: 'form-java', title: 'JAVA Essentials', description: 'Core Java programming and the JVM ecosystem.', difficulty: 'Beginner', durationHours: 28, objectives: ['Java syntax & OOP', 'Collections & generics', 'Exception handling'], technologies: ['Java', 'JDK', 'IntelliJ'], prerequisites: ['Basic programming logic'], categorieId: 'cat-software', formateurId: 'trainer-alice' },

  // Marketing digital
  { id: 'form-seo', title: 'SEO Fundamentals', description: 'Rank higher on search engines with proven on-page and off-page SEO.', difficulty: 'Beginner', durationHours: 16, objectives: ['Keyword research', 'On-page optimisation', 'Build quality backlinks'], technologies: ['Google Search Console', 'Ahrefs', 'Analytics'], prerequisites: ['None'], categorieId: 'cat-marketing', formateurId: 'trainer-carole' },
  { id: 'form-social', title: 'Social Media Strategy', description: 'Grow an engaged audience across social platforms.', difficulty: 'Intermediate', durationHours: 18, objectives: ['Content calendars', 'Community management', 'Paid vs organic'], technologies: ['Meta Ads', 'Buffer', 'Canva'], prerequisites: ['Marketing basics'], categorieId: 'cat-marketing', formateurId: 'trainer-carole' },
  { id: 'form-content', title: 'Content Marketing', description: 'Attract and convert customers with valuable content.', difficulty: 'Intermediate', durationHours: 14, objectives: ['Storytelling', 'Content funnels', 'Measure ROI'], technologies: ['WordPress', 'SEO', 'Analytics'], prerequisites: ['None'], categorieId: 'cat-marketing', formateurId: 'trainer-carole' },

  // Network & security
  { id: 'form-net', title: 'Network Fundamentals', description: 'Understand how modern networks really work.', difficulty: 'Beginner', durationHours: 22, objectives: ['OSI & TCP/IP models', 'Subnetting', 'Routing & switching'], technologies: ['Cisco', 'Wireshark', 'TCP/IP'], prerequisites: ['Basic IT knowledge'], categorieId: 'cat-security', formateurId: 'trainer-bob' },
  { id: 'form-hacking', title: 'Ethical Hacking', description: 'Learn offensive security to defend systems better.', difficulty: 'Advanced', durationHours: 32, objectives: ['Reconnaissance', 'Vulnerability scanning', 'Reporting & remediation'], technologies: ['Kali Linux', 'Nmap', 'Metasploit'], prerequisites: ['Networking', 'Linux basics'], categorieId: 'cat-security', formateurId: 'trainer-bob' },
  { id: 'form-cloudsec', title: 'Cloud Security', description: 'Secure workloads on the major cloud providers.', difficulty: 'Intermediate', durationHours: 26, objectives: ['IAM & least privilege', 'Network segmentation', 'Monitoring & compliance'], technologies: ['AWS', 'Azure', 'Terraform'], prerequisites: ['Cloud basics', 'Networking'], categorieId: 'cat-security', formateurId: 'trainer-bob' },

  // Finance
  { id: 'form-finanalysis', title: 'Financial Analysis', description: 'Read financial statements and value a business.', difficulty: 'Beginner', durationHours: 18, objectives: ['Read income statements', 'Ratio analysis', 'Build a simple model'], technologies: ['Excel', 'Accounting', 'Valuation'], prerequisites: ['None'], categorieId: 'cat-finance', formateurId: 'trainer-david' },
  { id: 'form-investing', title: 'Investment Basics', description: 'Start investing with confidence and manage risk.', difficulty: 'Beginner', durationHours: 12, objectives: ['Asset classes', 'Diversification', 'Long-term strategy'], technologies: ['Portfolio Theory', 'ETFs', 'Risk'], prerequisites: ['None'], categorieId: 'cat-finance', formateurId: 'trainer-david' },
  { id: 'form-crypto', title: 'Crypto & Blockchain', description: 'Understand blockchain technology and digital assets.', difficulty: 'Intermediate', durationHours: 20, objectives: ['How blockchains work', 'Smart contracts', 'Wallet security'], technologies: ['Ethereum', 'Solidity', 'Web3'], prerequisites: ['Finance basics'], categorieId: 'cat-finance', formateurId: 'trainer-david' },
];

// ---------------- Sessions (2 per formation) ----------------
function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const allUserIds = userRows.map((u) => u.id);
function pickUsers(seed: number, count: number): string[] {
  // deterministic pseudo-random selection
  const picked: string[] = [];
  let x = seed;
  while (picked.length < count) {
    x = (x * 9301 + 49297) % 233280;
    const idx = Math.floor((x / 233280) * allUserIds.length);
    const id = allUserIds[idx];
    if (!picked.includes(id)) picked.push(id);
  }
  return picked;
}

export const sessionRows: SessionRow[] = formationRows.flatMap((f, fi) =>
  ['A', 'B'].map((letter, li) => {
    const seed = fi * 10 + li + 1;
    return {
      id: `sess-${f.id}-${letter.toLowerCase()}`,
      title: `${f.title} - Session ${letter}`,
      startDate: daysFromNow(-(seed % 20)),
      endDate: daysFromNow(20 + (seed % 40)),
      progress: (seed * 17) % 101,
      formationId: f.id,
      formateurId: f.formateurId,
      userIds: pickUsers(seed, 2 + (seed % 2)),
    } as SessionRow;
  }),
);
