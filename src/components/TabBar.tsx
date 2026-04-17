import { IC } from "../data/categories";
import type { TabId } from "../types";

interface Props {
  tab: TabId;
  onChange: (t: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "drill", label: "Drill", icon: IC.headphones },
  { id: "browse", label: "Browse", icon: IC.book },
  { id: "flash", label: "Study", icon: IC.cards },
  { id: "quiz", label: "Quiz", icon: IC.pencil },
  { id: "speak", label: "Speak", icon: IC.mic },
  { id: "stats", label: "Stats", icon: IC.chart },
  { id: "tips", label: "Tips", icon: IC.bulb },
];

export function TabBar({ tab, onChange }: Props) {
  return (
    <div
      style={{
        display: "flex",
        background: "#fff",
        borderBottom: "1px solid rgba(42,24,24,0.06)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          style={{
            flex: 1,
            padding: "8px 2px",
            border: "none",
            cursor: "pointer",
            background: "transparent",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            opacity: tab === t.id ? 1 : 0.35,
            transition: "opacity 0.2s",
            borderBottom: tab === t.id ? "2px solid #c41e3a" : "2px solid transparent",
          }}
        >
          <span style={{ fontSize: 16 }}>{t.icon}</span>
          <span style={{ fontSize: 9, fontWeight: 600, color: tab === t.id ? "#c41e3a" : "#2a1818" }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
