interface Props {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
}

export function ProgressRing({ pct, size = 44, stroke = 4, color = "#c41e3a" }: Props) {
  const r = (size - stroke) / 2;
  const ci = 2 * Math.PI * r;
  const off = ci - (pct / 100) * ci;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2a1818" strokeWidth={stroke} opacity={0.15} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={ci}
        strokeDashoffset={off}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}
