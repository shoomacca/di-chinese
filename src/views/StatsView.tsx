import { ProgressRing } from "../components/ProgressRing";
import { CAT_EMOJI, CATEGORIES } from "../data/categories";
import { PHRASES } from "../data/phrases";
import { MAX_LEVEL } from "../lib/srs";
import type { Category, ProgressMap } from "../types";

interface Props {
  progress: ProgressMap;
}

export function StatsView({ progress }: Props) {
  const total = PHRASES.length;
  const learned = Object.values(progress).filter((p) => p.level > 0).length;
  const verified = Object.values(progress).filter((p) => p.verified).length;
  const mastered = Object.values(progress).filter((p) => p.level >= MAX_LEVEL - 1).length;
  const pctL = Math.round((learned / total) * 100);
  const pctV = Math.round((verified / total) * 100);
  const pctM = Math.round((mastered / total) * 100);

  const byCat: Record<string, { total: number; learned: number; verified: number; pct: number }> = {};
  (CATEGORIES.filter((c) => c !== "All") as Category[]).forEach((cat) => {
    const cp = PHRASES.filter((p) => p.cat === cat);
    const cl = cp.filter((p) => progress[p.id] && progress[p.id].level > 0).length;
    const cv = cp.filter((p) => progress[p.id]?.verified).length;
    byCat[cat] = { total: cp.length, learned: cl, verified: cv, pct: Math.round((cl / cp.length) * 100) };
  });

  const cards = [
    { label: "Learned", val: `${learned}/${total}`, pct: pctL, color: "#c41e3a" },
    { label: "Verified", val: `${verified}/${total}`, pct: pctV, color: "#2563eb" },
    { label: "Mastered", val: `${mastered}/${total}`, pct: pctM, color: "#16a34a" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {cards.map((s) => (
          <div
            key={s.label}
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 14,
              background: "linear-gradient(135deg, #1a0a0a, #2a1818)",
              color: "#fef3e8",
              textAlign: "center",
            }}
          >
            <div style={{ position: "relative", display: "inline-block" }}>
              <ProgressRing pct={s.pct} size={56} stroke={5} color={s.color} />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {s.pct}%
              </div>
            </div>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>{s.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Crimson Pro', Georgia, serif" }}>{s.val}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Object.entries(byCat).map(([cat, d]) => (
          <div
            key={cat}
            style={{ padding: "12px 16px", borderRadius: 12, background: "#fff", border: "1px solid rgba(42,24,24,0.08)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
              <span>
                {CAT_EMOJI[cat as Category]} {cat}
              </span>
              <span style={{ opacity: 0.5 }}>
                {d.learned}/{d.total}
                {d.verified > 0 && (
                  <span style={{ marginLeft: 6, color: "#2563eb", fontWeight: 700 }}>
                    {"\u00B7"} {d.verified}{"\u2713"}
                  </span>
                )}
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "rgba(42,24,24,0.06)" }}>
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: d.pct === 100 ? "#16a34a" : "#c41e3a",
                  width: `${d.pct}%`,
                  transition: "width 0.5s",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
