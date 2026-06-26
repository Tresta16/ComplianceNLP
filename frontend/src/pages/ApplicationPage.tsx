import { useState } from "react";

import { runExtraction, runGapAnalysis } from "../api/client";
import { SectionHeader } from "../components/SectionHeader";
import { formatLatency, formatScore, getErrorMessage } from "../components/shared";
import type {
  ExtractionApiResponse,
  GapAnalysisApiResponse,
  RegulatoryFramework,
} from "../types";

const DEFAULT_SOURCE_TEXT =
  "Investment firms must obtain information regarding client knowledge, experience, financial situation, and investment objectives before providing investment advice.";
const DEFAULT_OBLIGATION_TEXT =
  "Entity: Investment firm\nAction: Obtain client knowledge, experience, financial situation, and investment objectives\nModality: Obligation";
const DEFAULT_POLICY_TEXT =
  "Section 4.3 Client Onboarding requires collection of financial situation and investment objectives at account opening.";
const DEFAULT_POLICY_SECTION = "Section 4.3 Client Onboarding";
const FRAMEWORK_OPTIONS: RegulatoryFramework[] = ["SEC", "MiFID II", "Basel III", "auto"];
const EXTRACT_ENDPOINT = "POST /extract";
const GAP_ENDPOINT = "POST /analyze_gap";

type WorkflowStatus = "Idle" | "Running" | "Received" | "Failed";

function EndpointDiagnostic({
  endpoint,
  status,
  responseMode,
  latencyMs,
}: {
  endpoint: string;
  status: WorkflowStatus;
  responseMode: string;
  latencyMs?: number;
}) {
  return (
    <dl className="diagnostic-strip" aria-label={`${endpoint} diagnostics`}>
      <div>
        <dt>Endpoint</dt>
        <dd>{endpoint}</dd>
      </div>
      <div>
        <dt>Status</dt>
        <dd>{status}</dd>
      </div>
      <div>
        <dt>Response mode</dt>
        <dd>{responseMode}</dd>
      </div>
      <div>
        <dt>Latency</dt>
        <dd>{latencyMs === undefined ? "Waiting" : formatLatency(latencyMs)}</dd>
      </div>
    </dl>
  );
}

function InlineApiError({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <div className="api-message error inline-api-error" role="alert">
      <strong>API request failed</strong>
      <span>{message}</span>
    </div>
  );
}

function ResultCountCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="result-count-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function JsonPreviewList({ title, items }: { title: string; items: Record<string, unknown>[] }) {
  return (
    <div className="json-preview-group">
      <div className="json-preview-header">
        <span>{title}</span>
        <strong>{items.length}</strong>
      </div>
      {items.length > 0 ? (
        <div className="json-preview-list">
          {items.slice(0, 3).map((item, index) => (
            <pre className="json-preview" key={`${title}-${index}`}>
              {JSON.stringify(item, null, 2)}
            </pre>
          ))}
        </div>
      ) : (
        <div className="empty-state compact-empty-state">
          <strong>No {title.toLowerCase()} returned</strong>
          <span>This is expected while the serving backend is returning placeholder payloads.</span>
        </div>
      )}
    </div>
  );
}

