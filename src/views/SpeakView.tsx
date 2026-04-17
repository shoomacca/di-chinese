import { useCallback, useEffect, useRef, useState } from "react";
import { LevelFilter } from "../components/LevelFilter";
import { ListenBtn } from "../components/ListenBtn";
import { CAT_EMOJI, CATEGORIES, IC } from "../data/categories";
import { PHRASES } from "../data/phrases";
import { scorePronunciation, type ScoreResult } from "../lib/similarity";
import { shuffle } from "../lib/srs";
import type { Level, Phrase, ProgressMap } from "../types";

const WHISPER_URL = ((import.meta.env.VITE_WHISPER_URL as string | undefined) || "https://whisper-cn.bsbsbs.au")
  .trim()
  .replace(/\/$/, "");

const HISTORY_KEY = "cn-learn-v1:speak-history";
const HISTORY_MAX = 10;

type RecState = "idle" | "recording" | "uploading" | "result" | "error";

interface Attempt {
  heard: string;
  result: ScoreResult;
}

interface HistoryEntry {
  at: number;
  phraseId: number;
  phraseZh: string;
  phraseEn: string;
  heard: string;
  score: number;
  exactPct: number;
  relaxedPct: number;
}

interface Props {
  onRate: (id: number, quality: number) => void;
  progress: ProgressMap;
  play: (id: number, slow: boolean) => void;
  playing: string | null;
}

function scoreColor(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 50) return "#c41e3a";
  return "#dc2626";
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistory(list: HistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    // quota exceeded
  }
}

