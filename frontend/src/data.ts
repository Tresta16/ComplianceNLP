import { Activity, Archive, BarChart3, BrainCircuit, ClipboardList, Database, FileText, GitBranch, LayoutDashboard, Server, ShieldCheck, Wrench } from "lucide-react";

import type { Artifact, CoverageItem, NavigationItem, ReviewItem, SystemStatus, TrainingJob } from "./types";

export const navigationItems: NavigationItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "application", label: "Application", icon: ClipboardList },
  { key: "training", label: "Training", icon: BrainCircuit },
  { key: "outputs", label: "Outputs", icon: Archive },
];

export const systemStatuses: SystemStatus[] = [
  {
    label: "Knowledge graph",
    value: "Connected",
    detail: "12,847 provisions indexed",
    tone: "good",
  },
  {
    label: "Retriever",
    value: "Ready",
    detail: "Dense + BM25 configured",
    tone: "good",
  },
  {
    label: "Extraction model",
    value: "Pending",
    detail: "Waiting for checkpoint path",
    tone: "warn",
  },
  {
    label: "Gap model",
    value: "Pending",
    detail: "Medusa artifact not loaded",
    tone: "warn",
  },
];

export const reviewItems: ReviewItem[] = [
  {
    title: "MiFID II suitability review",
    framework: "MiFID II",
    owner: "Analyst A",
    severity: "Major",
    state: "pending",
  },
  {
    title: "Basel III liquidity coverage",
    framework: "Basel III",
    owner: "Analyst B",
    severity: "Critical",
    state: "failed",
  },
  {
    title: "SEC quarterly disclosure",
    framework: "SEC",
    owner: "Analyst C",
    severity: "N/A",
    state: "complete",
  },
  {
    title: "Cross-border transaction reporting",
    framework: "MiFID II",
    owner: "Analyst A",
    severity: "Moderate",
    state: "running",
  },
];

export const coverageItems: CoverageItem[] = [
  { framework: "SEC", count: "4,932 provisions", percent: 86 },
  { framework: "MiFID II", count: "4,218 provisions", percent: 78 },
  { framework: "Basel III", count: "3,697 provisions", percent: 72 },
];

export const trainingJobs: TrainingJob[] = [
  {
    id: "job-extraction",
    title: "Extraction trainer",
    type: "LEGAL-BERT",
    state: "running",
    progress: 68,
    runtime: "42 min",
    output: "outputs/extraction_model",
    command: "docker compose --profile train-extraction run extraction-trainer",
    logs: [
      "Loaded RegObligation train split",
      "Epoch 4/10 loss=0.1847",
      "Validation NER F1=0.9021",
      "Checkpoint staged at outputs/extraction_model/best_model",
    ],
  },
  {
    id: "job-kg",
    title: "Knowledge graph ingestion",
    type: "Neo4j",
    state: "complete",
    progress: 100,
    runtime: "18 min",
    output: "outputs/knowledge_graph",
    command: "docker compose --profile ingestion run kg-builder",
    logs: [
      "Parsed SEC XML directory",
      "Parsed EUR-Lex HTML directory",
      "Parsed BIS PDF directory",
      "Created 12,847 provision nodes",
    ],
  },
  {
    id: "job-gap",
    title: "Gap model distillation",
    type: "LLaMA",
    state: "pending",
    progress: 0,
    runtime: "Queued",
    output: "outputs/distilled_model",
    command: "docker compose --profile train-gap run gap-trainer",
    logs: [
      "Waiting for GPU slot",
      "Teacher model: Meta-Llama-3-70B-Instruct",
      "Student model: Meta-Llama-3-8B-Instruct",
    ],
  },
  {
    id: "job-eval",
    title: "Evaluation suite",
    type: "Metrics",
    state: "failed",
    progress: 36,
    runtime: "7 min",
    output: "outputs/evaluation",
    command: "docker compose --profile evaluation run evaluator",
    logs: [
      "Started evaluation seeds: 42, 123, 456",
      "Missing gapbench_test.json",
      "Evaluation stopped before gap_detection_f1",
    ],
  },
];

export const artifacts: Artifact[] = [
  {
    title: "Extraction best model",
    type: "Checkpoint",
    path: "outputs/extraction_model/best_model",
    size: "418 MB",
  },
  {
    title: "Distilled gap model",
    type: "Checkpoint",
    path: "outputs/distilled_model",
    size: "15.8 GB",
  },
  {
    title: "Medusa model",
    type: "Checkpoint",
    path: "outputs/medusa_model",
    size: "16.2 GB",
  },
  {
    title: "Evaluation results",
    type: "Report",
    path: "outputs/evaluation/evaluation_results.json",
    size: "28 KB",
  },
  {
    title: "Knowledge graph export",
    type: "Graph",
    path: "outputs/knowledge_graph",
    size: "1.1 GB",
  },
  {
    title: "Sample gap report",
    type: "Report",
    path: "examples/sample_output.json",
    size: "4 KB",
  },
];

export const capabilityCards = [
  { label: "Framework coverage", value: "48%", detail: "Annual update coverage", icon: GitBranch },
  { label: "Production recall", value: "96%", detail: "Parallel-run estimate", icon: ShieldCheck },
  { label: "P99 latency", value: "1.08s", detail: "Generator endpoint", icon: Activity },
  { label: "Human review", value: "On", detail: "Required for major gaps", icon: FileText },
];

export const platformCards = [
  { label: "API serving", value: "FastAPI", detail: "Port 8080", icon: Server },
  { label: "Graph store", value: "Neo4j", detail: "bolt://neo4j:7687", icon: Database },
  { label: "Metrics", value: "Prometheus", detail: "/metrics", icon: BarChart3 },
  { label: "Ops mode", value: "Prototype", detail: "No real training execution", icon: Wrench },
];
