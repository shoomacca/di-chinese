import { useCallback, useEffect, useState } from "react";
import type { ProgressMap } from "../types";

const STORAGE_KEY = "cn-learn-v1:progress";

function readFromStorage(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProgressMap;
  } catch {
    return {};
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProgress(readFromStorage());
    setLoaded(true);
  }, []);

  const update = useCallback((updater: (prev: ProgressMap) => ProgressMap) => {
    setProgress((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore quota errors — not fatal
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setProgress({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { progress, update, reset, loaded };
}
