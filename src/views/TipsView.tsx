import { IC } from "../data/categories";
import { TIPS } from "../data/tips";

interface Props {
  play: (id: number, slow: boolean) => void;
  playing: string | null;
}

export function TipsView({ play, playing }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {TIPS.map((tip, i) => (
        <div
          key={i}
          style={{
            padding: "16px 18px",
            borderRadius: 14,
            background: "#fff",
            border: "1px solid rgba(42,24,24,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>{tip.icon}</span>
            <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Crimson Pro', Georgia, serif" }}>{tip.title}</span>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.75, marginBottom: tip.ex.length ? 10 : 0 }}>{tip.body}</div>
          {tip.ex.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {tip.ex.map((ex, j) => {
                const key = ex.id ? `${ex.id}-slow` : `tip-${i}-${j}`;
                const active = playing === key;
                return (
                  <button
                    key={j}
                    type="button"
                    onClick={() => ex.id && play(ex.id, true)}
                    disabled={!ex.id}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 10,
                      border: "none",
                      cursor: ex.id ? "pointer" : "default",
                      background: active ? "#c41e3a" : "rgba(196,30,58,0.08)",
                      color: active ? "#fff" : "#c41e3a",
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: "'Crimson Pro', Georgia, serif",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.2s",
                    }}
                  >
                    {IC.speaker} {ex.zh}
                    <span style={{ fontWeight: 400, opacity: 0.6, fontStyle: "italic" }}>{ex.py}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
