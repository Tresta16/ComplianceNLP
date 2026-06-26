import type { JobState } from "../types";

export function getStateClassName(state: JobState): string {
  return `state-badge ${state}`;
}

export function StateBadge({ state }: { state: JobState }) {
  return <span className={getStateClassName(state)}>{state}</span>;
}

