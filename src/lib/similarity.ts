/** Normalize text for comparison: lowercase, strip punctuation, collapse whitespace.
 *  Keeps Chinese characters and pinyin tones. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,!?;:…"'()\[\]！，？；：。「」『』【】]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Strip Chinese tone marks from pinyin for a "close enough" comparison.
 *  Also handles common Whisper transcription output. */
export function stripTones(s: string): string {
  const map: Record<string, string> = {
    "ā": "a", "á": "a", "ǎ": "a", "à": "a",
    "ē": "e", "é": "e", "ě": "e", "è": "e",
    "ī": "i", "í": "i", "ǐ": "i", "ì": "i",
    "ō": "o", "ó": "o", "ǒ": "o", "ò": "o",
    "ū": "u", "ú": "u", "ǔ": "u", "ù": "u",
    "ǖ": "ü", "ǘ": "ü", "ǚ": "ü", "ǜ": "ü",
  };
  return [...s].map((ch) => map[ch] ?? ch).join("");
}

/** Levenshtein distance between two strings. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m = a.length;
  const n = b.length;
  const prev = new Array<number>(n + 1);
  const curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

export interface ScoreResult {
  /** Character-level similarity 0..100 (with tones/characters). */
  charPct: number;
  /** Character-level similarity 0..100 (ignoring tones). */
  charPctNoTone: number;
  /** Word-level alignment: which target words/characters were correct. */
  words: { target: string; heard: string | null; ok: boolean }[];
  /** Integer score 0..100 — blends char + word metrics. */
  score: number;
}

/** Compare the user's transcription to the target phrase. */
export function scorePronunciation(target: string, heard: string): ScoreResult {
  const a = normalize(target);
  const b = normalize(heard);

  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length, 1);
  const charPct = Math.round((1 - dist / maxLen) * 100);

  const a2 = stripTones(a);
  const b2 = stripTones(b);
  const dist2 = levenshtein(a2, b2);
  const maxLen2 = Math.max(a2.length, b2.length, 1);
  const charPctNoTone = Math.round((1 - dist2 / maxLen2) * 100);

  // For Chinese, split by character (no spaces between words).
  // If there are spaces (mixed content), split by space; otherwise by char.
  const hasSpaces = a.includes(" ");
  const targetWords = hasSpaces ? a.split(" ").filter(Boolean) : [...a];
  const heardWords = hasSpaces ? b.split(" ").filter(Boolean) : [...b];
  const heardStripped = heardWords.map(stripTones);
  const used = new Set<number>();
  const words: ScoreResult["words"] = targetWords.map((tw) => {
    const tws = stripTones(tw);
    let matchIdx = -1;
    for (let i = 0; i < heardStripped.length; i++) {
      if (used.has(i)) continue;
      if (heardStripped[i] === tws) { matchIdx = i; break; }
    }
    if (matchIdx === -1) {
      for (let i = 0; i < heardStripped.length; i++) {
        if (used.has(i)) continue;
        if (levenshtein(heardStripped[i], tws) <= 1) { matchIdx = i; break; }
      }
    }
    if (matchIdx >= 0) {
      used.add(matchIdx);
      return { target: tw, heard: heardWords[matchIdx], ok: true };
    }
    return { target: tw, heard: null, ok: false };
  });

  const wordOkPct = Math.round((words.filter((w) => w.ok).length / Math.max(words.length, 1)) * 100);
  // Weighted blend: 40% char-exact, 30% char-no-tones, 30% word alignment.
  const score = Math.max(0, Math.min(100, Math.round(charPct * 0.4 + charPctNoTone * 0.3 + wordOkPct * 0.3)));

  return { charPct, charPctNoTone, words, score };
}
