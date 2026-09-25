export interface TargetVotesConfig {
  overall: number;
  barangays: Record<number, number>;
}

export function validVoteTarget(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

export function parseVoteTarget(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const number = Number(trimmed);
  if (!/^\d+$/.test(trimmed) || !validVoteTarget(number)) {
    throw new Error("Targets must be whole numbers of zero or more.");
  }
  return number;
}

export function readVoteTargets(saved: string | null): TargetVotesConfig {
  const defaults: TargetVotesConfig = { overall: 0, barangays: {} };
  if (!saved) return defaults;
  try {
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return defaults;
    const barangays: Record<number, number> = {};
    if (
      parsed.barangays &&
      typeof parsed.barangays === "object" &&
      !Array.isArray(parsed.barangays)
    ) {
      for (const [id, value] of Object.entries(parsed.barangays)) {
        if (/^\d+$/.test(id) && validVoteTarget(value))
          barangays[Number(id)] = value;
      }
    }
    return {
      overall: validVoteTarget(parsed.overall) ? parsed.overall : 0,
      barangays,
    };
  } catch {
    return defaults;
  }
}
