import { useCallback, useEffect, useRef, useState } from "react";

type PlayingKey = string | null;

/** Plays pre-generated mp3s from /audio/{id}.mp3 and /audio/{id}-slow.mp3.
 *  A single <audio> element is reused so switching phrases cancels the prior one. */
export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<PlayingKey>(null);

  useEffect(() => {
    const el = new Audio();
    el.preload = "auto";
    el.addEventListener("ended", () => setPlaying(null));
    el.addEventListener("error", () => setPlaying(null));
    audioRef.current = el;
    return () => {
      el.pause();
      el.src = "";
      audioRef.current = null;
    };
  }, []);

  const play = useCallback((id: number, slow: boolean) => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    const src = `${import.meta.env.BASE_URL}audio/${id}${slow ? "-slow" : ""}.mp3`;
    el.src = src;
    const key = `${id}${slow ? "-slow" : ""}`;
    setPlaying(key);
    el.currentTime = 0;
    el.play().catch(() => setPlaying(null));
  }, []);

  const stop = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setPlaying(null);
  }, []);

  return { play, stop, playing };
}
