export function formatLatency(latencyMs: number): string {
  return `${latencyMs.toFixed(2)} ms`;
}

export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown API error";
}

