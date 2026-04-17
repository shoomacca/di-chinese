import type { Level } from "../types";
import { LEVELS, LEVEL_NAMES } from "../types";

interface Props {
  level: Level | "All";
  onChange: (lv: Level | "All") => void;
}

const LV_COLORS: Record<Level, string> = {
  1: "#16a34a",
  2: "#2563eb",
  3: "#c41e3a",
  4: "#9333ea",
  5: "#dc2626",
};

export function LevelFilter({ level, onChange }: Props) {
  return (
    <div className="chip-scroll" style={{ display: "flex", gap: 5, overflowX: "auto", marginBottom: 10 }}>
      <button
        type="button"
        onClick={() => onChange("All")}
        style={{
          padding: "5px 10px",
          borderRadius: 16,
          border: "none",
          cursor: "pointer",
          fontSize: 11,
          fontWeight: 600,
          whiteSpace: "nowrap",
          background: level === "All" ? "#2a1818" : "rgba(42,24,24,0.06)",
          color: level === "All" ? "#fff" : "#2a1818",
        }}
      >
        All Levels
      </button>
      {LEVELS.map((lv) => (
        <button
          key={lv}
          type="button"
          onClick={() => onChange(lv)}
          style={{
            padding: "5px 10px",
            borderRadius: 16,
            border: "none",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: "nowrap",
            background: level === lv ? LV_COLORS[lv] : "rgba(42,24,24,0.06)",
            color: level === lv ? "#fff" : "#2a1818",
          }}
        >
          {LEVEL_NAMES[lv]}
        </button>
      ))}
    </div>
  );
}
