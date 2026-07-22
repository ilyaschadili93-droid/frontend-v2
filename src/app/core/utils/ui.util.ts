import { Difficulty } from '../models';

/** CSS badge class for a difficulty level. */
export function difficultyClass(difficulty: Difficulty | string): string {
  switch ((difficulty || '').toLowerCase()) {
    case 'beginner': return 'badge-beginner';
    case 'intermediate': return 'badge-intermediate';
    case 'advanced': return 'badge-advanced';
    default: return 'badge-beginner';
  }
}

/** V2 neo-brutalist: flat bold avatar colours (no gradients). */
const GRADIENTS = [
  '#3b39ff', // electric blue
  '#ff5c39', // coral
  '#00c281', // green
  '#ff5da2', // pink
  '#ffd23f', // yellow
  '#7c5cff', // violet
];

/** Deterministic flat colour from any string seed (used for avatars). */
export function gradientFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}
