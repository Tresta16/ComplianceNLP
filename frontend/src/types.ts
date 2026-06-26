import type { LucideIcon } from "lucide-react";

export type ViewKey = "dashboard" | "application" | "training" | "outputs";

export type StatusTone = "good" | "warn" | "danger" | "neutral";

export type JobState = "running" | "complete" | "pending" | "failed";

export type NavigationItem = {
  key: ViewKey;
  label: string;
  icon: LucideIcon;
};

export type SystemStatus = {
  label: string;
  value: string;
  detail: string;
  tone: StatusTone;
};

export type ReviewItem = {
  title: string;
  framework: string;
  owner: string;
  severity: string;
  state: JobState;
};

export type CoverageItem = {
  framework: string;
  count: string;
  percent: number;
};

export type TrainingJob = {
  id: string;
  title: string;
  type: string;
  state: JobState;
  progress: number;
  runtime: string;
  output: string;
  command: string;
  logs: string[];
};

export type Artifact = {
  title: string;
  type: string;
  path: string;
  size: string;
};

export type HealthSnapshot = {
  status: string;
  kgConnected: boolean;
  retrieverConfigured: boolean;
  extractionModelLoaded: boolean;
  gapModelLoaded: boolean;
};

export type RegulatoryFramework = "SEC" | "MiFID II" | "Basel III" | "auto";

export type ExtractionRequestPayload = {
  text: string;
  framework: RegulatoryFramework;
};

export type ExtractionApiResponse = {
  obligations: Record<string, unknown>[];
  entities: Record<string, unknown>[];
  deontic_modality: string;
  cross_references: string[];
  confidence: number;
  latency_ms: number;
};

export type GapAnalysisRequestPayload = {
  obligationText: string;
  policyText: string;
  policySection: string;
};

export type GapAnalysisApiResponse = {
  classification: string;
  severity: string;
  alignment_score: number;
  gap_description: string;
  recommended_action: string;
  grounding_confidence: number;
  latency_ms: number;
};
