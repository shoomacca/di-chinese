import { useCallback, useEffect, useState } from "react";
import { LevelFilter } from "../components/LevelFilter";
import { ListenBtn } from "../components/ListenBtn";
import { CAT_EMOJI, IC } from "../data/categories";
import { PHRASES } from "../data/phrases";
import { isDue, shuffle } from "../lib/srs";
import type { DeckMode, Level, Phrase, ProgressMap } from "../types";

interface Props {
  progress: ProgressMap;
  onRate: (id: number, quality: number) => void;
  play: (id: number, slow: boolean) => void;
  playing: string | null;
}

export function FlashcardView({ progress, onRate, play, playing }: Props) {
  const [mode, setMode] = useState<DeckMode>("new");
  const [lv, setLv] = useState<Level | "All">("All");
  const [deck, setDeck] = useState<Phrase[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  const buildDeck = useCallback(() => {
    let pool = lv === "All" ? [...PHRASES] : PHRASES.filter((p) => p.lv === lv);
    if (mode === "new") {
      pool = pool.filter((p) => !progress[p.id] || progress[p.id].level === 0);
    } else if (mode === "review") {
      pool = pool.filter((p) => isDue(progress[p.id]));
    }
    setDeck(shuffle(pool));
    setIdx(0);
    setFlipped(false);
  }, [mode, progress, lv]);

  useEffect(() => {
    buildDeck();
  }, [buildDeck]);

  const cur = deck[idx];
  useEffect(() => {
    if (cur && autoPlay && !flipped) {
      const t = setTimeout(() => play(cur.id, false), 300);
      return () => clearTimeout(t);
    }
  }, [idx, cur, autoPlay, flipped, play]);

  const flip = () => {
    setFlipped((f) => !f);
    if (!flipped && cur) play(cur.id, true);
  };
  const rate = (q: number) => {
    if (cur) onRate(cur.id, q);
    setFlipped(false);
    setTimeout(() => setIdx((i) => i + 1), 200);
  };

  if (!deck.length) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{IC.party}</div>
        <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "'Crimson Pro', Georgia, serif" }}>
          {mode === "new" ? "All phrases started!" : mode === "review" ? "No reviews due!" : "Empty deck."}
        </div>
        <div style={{ fontSize: 14, opacity: 0.6, marginTop: 8 }}>Try a different mode</div>
      </div>
    );
  }
  if (idx >= deck.length) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{IC.check}</div>
        <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "'Crimson Pro', Georgia, serif" }}>Session complete!</div>
        <div style={{ fontSize: 14, opacity: 0.6, marginTop: 8 }}>{deck.length} phrases</div>
        <button
          type="button"
          onClick={buildDeck}
          style={{
            marginTop: 20,
            padding: "10px 24px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: "#c41e3a",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <LevelFilter level={lv} onChange={setLv} />
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
        {(["new", "review", "all"] as DeckMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            style={{
              padding: "6px 12px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              background: mode === m ? "#c41e3a" : "rgba(42,24,24,0.06)",
              color: mode === m ? "#fff" : "#2a1818",
              textTransform: "capitalize",
            }}
          >
            {m === "new" ? "New" : m === "review" ? "Review" : "All"}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setAutoPlay((v) => !v)}
          style={{
            marginLeft: "auto",
            padding: "6px 12px",
            borderRadius: 20,
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            background: autoPlay ? "rgba(196,30,58,0.12)" : "rgba(42,24,24,0.06)",
            color: autoPlay ? "#c41e3a" : "#999",
          }}
        >
          {autoPlay ? `${IC.speaker} Auto` : `${IC.mute} Mute`}
        </button>
      </div>
      <div style={{ fontSize: 13, opacity: 0.5, marginBottom: 10 }}>
        {idx + 1} / {deck.length} {CAT_EMOJI[cur.cat]} {cur.cat}
      </div>
      <div
        onClick={flip}
        style={{
          cursor: "pointer",
          borderRadius: 18,
          padding: "32px 24px",
          background: flipped
            ? "linear-gradient(135deg, #1a0a0a 0%, #2a1818 100%)"
            : "linear-gradient(135deg, #fef3e8 0%, #fde8cd 100%)",
          color: flipped ? "#fef3e8" : "#2a1818",
          border: flipped ? "1px solid rgba(196,30,58,0.3)" : "1px solid rgba(42,24,24,0.1)",
          minHeight: 180,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          boxShadow: flipped ? "0 8px 32px rgba(196,30,58,0.15)" : "0 4px 20px rgba(42,24,24,0.08)",
          transition: "all 0.35s",
        }}
      >
        {!flipped ? (
          <>
            <div style={{ fontSize: 30, fontWeight: 700, fontFamily: "'Crimson Pro', Georgia, serif", marginBottom: 10 }}>{cur.zh}</div>
            <ListenBtn phrase={cur} play={play} playing={playing} size="lg" />
            <div style={{ fontSize: 13, opacity: 0.4, marginTop: 14 }}>listen → repeat → tap to reveal</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Crimson Pro', Georgia, serif", marginBottom: 4 }}>{cur.zh}</div>
            <div style={{ fontSize: 17, fontStyle: "italic", opacity: 0.6, marginBottom: 10 }}>{cur.py}</div>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>{cur.en}</div>
            {cur.note && (
              <div style={{ fontSize: 12, padding: "3px 12px", borderRadius: 20, background: "rgba(196,30,58,0.15)", color: "#c41e3a", marginTop: 4 }}>
                {cur.note}
              </div>
            )}
            <ListenBtn phrase={cur} play={play} playing={playing} size="md" style={{ marginTop: 14 }} />
          </>
        )}
      </div>
      {flipped && (
        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center" }}>
          {[
            { l: "Again", c: "#dc2626", q: 0 },
            { l: "Hard", c: "#ea580c", q: 1 },
            { l: "Good", c: "#16a34a", q: 2 },
            { l: "Easy", c: "#2563eb", q: 3 },
          ].map((b) => (
            <button
              key={b.l}
              type="button"
              onClick={() => rate(b.q)}
              style={{
                flex: 1,
                padding: "14px 8px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                background: b.c,
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              {b.l}
            </button>
          ))}
        </div>
      )}
      <div style={{ width: "100%", height: 4, borderRadius: 2, background: "rgba(42,24,24,0.06)", marginTop: 20 }}>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: "#c41e3a",
            width: `${((idx + 1) / deck.length) * 100}%`,
            transition: "width 0.4s",
          }}
        />
      </div>
    </div>
  );
}
