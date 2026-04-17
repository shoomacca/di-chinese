import { useCallback, useEffect, useRef, useState } from "react";
import { IC } from "../data/categories";
import { scorePronunciation, type ScoreResult } from "../lib/similarity";
import type { Phrase } from "../types";

const WHISPER_URL = ((import.meta.env.VITE_WHISPER_URL as string | undefined) || "https://whisper-cn.bsbsbs.au")
  .trim()
  .replace(/\/$/, "");

export const VERIFIED_THRESHOLD = 90;

type RecState = "idle" | "recording" | "uploading" | "result" | "error";

export interface PronunciationResult {
  score: number;
  heard: string;
  scoreResult: ScoreResult;
}

interface Props {
  phrase: Phrase;
  onResult?: (r: PronunciationResult) => void;
  compact?: boolean;
}

function pickMimeType(): string {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c)) return c;
  }
  return "";
}

function scoreColor(s: number): string {
  if (s >= VERIFIED_THRESHOLD) return "#16a34a";
  if (s >= 50) return "#c41e3a";
  return "#dc2626";
}

export function PronunciationCheck({ phrase, onResult, compact = false }: Props) {
  const [state, setState] = useState<RecState>("idle");
  const [err, setErr] = useState<string | null>(null);
  const [scoreData, setScoreData] = useState<PronunciationResult | null>(null);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const phraseRef = useRef<Phrase>(phrase);
  useEffect(() => {
    phraseRef.current = phrase;
  }, [phrase]);

  useEffect(() => {
    setState("idle");
    setErr(null);
    setScoreData(null);
  }, [phrase.id]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const uploadAndScore = useCallback(
    async (blob: Blob, mimeType: string) => {
      const p = phraseRef.current;
      if (!p) {
        setErr("No phrase selected");
        setState("error");
        return;
      }
      if (blob.size === 0) {
        setErr("Recording empty — hold the button longer");
        setState("error");
        return;
      }
      try {
        const ext = mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : "webm";
        const fd = new FormData();
        fd.append("audio", blob, `recording.${ext}`);
        fd.append("target", p.zh);
        const res = await fetch(`${WHISPER_URL}/transcribe`, { method: "POST", body: fd });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Whisper ${res.status}: ${body.slice(0, 120)}`);
        }
        const data = (await res.json()) as { text: string };
        const heard = (data.text || "").trim();
        const scoreResult = scorePronunciation(p.zh, heard);
        const result: PronunciationResult = { score: scoreResult.score, heard, scoreResult };
        setScoreData(result);
        setState("result");
        onResult?.(result);
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
        setState("error");
      }
    },
    [onResult],
  );

  const start = useCallback(async () => {
    setErr(null);
    setScoreData(null);
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
        setErr(`Microphone: ${msg}`);
      }
      setState("error");
    }
  }, [uploadAndScore]);

  const stop = useCallback(() => {
    const mr = mediaRef.current;
    if (mr && mr.state !== "inactive") {
      setState("uploading");
      mr.stop();
    }
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setErr(null);
    setScoreData(null);
  }, []);

  const pad = compact ? "8px 16px" : "14px 28px";
  const fontSize = compact ? 14 : 16;
  const radius = compact ? 10 : 999;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {state === "idle" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              start();
            }}
            style={{
              padding: pad,
              borderRadius: radius,
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, #c41e3a, #e53e56)",
              color: "#fff",
              fontSize,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: compact ? "none" : "0 4px 20px rgba(196,30,58,0.3)",
            }}
          >
            {IC.mic} {compact ? "Check" : "Record"}
          </button>
        )}
        {state === "recording" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              stop();
            }}
            style={{
              padding: pad,
              borderRadius: radius,
              border: "none",
              cursor: "pointer",
              background: "#dc2626",
              color: "#fff",
              fontSize,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              animation: "pulse 1.2s infinite",
            }}
          >
            {IC.stop} Stop
          </button>
        )}
        {state === "uploading" && (
          <div style={{ padding: "8px 12px", fontSize: compact ? 13 : 15, opacity: 0.7 }}>
            {IC.loading} Transcribing…
          </div>
        )}
        {state === "result" && scoreData && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              reset();
            }}
            style={{
              padding: pad,
              borderRadius: radius,
              border: "none",
              cursor: "pointer",
              background: "rgba(196,30,58,0.12)",
              color: "#c41e3a",
              fontSize,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {IC.mic} Retry
          </button>
        )}
      </div>

      {state === "error" && err && (
        <div
          style={{
            marginTop: 8,
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(220,38,38,0.08)",
            color: "#b91c1c",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>{IC.warn} {err}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              reset();
            }}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              background: "#dc2626",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {state === "result" && scoreData && (
        <div
          style={{
            marginTop: 10,
            padding: compact ? 10 : 14,
            borderRadius: 12,
            background: "#fff",
            color: "#2a1818",
            border: `1px solid ${scoreColor(scoreData.score)}33`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 12, color: "rgba(42,24,24,0.5)" }}>{scoreData.score >= VERIFIED_THRESHOLD ? "Verified " + IC.check : "Heard"}</div>
            <div
              style={{
                fontSize: compact ? 18 : 22,
                fontWeight: 800,
                fontFamily: "'Crimson Pro', Georgia, serif",
                color: scoreColor(scoreData.score),
              }}
            >
              {scoreData.score}%
            </div>
          </div>
          <div style={{ fontSize: compact ? 15 : 17, fontWeight: 600, fontFamily: "'Crimson Pro', Georgia, serif", marginBottom: 8 }}>
            {scoreData.heard || <span style={{ opacity: 0.5 }}>(silence)</span>}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {scoreData.scoreResult.words.map((w, i) => (
              <span
                key={i}
                title={w.heard ? `heard: ${w.heard}` : "missing"}
                style={{
                  padding: "3px 8px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontWeight: 600,
                  background: w.ok ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.1)",
                  color: w.ok ? "#15803d" : "#b91c1c",
                  border: w.ok ? "1px solid rgba(22,163,74,0.3)" : "1px solid rgba(220,38,38,0.3)",
                }}
              >
                {w.target}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "rgba(42,24,24,0.55)", marginTop: 6 }}>
            exact {scoreData.scoreResult.charPct}% · relaxed {scoreData.scoreResult.charPctNoTone}%
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