export function ApplicationPage() {
  const [sourceText, setSourceText] = useState(DEFAULT_SOURCE_TEXT);
  const [selectedFramework, setSelectedFramework] = useState<RegulatoryFramework>("MiFID II");
  const [obligationText, setObligationText] = useState(DEFAULT_OBLIGATION_TEXT);
  const [policyText, setPolicyText] = useState(DEFAULT_POLICY_TEXT);
  const [extractionResult, setExtractionResult] = useState<ExtractionApiResponse | null>(null);
  const [gapResult, setGapResult] = useState<GapAnalysisApiResponse | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [gapError, setGapError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function handleRunExtraction() {
    setIsExtracting(true);
    setExtractionError(null);

    try {
      const result = await runExtraction({
        text: sourceText,
        framework: selectedFramework,
      });
      setExtractionResult(result);
    } catch (error) {
      setExtractionError(getErrorMessage(error));
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleAnalyzeGap() {
    setIsAnalyzing(true);
    setGapError(null);

    try {
      const result = await runGapAnalysis({
        obligationText,
        policyText,
        policySection: DEFAULT_POLICY_SECTION,
      });
      setGapResult(result);
    } catch (error) {
      setGapError(getErrorMessage(error));
    } finally {
      setIsAnalyzing(false);
    }
  }

  const hasEmptyExtraction =
    extractionResult !== null &&
    extractionResult.obligations.length === 0 &&
    extractionResult.entities.length === 0;

  const extractionStatus: WorkflowStatus = isExtracting
    ? "Running"
    : extractionError
      ? "Failed"
      : extractionResult
        ? "Received"
        : "Idle";
  const gapStatus: WorkflowStatus = isAnalyzing ? "Running" : gapError ? "Failed" : gapResult ? "Received" : "Idle";
  const extractionResponseMode = hasEmptyExtraction
    ? "Placeholder response"
    : extractionResult
      ? "Structured response"
      : "Waiting";
  const gapResponseMode = gapResult ? "Placeholder-compatible response" : "Waiting";

  return (
    <section className="view-panel">
      <div className="application-grid">
        <section className="panel-block workbench-panel">
          <SectionHeader
            eyebrow="Extraction workbench"
            title="Regulatory source text"
            actions={
              <button className="primary-button" type="button" disabled={isExtracting} onClick={handleRunExtraction}>
                {isExtracting ? "Running..." : "Run extraction"}
              </button>
            }
          />
          <label className="field-label" htmlFor="regulatory-source-text">
            Source text
          </label>
          <textarea
            className="text-input"
            id="regulatory-source-text"
            value={sourceText}
            onChange={(event) => setSourceText(event.target.value)}
          />
          <div className="control-row">
            <div className="segmented-row" aria-label="Framework selector">
              {FRAMEWORK_OPTIONS.map((framework) => (
                <button
                  className={`segment ${selectedFramework === framework ? "is-selected" : ""}`}
                  key={framework}
                  type="button"
                  onClick={() => setSelectedFramework(framework)}
                >
                  {framework === "auto" ? "Auto" : framework}
                </button>
              ))}
            </div>
            <span className="inline-note">{EXTRACT_ENDPOINT}</span>
          </div>
          <InlineApiError message={extractionError} />
        </section>

        <section className="panel-block result-panel">
          <SectionHeader
            eyebrow="Structured obligation"
            title="Extraction result"
            actions={
              <span className={extractionResult ? "confidence-pill" : "state-badge pending"}>
                {extractionResult ? `${formatScore(extractionResult.confidence)} response confidence` : "Waiting"}
              </span>
            }
          />
          {extractionResult ? (
            <div className="result-stack">
              <div className="placeholder-callout">
                <strong>{hasEmptyExtraction ? "Placeholder response" : "API response received"}</strong>
                <span>
                  {hasEmptyExtraction
                    ? "No obligations or entities were returned, so this should not be read as extraction quality."
                    : "Structured payload is displayed for analyst review and future richer extraction output."}
                </span>
              </div>
              <div className="result-count-grid">
                <ResultCountCard label="Obligations" value={extractionResult.obligations.length} />
                <ResultCountCard label="Entities" value={extractionResult.entities.length} />
                <ResultCountCard label="Modality" value={extractionResult.deontic_modality || "N/A"} />
              </div>
              <JsonPreviewList title="Obligations" items={extractionResult.obligations} />
              <JsonPreviewList title="Entities" items={extractionResult.entities} />
            </div>
          ) : (
            <div className="empty-state">
              <strong>No extraction response yet</strong>
              <span>Run the request to verify the frontend can reach the FastAPI serving endpoint.</span>
            </div>
          )}
        </section>

        <section className="panel-block gap-panel">
          <SectionHeader
            eyebrow="Gap analysis"
            title="Policy comparison"
            actions={
              <button className="primary-button" type="button" disabled={isAnalyzing} onClick={handleAnalyzeGap}>
                {isAnalyzing ? "Analyzing..." : "Analyze gap"}
              </button>
            }
          />
          <div className="comparison-grid">
            <div>
              <label className="field-label" htmlFor="obligation-summary">
                Obligation
              </label>
              <textarea
                className="small-text-input"
                id="obligation-summary"
                value={obligationText}
                onChange={(event) => setObligationText(event.target.value)}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="policy-summary">
                Internal policy
              </label>
              <textarea
                className="small-text-input"
                id="policy-summary"
                value={policyText}
                onChange={(event) => setPolicyText(event.target.value)}
              />
            </div>
          </div>
          <InlineApiError message={gapError} />
        </section>

        <section className="panel-block finding-panel">
          <SectionHeader
            eyebrow="Finding preview"
            title={gapResult ? gapResult.classification : "No result yet"}
            actions={<span className="state-badge pending">{gapResult ? gapResult.severity : "Waiting"}</span>}
          />
          {gapResult ? (
            <div className="result-stack">
              <div className="placeholder-callout">
                <strong>Review required</strong>
                <span>Alignment and confidence are response fields, not validated model-quality metrics.</span>
              </div>
              <p className="finding-copy">
                {gapResult.gap_description || "The current backend placeholder returned an empty gap description."}
              </p>
              <div className="result-count-grid">
                <ResultCountCard label="Alignment" value={formatScore(gapResult.alignment_score)} />
                <ResultCountCard label="Grounding" value={formatScore(gapResult.grounding_confidence)} />
                <ResultCountCard label="Latency" value={formatLatency(gapResult.latency_ms)} />
              </div>
              <div className="recommendation-box">
                <span>Recommended action</span>
                <strong>{gapResult.recommended_action || "No recommended action returned by the placeholder service."}</strong>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <strong>No gap response yet</strong>
              <span>Submit the comparison to verify POST /analyze_gap through the frontend.</span>
            </div>
          )}
        </section>
      </div>

      <section className="panel-block diagnostics-panel">
        <SectionHeader eyebrow="Request diagnostics" title="Serving API checks" />
        <div className="diagnostics-grid">
          <EndpointDiagnostic
            endpoint={EXTRACT_ENDPOINT}
            status={extractionStatus}
            responseMode={extractionResponseMode}
            latencyMs={extractionResult?.latency_ms}
          />
          <EndpointDiagnostic
            endpoint={GAP_ENDPOINT}
            status={gapStatus}
            responseMode={gapResponseMode}
            latencyMs={gapResult?.latency_ms}
          />
        </div>
      </section>
    </section>
  );
}