function timeAgo(ts: number): string {
  const secs = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export function SpeakView({ onRate, progress, play, playing }: Props) {
  const [cat, setCat] = useState<string>("All");
  const [lv, setLv] = useState<Level | "All">("All");
  const [deck, setDeck] = useState<Phrase[]>([]);
  const [idx, setIdx] = useState(0);
  const [state, setState] = useState<RecState>("idle");
  const [err, setErr] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [permissionAsked, setPermissionAsked] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const curRef = useRef<Phrase | undefined>(undefined);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    let p = cat === "All" ? PHRASES : PHRASES.filter((x) => x.cat === cat);
    if (lv !== "All") p = p.filter((x) => x.lv === lv);
    setDeck(shuffle(p));
    setIdx(0);
    setAttempt(null);
    setState("idle");
  }, [cat, lv]);

  const cur = deck[idx];

  useEffect(() => {
    curRef.current = cur;
  }, [cur]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const pickMimeType = (): string => {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
    ];
    for (const c of candidates) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c)) return c;
    }
    return "";
  };

  const startRecording = useCallback(async () => {
    setErr(null);
    setAttempt(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErr("Microphone not available — this site must be served over HTTPS");
      setState("error");
      return;
    }
    try {
      const perm = await navigator.permissions.query({ name: "microphone" as PermissionName });
      if (perm.state === "denied") {
        setErr("Microphone access was denied — please allow it in your browser settings and reload");
        setState("error");
        return;
      }
    } catch {
      // permissions API not supported
    }
    try {
      setPermissionAsked(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        const type = mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        await uploadAndScore(blob, type);
      };
      mr.start();
      mediaRef.current = mr;
      setState("recording");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("NotAllowedError") || msg.includes("Permission")) {
        setErr("Microphone access denied — tap the lock icon in your browser's address bar to allow it, then reload");
      } else {
        setErr(`Microphone error: ${msg}`);
      }
      setState("error");
    }
  }, []);

  const stopRecording = useCallback(() => {
    const mr = mediaRef.current;
    if (mr && mr.state !== "inactive") {
      setState("uploading");
      mr.stop();
    }
  }, []);

  const uploadAndScore = useCallback(
    async (blob: Blob, mimeType: string) => {
      const phrase = curRef.current;
      if (!phrase) {
        setErr("No phrase selected — try again");
        setState("error");
        return;
      }
      if (blob.size === 0) {
        setErr("Recording was empty — try holding the button longer");
        setState("error");
        return;
      }
      try {
        const ext = mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : "webm";
        const fd = new FormData();
        fd.append("audio", blob, `recording.${ext}`);
        fd.append("target", phrase.zh);
        const res = await fetch(`${WHISPER_URL}/transcribe`, { method: "POST", body: fd });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Whisper ${res.status}: ${body.slice(0, 120)}`);
        }
        const data = (await res.json()) as { text: string; confidence?: number };
        const heard = (data.text || "").trim();
        const result = scorePronunciation(phrase.zh, heard);
        setAttempt({ heard, result });
        onRate(phrase.id, result.score >= 70 ? 2 : result.score >= 40 ? 1 : 0);
        setState("result");

        const entry: HistoryEntry = {
          at: Date.now(),
          phraseId: phrase.id,
          phraseZh: phrase.zh,
          phraseEn: phrase.en,
          heard,
          score: result.score,
          exactPct: result.charPct,
          relaxedPct: result.charPctNoTone,
        };
        setHistory((prev) => {
          const next = [entry, ...prev].slice(0, HISTORY_MAX);
          saveHistory(next);
          return next;
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setErr(msg);
        setState("error");
      }
    },
    [onRate],
  );

  const next = () => {
    setAttempt(null);
    setState("idle");
    setErr(null);
    setIdx((i) => (i + 1) % Math.max(deck.length, 1));
  };

  const jumpToPhrase = (phraseId: number) => {
    const inDeckIdx = deck.findIndex((p) => p.id === phraseId);
    if (inDeckIdx >= 0) {
      setIdx(inDeckIdx);
      setAttempt(null);
      setState("idle");
      setErr(null);
      return;
    }
    const full = PHRASES;
    const targetIdx = full.findIndex((p) => p.id === phraseId);
    if (targetIdx < 0) return;
    setCat("All");
    setTimeout(() => {
      const reordered = [full[targetIdx], ...shuffle(full.filter((p) => p.id !== phraseId))];
      setDeck(reordered);
      setIdx(0);
      setAttempt(null);
      setState("idle");
      setErr(null);
    }, 0);
  };

  const clearHistory = () => {
    if (!window.confirm("Clear all Speak history?")) return;
    setHistory([]);
    saveHistory([]);
  };

  if (!cur) return <div style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>No phrases</div>;

  const learned = !!progress[cur.id] && progress[cur.id].level > 0;

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 13, opacity: 0.5, marginBottom: 8 }}>
          Listen → Record → Compare (uses whisper-cn.bsbsbs.au)
        </div>
        <LevelFilter level={lv} onChange={setLv} />
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
              {c !== "All" ? `${CAT_EMOJI[c]} ${c}` : c}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          borderRadius: 18,
          padding: "24px 20px",
          background: "linear-gradient(135deg, #1a0a0a 0%, #2a1818 100%)",
          color: "#fef3e8",
          marginBottom: 16,
          boxShadow: "0 8px 32px rgba(196,30,58,0.12)",
        }}
      >
        <div style={{ fontSize: 11, opacity: 0.4, marginBottom: 4, letterSpacing: 2, textTransform: "uppercase" }}>
          {CAT_EMOJI[cur.cat]} {cur.cat}
          {learned && <span style={{ marginLeft: 8, color: "#4ade80" }}>{"✓"}</span>}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Crimson Pro', Georgia, serif", marginBottom: 4 }}>
          {cur.zh}
        </div>
        <div style={{ fontSize: 15, fontStyle: "italic", opacity: 0.6, marginBottom: 6 }}>{cur.py}</div>
        <div style={{ fontSize: 15, opacity: 0.85, marginBottom: 14 }}>{cur.en}</div>
        <ListenBtn phrase={cur} play={play} playing={playing} size="md" />
      </div>

      <div style={{ textAlign: "center", marginBottom: 12 }}>
        {state === "idle" && (
          <button
            type="button"
            onClick={startRecording}
            style={{
              padding: "16px 40px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, #c41e3a, #e53e56)",
              color: "#fff",
              fontSize: 18,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 4px 20px rgba(196,30,58,0.3)",
            }}
          >
            {IC.mic} {permissionAsked ? "Record again" : "Start recording"}
          </button>
        )}
        {state === "recording" && (
          <button
            type="button"
            onClick={stopRecording}
            style={{
              padding: "16px 40px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: "#dc2626",
              color: "#fff",
              fontSize: 18,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              animation: "pulse 1.2s infinite",
              boxShadow: "0 4px 20px rgba(220,38,38,0.35)",
            }}
          >
            {IC.stop} Stop
          </button>
        )}
        {state === "uploading" && (
          <div style={{ padding: "16px 20px", fontSize: 15, opacity: 0.7 }}>
            {IC.loading} Transcribing with Whisper...
          </div>
        )}
      </div>

      {state === "error" && err && (
        <div
          style={{
            padding: 14,
            borderRadius: 12,
            background: "rgba(220,38,38,0.08)",
            color: "#b91c1c",
            fontSize: 14,
            marginBottom: 12,
          }}
        >
          {IC.warn} {err}
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              onClick={() => {
                setErr(null);
                setState("idle");
              }}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: "#dc2626",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {state === "result" && attempt && (
        <div
          style={{
            padding: 16,
            borderRadius: 14,
            background: "#fff",
            border: "1px solid rgba(42,24,24,0.08)",
            boxShadow: "0 4px 20px rgba(42,24,24,0.06)",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 13, opacity: 0.5 }}>Your attempt</div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                fontFamily: "'Crimson Pro', Georgia, serif",
                color: scoreColor(attempt.result.score),
              }}
            >
              {attempt.result.score}%
            </div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "'Crimson Pro', Georgia, serif", marginBottom: 12 }}>
            {attempt.heard || <span style={{ opacity: 0.5 }}>(silence)</span>}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {attempt.result.words.map((w, i) => (
              <span
                key={i}
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontWeight: 600,
                  background: w.ok ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.1)",
                  color: w.ok ? "#15803d" : "#b91c1c",
                  border: w.ok ? "1px solid rgba(22,163,74,0.3)" : "1px solid rgba(220,38,38,0.3)",
                }}
                title={w.heard ? `heard: ${w.heard}` : "missing"}
              >
                {w.target}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 12, opacity: 0.55, marginBottom: 12 }}>
            exact: {attempt.result.charPct}% — relaxed: {attempt.result.charPctNoTone}%
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => {
                setAttempt(null);
                setState("idle");
              }}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                background: "rgba(196,30,58,0.12)",
                color: "#c41e3a",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              {IC.mic} Retry
            </button>
            <button
              type="button"
              onClick={next}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                background: "linear-gradient(135deg, #16a34a, #22c55e)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.7, textTransform: "uppercase", letterSpacing: 1 }}>
              Recent attempts ({history.length})
            </div>
            <button
              type="button"
              onClick={clearHistory}
              style={{
                padding: "4px 10px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: "transparent",
                color: "#999",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Clear
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {history.map((h, i) => {
              const color = scoreColor(h.score);
              const heardClean = h.heard || "(silence)";
              const matchesTarget = heardClean.trim() === h.phraseZh.trim();
              return (
                <button
                  key={`${h.phraseId}-${h.at}-${i}`}
                  type="button"
                  onClick={() => jumpToPhrase(h.phraseId)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid rgba(42,24,24,0.08)",
                    background: "#fff",
                    textAlign: "left",
                    cursor: "pointer",
                    width: "100%",
                    transition: "background 0.15s",
                  }}
                >
                  <div
                    style={{
                      minWidth: 46,
                      padding: "4px 8px",
                      borderRadius: 8,
                      background: `${color}1f`,
                      color,
                      fontSize: 14,
                      fontWeight: 800,
                      fontFamily: "'Crimson Pro', Georgia, serif",
                      textAlign: "center",
                    }}
                  >
                    {h.score}%
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        fontFamily: "'Crimson Pro', Georgia, serif",
                        color: "#2a1818",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h.phraseZh}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        opacity: 0.6,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontStyle: matchesTarget ? "normal" : "italic",
                      }}
                    >
                      {matchesTarget ? h.phraseEn : `heard: ${heardClean}`}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, opacity: 0.4, flexShrink: 0 }}>{timeAgo(h.at)}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}
