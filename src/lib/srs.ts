import { SRS_INTERVALS } from "../data/categories";
import type { PhraseProgress } from "../types";

export const MAX_LEVEL = SRS_INTERVALS.length - 1;

/** Update a phrase's progress given an Again/Hard/Good/Easy quality rating (0..3). */
export function nextProgress(current: PhraseProgress | undefined, quality: number): PhraseProgress {
  const c = current || { level: 0, lastReview: 0, reviews: 0 };
  const level = quality >= 2 ? Math.min(c.level + 1, MAX_LEVEL) : quality === 0 ? 0 : c.level;
  return { level, lastReview: Date.now(), reviews: c.reviews + 1 };
}

/** True if the phrase is due for review (been learned and interval has elapsed). */
export function isDue(pr: PhraseProgress | undefined): boolean {
  if (!pr || pr.level === 0) return false;
  const daysDue = SRS_INTERVALS[Math.min(pr.level, MAX_LEVEL)];
  return Date.now() - pr.lastReview >= daysDue * 86_400_000;
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
