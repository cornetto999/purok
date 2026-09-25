import { useState, useEffect } from "react";
import {
  readVoteTargets,
  validVoteTarget,
  type TargetVotesConfig,
} from "./target-votes";

const STORAGE_KEY = "brms_target_votes";

export function useTargetVotes() {
  const [targets, setTargets] = useState<TargetVotesConfig>({
    overall: 0,
    barangays: {},
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setTargets(readVoteTargets(localStorage.getItem(STORAGE_KEY)));
    } catch {
      /* Saving will report if browser storage is unavailable. */
    }
    setReady(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        setTargets(readVoteTargets(event.newValue));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const saveTargets = (next: TargetVotesConfig) => {
    if (
      !validVoteTarget(next.overall) ||
      !Object.values(next.barangays).every(validVoteTarget)
    ) {
      throw new Error("Targets must be whole numbers of zero or more.");
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      throw new Error(
        "Could not save targets. Allow browser storage and try again.",
      );
    }
    setTargets(next);
  };

  return { targets, ready, saveTargets };
}
