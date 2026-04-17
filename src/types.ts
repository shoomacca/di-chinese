export type Category =
  | "Greetings"
  | "Essentials"
  | "Food"
  | "Directions"
  | "Shopping"
  | "Social"
  | "Emergency"
  | "Accommodation";

export type Level = 1 | 2 | 3 | 4 | 5;

export const LEVEL_NAMES: Record<Level, string> = {
  1: "Starter",
  2: "Elementary",
  3: "Intermediate",
  4: "Upper",
  5: "Advanced",
};

export const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];

export interface Phrase {
  id: number;
  cat: Category;
  lv: Level;
  zh: string;
  py: string;
  en: string;
  note: string;
}

export interface PhraseProgress {
  level: number;
  lastReview: number;
  reviews: number;
  verified?: boolean;
  verifiedAt?: number;
  verifiedBestScore?: number;
}

export type ProgressMap = Record<number, PhraseProgress>;

export type TabId = "drill" | "browse" | "flash" | "quiz" | "speak" | "stats" | "tips";

export type QuizMode = "listen" | "zh-en" | "en-zh";

export type DeckMode = "new" | "review" | "all";
