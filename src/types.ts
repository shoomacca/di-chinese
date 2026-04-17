export type Category =
  | "Greetings"
  | "Essentials"
  | "Food"
  | "Directions"
  | "Shopping"
  | "Social"
  | "Emergency"
  | "Accommodation";

export interface Phrase {
  id: number;
  cat: Category;
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
