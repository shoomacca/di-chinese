import { useCallback, useState } from "react";
import { Header } from "./components/Header";
import { TabBar } from "./components/TabBar";
import { IC } from "./data/categories";
import { PHRASES } from "./data/phrases";
import { useAudio } from "./hooks/useAudio";
import { useProgress } from "./hooks/useProgress";
import { nextProgress } from "./lib/srs";
import type { TabId } from "./types";
import { BrowseView } from "./views/BrowseView";
import { DrillView } from "./views/DrillView";
import { FlashcardView } from "./views/FlashcardView";
import { QuizView } from "./views/QuizView";
import { SpeakView } from "./views/SpeakView";
import { StatsView } from "./views/StatsView";
import { TipsView } from "./views/TipsView";

export default function App() {
  const { progress, update, reset, loaded } = useProgress();
  const { play, stop, playing } = useAudio();
  const [tab, setTabState] = useState<TabId>("drill");

  const setTab = (t: TabId) => {
    stop();
    setTabState(t);
  };

  const handleLearn = useCallback(
    (id: number) => {
      update((prev) => ({
        ...prev,
        [id]: {
          level: Math.max(1, prev[id]?.level ?? 0),
          lastReview: Date.now(),
          reviews: (prev[id]?.reviews ?? 0) + 1,
        },
      }));
    },
    [update],
  );

  const handleRate = useCallback(
    (id: number, q: number) => {
      update((prev) => ({ ...prev, [id]: nextProgress(prev[id], q) }));
    },
    [update],
  );

  const handleVerified = useCallback(
    (id: number, score: number) => {
      update((prev) => {
        const cur = prev[id] || { level: 0, lastReview: 0, reviews: 0 };
        const prevBest = cur.verifiedBestScore ?? 0;
        return {
          ...prev,
          [id]: {
            ...cur,
            level: Math.max(cur.level, 1),
            verified: true,
            verifiedAt: Date.now(),
            verifiedBestScore: Math.max(prevBest, score),
          },
        };
      });
    },
    [update],
  );

  const handleResetPhrase = useCallback(
    (id: number) => {
      update((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [update],
  );

  const handleReset = () => {
    if (window.confirm("Reset all progress?")) reset();
  };

  if (!loaded) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#faf5f0" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{IC.flag}</div>
          <div style={{ fontSize: 15, opacity: 0.5 }}>Loading...</div>
        </div>
      </div>
    );
  }

  const learnedCount = Object.values(progress).filter((p) => p.level > 0).length;

  return (
    <div style={{ minHeight: "100vh", background: "#faf5f0", color: "#2a1818" }}>
      <Header learnedCount={learnedCount} total={PHRASES.length} />
      <TabBar tab={tab} onChange={setTab} />
      <div style={{ padding: "16px 16px 100px" }}>
        {tab === "drill" && <DrillView play={play} playing={playing} />}
        {tab === "browse" && (
          <BrowseView
            progress={progress}
            onLearn={handleLearn}
            onVerified={handleVerified}
            onResetPhrase={handleResetPhrase}
            play={play}
            playing={playing}
          />
        )}
        {tab === "flash" && <FlashcardView progress={progress} onRate={handleRate} play={play} playing={playing} />}
        {tab === "quiz" && <QuizView onRate={handleRate} play={play} playing={playing} />}
        {tab === "speak" && <SpeakView onRate={handleRate} progress={progress} play={play} playing={playing} />}
        {tab === "stats" && <StatsView progress={progress} />}
        {tab === "tips" && <TipsView play={play} playing={playing} />}
      </div>
      {tab === "stats" && (
        <div className="safe-bottom" style={{ padding: "0 16px 32px", textAlign: "center" }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid rgba(220,38,38,0.2)",
              background: "transparent",
              color: "#dc2626",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reset Progress
          </button>
        </div>
      )}
    </div>
  );
}
