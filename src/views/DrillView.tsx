import { useEffect, useState } from "react";
import { ListenBtn } from "../components/ListenBtn";
import { CATEGORIES, IC } from "../data/categories";
import { PHRASES } from "../data/phrases";
import { shuffle } from "../lib/srs";
import type { Phrase } from "../types";

type Step = "listen" | "repeat" | "reveal";

interface Props {
  play: (id: number, slow: boolean) => void;
  playing: string | null;
}

export function DrillView({ play, playing }: Props) {
  const [cat, setCat] = useState<string>("All");
  const [pool, setPool] = useState<Phrase[]>([]);
  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState<Step>("listen");

  useEffect(() => {
    const p = cat === "All" ? PHRASES : PHRASES.filter((x) => x.cat === cat);
    setPool(shuffle(p));
    setIdx(0);
    setStep("listen");
  }, [cat]);

  const cur = pool[idx];
  if (!cur) return <div style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>No phrases</div>;
  const next = () => {
    setStep("listen");
    setIdx((i) => (i + 1) % pool.length);
  };

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, opacity: 0.5, marginBottom: 8 }}>
          Listen \u2192 Repeat aloud \u2192 Reveal \u2192 Next
        </div>
        <div className="chip-scroll" style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
                background: cat === c ? "#c41e3a" : "rgba(42,24,24,0.06)",
                color: cat === c ? "#fff" : "#2a1818",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 12, opacity: 0.4, marginBottom: 8 }}>
        {idx + 1} / {pool.length}
      </div>
      <div
        style={{
          borderRadius: 18,
          padding: "36px 24px",
          textAlign: "center",
          background: "linear-gradient(135deg, #1a0a0a 0%, #2a1818 100%)",
          color: "#fef3e8",
          minHeight: 220,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 8px 32px rgba(196,30,58,0.12)",
        }}
      >
        {step === "listen" && (
          <>
            <div style={{ fontSize: 14, opacity: 0.4, marginBottom: 16 }}>Step 1: Listen carefully</div>
            <button
              type="button"
              onClick={() => {
                play(cur.id, false);
                setStep("repeat");
              }}
              style={{
                padding: "18px 36px",
                borderRadius: 16,
                border: "none",
                cursor: "pointer",
                background: "linear-gradient(135deg, #c41e3a, #e53e56)",
                color: "#fff",
                fontSize: 20,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 4px 20px rgba(196,30,58,0.3)",
              }}
            >
              {IC.speaker} Play Phrase
            </button>
          </>
        )}
        {step === "repeat" && (
          <>
            <div style={{ fontSize: 14, opacity: 0.4, marginBottom: 8 }}>Step 2: Say it aloud</div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{IC.mic}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => play(cur.id, false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  background: "rgba(196,30,58,0.2)",
                  color: "#c41e3a",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                {IC.speaker} Again
              </button>
              <button
                type="button"
                onClick={() => play(cur.id, true)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  background: "rgba(124,58,237,0.15)",
                  color: "#a78bfa",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                {IC.turtle} Slow
              </button>
              <button
                type="button"
                onClick={() => setStep("reveal")}
                style={{
                  padding: "10px 20px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  background: "rgba(254,243,232,0.1)",
                  color: "#fef3e8",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                Reveal \u2192
              </button>
            </div>
          </>
        )}
        {step === "reveal" && (
          <>
            <div style={{ fontSize: 30, fontWeight: 700, fontFamily: "'Crimson Pro', Georgia, serif", marginBottom: 6 }}>{cur.zh}</div>
            <div style={{ fontSize: 17, fontStyle: "italic", opacity: 0.6, marginBottom: 8 }}>{cur.py}</div>
            <div style={{ fontSize: 19, fontWeight: 500, marginBottom: 6 }}>{cur.en}</div>
            {cur.note && (
              <div
                style={{
                  fontSize: 12,
                  padding: "3px 12px",
                  borderRadius: 20,
                  background: "rgba(196,30,58,0.15)",
                  color: "#c41e3a",
                  marginTop: 2,
                  marginBottom: 10,
                }}
              >
                {cur.note}
              </div>
            )}
            <ListenBtn phrase={cur} play={play} playing={playing} size="lg" style={{ marginBottom: 14 }} />
            <button
              type="button"
              onClick={next}
              style={{
                padding: "12px 32px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                background: "linear-gradient(135deg, #16a34a, #22c55e)",
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                boxShadow: "0 4px 16px rgba(22,163,74,0.3)",
              }}
            >
              Next Phrase \u2192
            </button>
          </>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
        {(["listen", "repeat", "reveal"] as Step[]).map((s) => (
          <div
            key={s}
            style={{
              width: step === s ? 32 : 10,
              height: 10,
              borderRadius: 5,
              background: step === s ? "#c41e3a" : "rgba(42,24,24,0.1)",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
