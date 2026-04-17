import { useCallback, useEffect, useState } from "react";
import { ListenBtn } from "../components/ListenBtn";
import { IC } from "../data/categories";
import { PHRASES } from "../data/phrases";
import { shuffle } from "../lib/srs";
import type { Phrase, QuizMode } from "../types";

interface Question {
  phrase: Phrase;
  options: Phrase[];
  correct: number;
}

interface Props {
  onRate: (id: number, quality: number) => void;
  play: (id: number, slow: boolean) => void;
  playing: string | null;
}

export function QuizView({ onRate, play, playing }: Props) {
  const [qt, setQt] = useState<QuizMode>("listen");
  const [qs, setQs] = useState<Question[]>([]);
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [sc, setSc] = useState({ c: 0, t: 0 });

  const gen = useCallback(() => {
    const pool = shuffle(PHRASES).slice(0, 10);
    const r: Question[] = pool.map((p) => {
      const w = shuffle(PHRASES.filter((x) => x.id !== p.id)).slice(0, 3);
      return { phrase: p, options: shuffle([p, ...w]), correct: p.id };
    });
    setQs(r);
    setQi(0);
    setSel(null);
    setSc({ c: 0, t: 0 });
  }, []);

  useEffect(() => {
    gen();
  }, [gen]);

  const cur = qs[qi];
  useEffect(() => {
    if (cur && qt === "listen") {
      const t = setTimeout(() => play(cur.phrase.id, false), 400);
      return () => clearTimeout(t);
    }
  }, [qi, cur, qt, play]);

  if (!qs.length) return null;
  if (qi >= qs.length) {
    const pct = Math.round((sc.c / sc.t) * 100);
    return (
      <div style={{ textAlign: "center", padding: 32 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>{pct >= 80 ? IC.trophy : pct >= 50 ? IC.thumbsup : IC.muscle}</div>
        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Crimson Pro', Georgia, serif" }}>{pct}%</div>
        <div style={{ fontSize: 15, opacity: 0.6, marginTop: 6 }}>
          {sc.c} / {sc.t} correct
        </div>
        <button
          type="button"
          onClick={gen}
          style={{
            marginTop: 24,
            padding: "12px 28px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: "#c41e3a",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          New Quiz
        </button>
      </div>
    );
  }
  const q = cur;
  const optTxt = (o: Phrase) => (qt === "en-zh" ? o.zh : o.en);
  const pick = (oid: number) => {
    if (sel !== null) return;
    setSel(oid);
    const ok = oid === q.correct;
    setSc((s) => ({ c: s.c + (ok ? 1 : 0), t: s.t + 1 }));
    onRate(q.phrase.id, ok ? 2 : 0);
    if (ok) play(q.phrase.id, false);
    setTimeout(() => {
      setSel(null);
      setQi((i) => i + 1);
    }, 1400);
  };

  const modes: { id: QuizMode; l: string }[] = [
    { id: "listen", l: `${IC.headphones} Listen` },
    { id: "zh-en", l: `${IC.flag} Read` },
    { id: "en-zh", l: `${IC.gb} Translate` },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {modes.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setQt(t.id);
              gen();
            }}
            style={{
              padding: "6px 12px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              background: qt === t.id ? "#c41e3a" : "rgba(42,24,24,0.06)",
              color: qt === t.id ? "#fff" : "#2a1818",
            }}
          >
            {t.l}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 13, opacity: 0.5, marginBottom: 8 }}>
        Q{qi + 1}/{qs.length} | {sc.c}/{sc.t}
      </div>
      <div
        style={{
          padding: "24px 20px",
          borderRadius: 16,
          textAlign: "center",
          marginBottom: 14,
          background: "linear-gradient(135deg, #1a0a0a 0%, #2a1818 100%)",
          color: "#fef3e8",
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.45, marginBottom: 8 }}>
          {qt === "listen" ? "What does this sound like?" : qt === "zh-en" ? "What does this mean?" : "How do you say this?"}
        </div>
        {qt === "listen" ? (
          <div>
            <button
              type="button"
              onClick={() => play(q.phrase.id, false)}
              style={{
                padding: "14px 28px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                background: "rgba(196,30,58,0.2)",
                color: "#c41e3a",
                fontSize: 20,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {IC.speaker} Play
            </button>
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                onClick={() => play(q.phrase.id, true)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  background: "rgba(124,58,237,0.15)",
                  color: "#a78bfa",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {IC.turtle} Slow
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Crimson Pro', Georgia, serif" }}>
              {qt === "zh-en" ? q.phrase.zh : q.phrase.en}
            </div>
            {qt === "zh-en" && (
              <div style={{ marginTop: 8, display: "flex", justifyContent: "center" }}>
                <ListenBtn phrase={q.phrase} play={play} playing={playing} size="sm" />
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.options.map((o) => {
          let bg = "#fff";
          let bd = "1px solid rgba(42,24,24,0.1)";
          let cl = "#2a1818";
          if (sel !== null) {
            if (o.id === q.correct) {
              bg = "#dcfce7";
              bd = "1px solid #16a34a";
              cl = "#15803d";
            } else if (o.id === sel && sel !== q.correct) {
              bg = "#fee2e2";
              bd = "1px solid #dc2626";
              cl = "#b91c1c";
            }
          }
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => pick(o.id)}
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                border: bd,
                background: bg,
                color: cl,
                fontSize: 16,
                fontWeight: 600,
                cursor: sel !== null ? "default" : "pointer",
                textAlign: "left",
                fontFamily: qt === "en-zh" ? "'Crimson Pro', Georgia, serif" : "'DM Sans', sans-serif",
                transition: "all 0.2s",
              }}
            >
              {optTxt(o)}
            </button>
          );
        })}
      </div>
      {sel !== null && (
        <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(196,30,58,0.06)", fontSize: 14 }}>
          <strong>{q.phrase.zh}</strong> {q.phrase.py} = {q.phrase.en}
        </div>
      )}
      <div style={{ width: "100%", height: 4, borderRadius: 2, background: "rgba(42,24,24,0.06)", marginTop: 16 }}>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: "#c41e3a",
            width: `${((qi + 1) / qs.length) * 100}%`,
            transition: "width 0.4s",
          }}
        />
      </div>
    </div>
  );
}
