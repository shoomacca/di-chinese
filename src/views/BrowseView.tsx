import { useState } from "react";
import { LevelFilter } from "../components/LevelFilter";
import { ListenBtn } from "../components/ListenBtn";
import { PronunciationCheck, VERIFIED_THRESHOLD } from "../components/PronunciationCheck";
import { CAT_EMOJI, CATEGORIES, IC } from "../data/categories";
import { PHRASES } from "../data/phrases";
import type { Level, ProgressMap } from "../types";

interface Props {
  progress: ProgressMap;
  onLearn: (id: number) => void;
  onVerified: (id: number, score: number) => void;
  onResetPhrase: (id: number) => void;
  play: (id: number, slow: boolean) => void;
  playing: string | null;
}

export function BrowseView({ progress, onLearn, onVerified, onResetPhrase, play, playing }: Props) {
  const [filter, setFilter] = useState<string>("All");
  const [lv, setLv] = useState<Level | "All">("All");
  const [expanded, setExpanded] = useState<number | null>(null);
  let filtered = filter === "All" ? PHRASES : PHRASES.filter((p) => p.cat === filter);
  if (lv !== "All") filtered = filtered.filter((p) => p.lv === lv);
  const isL = (id: number) => !!progress[id] && progress[id].level > 0;
  const isV = (id: number) => !!progress[id]?.verified;

  return (
    <div>
      <LevelFilter level={lv} onChange={setLv} />
      <div className="chip-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "0 0 16px" }}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            style={{
              padding: "7px 14px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontSize: 13,
              fontWeight: 600,
              background: filter === c ? "#c41e3a" : "rgba(42,24,24,0.06)",
              color: filter === c ? "#fff" : "#2a1818",
            }}
          >
            {c !== "All" ? `${CAT_EMOJI[c]} ${c}` : c}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.map((p) => {
          const open = expanded === p.id;
          const learned = isL(p.id);
          const verified = isV(p.id);
          const bestScore = progress[p.id]?.verifiedBestScore;
          return (
            <div
              key={p.id}
              onClick={() => setExpanded(open ? null : p.id)}
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                cursor: "pointer",
                background: open
                  ? "linear-gradient(135deg, #1a0a0a, #2a1818)"
                  : verified
                  ? "rgba(34,139,34,0.1)"
                  : learned
                  ? "rgba(34,139,34,0.06)"
                  : "#fff",
                color: open ? "#fef3e8" : "#2a1818",
                border: open
                  ? "1px solid rgba(196,30,58,0.3)"
                  : verified
                  ? "1px solid rgba(34,139,34,0.3)"
                  : learned
                  ? "1px solid rgba(34,139,34,0.15)"
                  : "1px solid rgba(42,24,24,0.08)",
                transition: "all 0.25s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 700, fontSize: 16, fontFamily: "'Crimson Pro', Georgia, serif" }}>{p.zh}</span>
                  <span style={{ marginLeft: 10, fontSize: 14, opacity: 0.6 }}>{p.en}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {verified && (
                    <span
                      style={{
                        fontSize: 11,
                        color: open ? "#4ade80" : "#16a34a",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      {IC.check}
                      {bestScore !== undefined ? `${bestScore}%` : ""}
                    </span>
                  )}
                  {!verified && learned && (
                    <span style={{ fontSize: 11, color: open ? "#4ade80" : "#228b22", fontWeight: 600 }}>OK</span>
                  )}
                  <ListenBtn phrase={p} play={play} playing={playing} size="sm" />
                </div>
              </div>
              {open && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(254,243,232,0.1)" }}>
                  <div style={{ fontSize: 17, fontStyle: "italic", opacity: 0.7, marginBottom: 6 }}>{p.py}</div>
                  <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{p.en}</div>
                  {p.note && (
                    <div
                      style={{
                        fontSize: 12,
                        padding: "3px 10px",
                        borderRadius: 20,
                        display: "inline-block",
                        background: "rgba(196,30,58,0.15)",
                        color: "#c41e3a",
                        marginBottom: 10,
                      }}
                    >
                      {p.note}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
                    <ListenBtn phrase={p} play={play} playing={playing} size="md" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLearn(p.id);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 10,
                        border: "none",
                        cursor: "pointer",
                        background: learned ? "#16a34a" : "#c41e3a",
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {learned ? "Learned" : "Mark Learned"}
                    </button>
                    {(learned || verified) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Reset progress for "${p.zh}"?`)) onResetPhrase(p.id);
                        }}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 10,
                          border: "1px solid rgba(220,38,38,0.3)",
                          cursor: "pointer",
                          background: "transparent",
                          color: open ? "#fca5a5" : "#b91c1c",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <div
                      style={{
                        fontSize: 11,
                        opacity: 0.55,
                        marginBottom: 6,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      Say it aloud {verified ? "· verified" : `· ≥ ${VERIFIED_THRESHOLD}% to verify`}
                    </div>
                    <PronunciationCheck
                      phrase={p}
                      compact
                      onResult={(r) => {
                        if (r.score >= VERIFIED_THRESHOLD) onVerified(p.id, r.score);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
