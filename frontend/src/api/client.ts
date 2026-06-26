import type {
  ExtractionApiResponse,
  ExtractionRequestPayload,
  GapAnalysisApiResponse,
  GapAnalysisRequestPayload,
  HealthSnapshot,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const JSON_CONTENT_TYPE = "application/json";

type HealthResponse = {
  status: string;
  extraction_model_loaded?: boolean;
  gap_model_loaded?: boolean;
  kg_connected?: boolean;
  retriever_configured?: boolean;
};

class ApiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiRequestError";
  }
}

async function fetchJson<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);

  if (!response.ok) {
    const detail = await response.text();
    throw new ApiRequestError(detail || `Request failed with HTTP ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

export async function fetchHealthSnapshot(): Promise<HealthSnapshot | null> {
  try {
    const payload = await fetchJson<HealthResponse>("/health");

    return {
      status: payload.status,
      kgConnected: Boolean(payload.kg_connected),
      retrieverConfigured: Boolean(payload.retriever_configured),
      extractionModelLoaded: Boolean(payload.extraction_model_loaded),
      gapModelLoaded: Boolean(payload.gap_model_loaded),
    };
  } catch {
    return null;
  }
}

export async function runExtraction(payload: ExtractionRequestPayload): Promise<ExtractionApiResponse> {
  return fetchJson<ExtractionApiResponse>("/extract", {
    method: "POST",
    headers: {
      "Content-Type": JSON_CONTENT_TYPE,
    },
    body: JSON.stringify(payload),
  });
}

export async function runGapAnalysis(payload: GapAnalysisRequestPayload): Promise<GapAnalysisApiResponse> {
  return fetchJson<GapAnalysisApiResponse>("/analyze_gap", {
    method: "POST",
    headers: {
      "Content-Type": JSON_CONTENT_TYPE,
    },
    body: JSON.stringify({
      obligation_text: payload.obligationText,
      policy_text: payload.policyText,
      policy_section: payload.policySection,
      context_passages: [],
    }),
  });
}
