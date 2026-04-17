import { IC } from "../data/categories";

interface Props {
  learnedCount: number;
  total: number;
}

export function Header({ learnedCount, total }: Props) {
  return (
    <div
      className="safe-top"
      style={{
        background: "linear-gradient(135deg, #1a0a0a 0%, #2d1515 50%, #3a1a10 100%)",
        padding: "20px 20px 16px",
        color: "#fef3e8",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: -30, right: -10, fontSize: 100, opacity: 0.04 }}>{IC.flag}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", opacity: 0.35, marginBottom: 2 }}>
            Mandarin Chinese
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Crimson Pro', Georgia, serif", letterSpacing: "-0.03em" }}>
            {"\u5B66\u4E2D\u6587!"}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#c41e3a", fontFamily: "'Crimson Pro', Georgia, serif" }}>
            {learnedCount}
            <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.4, color: "#fef3e8" }}>/{total}</span>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: "rgba(254,243,232,0.08)" }}>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: "linear-gradient(90deg, #c41e3a, #e53e56)",
            width: `${Math.min(100, (learnedCount / total) * 100)}%`,
            transition: "width 0.5s",
          }}
        />
      </div>
    </div>
  );
}
