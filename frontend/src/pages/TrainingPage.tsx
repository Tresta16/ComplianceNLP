import { useMemo, useState } from "react";

import { artifacts, trainingJobs } from "../data";
import { StateBadge } from "../components/Badge";
import { SectionHeader } from "../components/SectionHeader";
import type { JobState, TrainingJob } from "../types";

const TRAINING_ARTIFACT_TYPES = new Set(["Checkpoint", "Report", "Graph"]);

const jobStateNotes: Record<JobState, string> = {
  running: "Prototype status only. No browser action is streaming or mutating this job.",
  complete: "Artifact is shown as staged output, not as a verified deployment artifact.",
  pending: "Waiting state is illustrative. No real queue persistence exists in this frontend.",
  failed: "Failure reason is copied from mock logs so operators can review the intended error path.",
};

function getFailureReason(job: TrainingJob): string {
  if (job.state !== "failed") {
    return jobStateNotes[job.state];
  }

  return job.logs.find((line) => line.toLowerCase().includes("missing")) ?? jobStateNotes.failed;
}

function JobMetaStrip({ job }: { job: TrainingJob }) {
  return (
    <div className="job-meta-grid">
      <div className="meta-tile">
        <span>Runtime</span>
        <strong>{job.runtime}</strong>
      </div>
      <div className="meta-tile">
        <span>Progress</span>
        <strong>{job.progress}%</strong>
      </div>
      <div className="meta-tile">
        <span>Output</span>
        <strong>{job.output}</strong>
      </div>
    </div>
  );
}

function PrototypeControlPanel({ job }: { job: TrainingJob }) {
  return (
    <div className="prototype-control-panel">
      <div>
        <span className="block-label">Execution guard</span>
        <strong>Launch controls disabled</strong>
        <p>No browser button is wired to Docker, shell commands, queues, or background workers.</p>
      </div>
      <button className="primary-button" type="button" disabled title="Prototype only: execution is intentionally disabled">
        Launch disabled
      </button>
      <pre className="command-preview">{job.command}</pre>
    </div>
  );
}

export function TrainingPage() {
  const [selectedJobId, setSelectedJobId] = useState(trainingJobs[0].id);
  const selectedJob = useMemo(
    () => trainingJobs.find((job) => job.id === selectedJobId) ?? trainingJobs[0],
    [selectedJobId],
  );
  const stagedArtifacts = useMemo(
    () => artifacts.filter((artifact) => TRAINING_ARTIFACT_TYPES.has(artifact.type)),
    [],
  );

  return (
    <section className="view-panel">
      <div className="prototype-banner training-prototype-banner">
        <div>
          <p className="eyebrow">Training layer prototype</p>
          <strong>Offline job execution is intentionally disabled.</strong>
          <span>This page explains the target operator flow; it does not start Docker, Celery, Kubernetes, or shell jobs.</span>
        </div>
        <span className="state-badge pending">Prototype only</span>
      </div>

      <div className="training-grid">
        <section className="panel-block pipeline-panel">
          <SectionHeader eyebrow="Offline pipeline" title="Job queue" actions={<span className="state-badge pending">Selection only</span>} />
          <div className="pipeline-list">
            {trainingJobs.map((job) => (
              <button
                className={`pipeline-item ${job.id === selectedJob.id ? "is-selected" : ""}`}
                key={job.id}
                type="button"
                onClick={() => setSelectedJobId(job.id)}
              >
                <div className="pipeline-topline">
                  <div>
                    <div className="pipeline-title">{job.title}</div>
                    <div className="pipeline-meta">
                      {job.type} / {job.runtime}
                    </div>
                  </div>
                  <StateBadge state={job.state} />
                </div>
                <div className="pipeline-meta">{getFailureReason(job)}</div>
                <div className="progress-track" aria-label={`${job.progress} percent complete`}>
                  <div className="progress-fill" style={{ width: `${job.progress}%` }} />
                </div>
                <div className="pipeline-output">{job.output}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="panel-block job-detail-panel">
          <SectionHeader
            eyebrow="Job detail"
            title={selectedJob.title}
            actions={<StateBadge state={selectedJob.state} />}
          />
          <JobMetaStrip job={selectedJob} />
          <div className={`job-state-note ${selectedJob.state}`}>
            <strong>{selectedJob.state === "failed" ? "Failure reason" : "State note"}</strong>
            <span>{getFailureReason(selectedJob)}</span>
          </div>
          <PrototypeControlPanel job={selectedJob} />
          <pre className="log-output">
            {[
              "prototype log preview",
              "execution: disabled in browser",
              "",
              ...selectedJob.logs.map((line, index) => `[${String(index + 1).padStart(2, "0")}] ${line}`),
            ].join("\n")}
          </pre>
        </section>

        <section className="panel-block runbook-panel">
          <SectionHeader eyebrow="Runbook" title="Operator sequence" />
          <ol className="runbook-list">
            <li><span>01</span> Ingest regulatory documents into Neo4j.</li>
            <li><span>02</span> Train extraction model and validate NER F1.</li>
            <li><span>03</span> Distill gap model and stage artifact.</li>
            <li><span>04</span> Run evaluation before serving rollout.</li>
          </ol>
        </section>

        <section className="panel-block training-artifacts-panel">
          <SectionHeader eyebrow="Artifact staging" title="Expected outputs" actions={<span className="state-badge pending">Local paths</span>} />
          <div className="artifact-row-list">
            {stagedArtifacts.map((artifact) => (
              <article className="artifact-row" key={artifact.path}>
                <div>
                  <span className="artifact-type">{artifact.type}</span>
                  <div className="artifact-title">{artifact.title}</div>
                  <div className="artifact-path">{artifact.path}</div>
                </div>
                <strong>{artifact.size}</strong>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
