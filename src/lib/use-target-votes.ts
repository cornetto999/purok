import { useState, useEffect } from "react";

export interface TargetVotesConfig {
  overall: number;
  barangays: Record<number, number>;
}

export function useTargetVotes() {
  const [targets, setTargets] = useState<TargetVotesConfig>(() => {
    try {
      const saved = localStorage.getItem("brms_target_votes");
      if (saved) return JSON.parse(saved);
    } catch {}
    return { overall: 0, barangays: {} };
  });

  useEffect(() => {
    localStorage.setItem("brms_target_votes", JSON.stringify(targets));
  }, [targets]);

  const updateOverall = (val: number) => setTargets((prev) => ({ ...prev, overall: val }));
  const updateBarangay = (id: number, val: number) =>
    setTargets((prev) => ({
      ...prev,
      barangays: { ...prev.barangays, [id]: val },
    }));

  return { targets, updateOverall, updateBarangay };
}
