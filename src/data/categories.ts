import type { Category } from "../types";

export const CATEGORIES: readonly ("All" | Category)[] = [
  "All",
  "Greetings",
  "Essentials",
  "Food",
  "Directions",
  "Shopping",
  "Social",
  "Emergency",
  "Accommodation",
] as const;

export const CAT_EMOJI: Record<Category, string> = {
  Greetings: "\u{1F44B}",
  Essentials: "\u{2B50}",
  Food: "\u{1F35C}",
  Directions: "\u{1F5FA}",
  Shopping: "\u{1F6D2}",
  Social: "\u{1F4AC}",
  Emergency: "\u{1F6A8}",
  Accommodation: "\u{1F3E8}",
};

export const IC = {
  speaker: "\u{1F50A}",
  speakerLow: "\u{1F509}",
  turtle: "\u{1F422}",
  mic: "\u{1F3A4}",
  headphones: "\u{1F3A7}",
  book: "\u{1F4D6}",
  cards: "\u{1F0CF}",
  pencil: "\u{270F}",
  chart: "\u{1F4CA}",
  bulb: "\u{1F4A1}",
  party: "\u{1F389}",
  check: "\u{2705}",
  trophy: "\u{1F3C6}",
  thumbsup: "\u{1F44D}",
  muscle: "\u{1F4AA}",
  flag: "\u{1F1E8}\u{1F1F3}",
  talk: "\u{1F5E3}",
  ear: "\u{1F442}",
  music: "\u{1F3B5}",
  star: "\u{2B50}",
  car: "\u{1F697}",
  phone: "\u{1F4F1}",
  shop: "\u{1F6CD}",
  coffee: "\u{2615}",
  warn: "\u{26A0}",
  mute: "\u{1F507}",
  gb: "\u{1F1EC}\u{1F1E7}",
  stop: "\u{23F9}",
  record: "\u{1F534}",
  loading: "\u{23F3}",
  sparkles: "\u{2728}",
};

export const SRS_INTERVALS: readonly number[] = [0, 1, 3, 7, 14, 30];
