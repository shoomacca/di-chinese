import type { CSSProperties } from "react";
import { IC } from "../data/categories";
import type { Phrase } from "../types";

type Size = "sm" | "md" | "lg";

interface Props {
  phrase: Phrase;
  play: (id: number, slow: boolean) => void;
  playing: string | null;
  size?: Size;
  style?: CSSProperties;
}

const SIZE_MAP: Record<Size, { p: string; fs: number }> = {
  sm: { p: "6px 10px", fs: 13 },
  md: { p: "8px 14px", fs: 14 },
  lg: { p: "12px 20px", fs: 16 },
};

export function ListenBtn({ phrase, play, playing, size = "md", style }: Props) {
  const dim = SIZE_MAP[size];
  const isP = playing === String(phrase.id);
  const isS = playing === `${phrase.id}-slow`;

  return (
    <div style={{ display: "flex", gap: 4, ...style }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          play(phrase.id, false);
        }}
        style={{
          padding: dim.p,
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          background: isP ? "#c41e3a" : "rgba(196,30,58,0.1)",
          color: isP ? "#fff" : "#c41e3a",
          fontSize: dim.fs,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 5,
          transition: "all 0.2s",
        }}
      >
        {isP ? IC.speaker : IC.speakerLow}
        {size !== "sm" && " Listen"}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          play(phrase.id, true);
        }}
        style={{
          padding: dim.p,
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          background: isS ? "#7c3aed" : "rgba(124,58,237,0.08)",
          color: isS ? "#fff" : "#7c3aed",
          fontSize: dim.fs,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 4,
          transition: "all 0.2s",
        }}
      >
        {IC.turtle}
        {size !== "sm" && " Slow"}
      </button>
    </div>
  );
}
