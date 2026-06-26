import { coverageItems, reviewItems, systemStatuses, trainingJobs } from "../data";
import type { HealthSnapshot, ViewKey } from "../types";
import { getStateClassName, StateBadge } from "../components/Badge";
import { SectionHeader } from "../components/SectionHeader";

type OperationsMetric = {
  label: string;
  value: string;
  detail: string;
  tone: "good" | "warn" | "neutral";
};

type ReviewTrendPoint = {
  label: string;
  reviews: number;
  critical: number;
};

type SeverityDistributionItem = {
  label: string;
  count: number;
  percent: number;
  tone: "danger" | "warn" | "neutral";
};

const operationsMetrics: OperationsMetric[] = [
  { label: "Recall baseline", value: "96.0%", detail: "Evaluation placeholder", tone: "good" },
  { label: "Precision baseline", value: "90.7%", detail: "Evaluation placeholder", tone: "good" },
  { label: "P99 latency", value: "1.08s", detail: "Serving mock sample", tone: "neutral" },
  { label: "Human review", value: "Required", detail: "Major gaps gated", tone: "warn" },
];

const reviewTrend: ReviewTrendPoint[] = [
  { label: "Mon", reviews: 48, critical: 18 },
  { label: "Tue", reviews: 64, critical: 24 },
  { label: "Wed", reviews: 52, critical: 16 },
  { label: "Thu", reviews: 78, critical: 32 },
  { label: "Fri", reviews: 58, critical: 22 },
];

const severityDistribution: SeverityDistributionItem[] = [
  { label: "Critical", count: 4, percent: 24, tone: "danger" },
  { label: "Major", count: 9, percent: 53, tone: "warn" },
  { label: "Moderate", count: 4, percent: 23, tone: "neutral" },
];

function JobSummaryList() {
  return (
    <div className="job-table compact">
      {trainingJobs.map((job) => (
        <div className="job-row" key={job.id}>
          <div>
            <div className="row-title">{job.title}</div>
            <div className="row-meta">
              {job.type} / {job.runtime}
            </div>
          </div>
          <StateBadge state={job.state} />
        </div>
      ))}
    </div>
  );
}

function OperationsMetricGrid() {
  return (
    <div className="operations-metric-grid">
      {operationsMetrics.map((metric) => (
        <article className={`operations-metric ${metric.tone}`} key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          <small>{metric.detail}</small>
        </article>
      ))}
    </div>
  );
}

function ReviewTrendChart() {
  return (
    <div className="trend-card" aria-label="Mock weekly review volume trend">
      <div className="trend-card-header">
        <span>Review volume trend</span>
        <strong>Mock weekly sample</strong>
      </div>
      <div className="trend-bars">
        {reviewTrend.map((point) => (
          <div className="trend-column" key={point.label}>
            <div className="trend-track" aria-label={`${point.label}: ${point.reviews} reviews, ${point.critical} critical`}>
              <span className="trend-fill" style={{ height: `${point.reviews}%` }} />
              <span className="trend-fill critical" style={{ height: `${point.critical}%` }} />
            </div>
            <span>{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeverityDistribution() {
  return (
    <div className="severity-list">
      {severityDistribution.map((item) => (
        <div className="severity-item" key={item.label}>
          <div className="severity-topline">
            <span>{item.label}</span>
            <strong>{item.count}</strong>
          </div>
          <div className="severity-track" aria-label={`${item.label}: ${item.percent} percent`}>
            <span className={`severity-fill ${item.tone}`} style={{ width: `${item.percent}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardPage({
  onNavigate,
  health,
}: {
  onNavigate: (view: ViewKey) => void;
  health: HealthSnapshot | null;
}) {
  const effectiveStatuses = systemStatuses.map((status) => {
    if (!health) {
      return status;
    }

    if (status.label === "Knowledge graph") {
      return {
        ...status,
        value: health.kgConnected ? "Connected" : "Unavailable",
        detail: health.kgConnected ? status.detail : "Waiting for Neo4j",
        tone: health.kgConnected ? "good" : "warn",
      };
    }

    if (status.label === "Retriever") {
      return {
        ...status,
        value: health.retrieverConfigured ? "Ready" : "Not configured",
        detail: health.retrieverConfigured ? status.detail : "Retriever disabled",
        tone: health.retrieverConfigured ? "good" : "warn",
      };
    }

    return status;
  });

  return (
    <section className="view-panel">
      <section className="status-band" aria-label="System status">
        {effectiveStatuses.map((status) => (
          <article className={`status-tile ${status.tone}`} key={status.label}>
            <span className="tile-kicker">{status.label}</span>
            <strong>{status.value}</strong>
            <span>{status.detail}</span>
          </article>
        ))}
      </section>

      <div className="dashboard-grid">
        <div className="dashboard-primary-column">
          <section className="panel-block priority-panel">
            <SectionHeader
              eyebrow="Analyst queue"
              title="Open compliance reviews"
              actions={
                <button className="secondary-button" type="button" onClick={() => onNavigate("application")}>
                  Review
                </button>
              }
            />
            <div className="review-table">
              {reviewItems.map((review) => (
                <article className="review-row" key={review.title}>
                  <div>
                    <div className="row-title">{review.title}</div>
                    <div className="row-meta">{review.framework}</div>
                  </div>
                  <div className="row-meta">{review.owner}</div>
                  <div className="row-meta">{review.severity}</div>
                  <span className={getStateClassName(review.state)}>{review.state}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="panel-block coverage-panel">
            <SectionHeader eyebrow="Framework coverage" title="Regulatory corpus" />
            <div className="coverage-list">
              {coverageItems.map((item) => (
                <div className="coverage-item" key={item.framework}>
                  <div className="coverage-topline">
                    <span>{item.framework}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="progress-track" aria-label={`${item.percent} percent coverage`}>
                    <div className="progress-fill" style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="dashboard-secondary-column">
          <section className="panel-block operations-panel">
            <SectionHeader
              eyebrow="Model operations"
              title="Planned monitoring baseline"
              actions={<span className="state-badge pending">Mock data</span>}
            />
            <OperationsMetricGrid />
            <ReviewTrendChart />
            <SeverityDistribution />
          </section>

          <section className="panel-block queue-panel">
            <SectionHeader
              eyebrow="Offline operations"
              title="Training queue"
              actions={
                <button className="secondary-button" type="button" onClick={() => onNavigate("training")}>
                  Open
                </button>
              }
            />
            <JobSummaryList />
          </section>
        </div>
      </div>
    </section>
  );
}
