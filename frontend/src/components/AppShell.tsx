import type { ReactNode } from "react";
import { RefreshCcw } from "lucide-react";

import { navigationItems } from "../data";
import type { HealthSnapshot, ViewKey } from "../types";
import { PlatformStrip } from "./PlatformStrip";

const viewCopy: Record<ViewKey, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Operational view of compliance review, serving health, and offline jobs.",
  },
  application: {
    title: "Application",
    subtitle: "Analyst workbench for extraction, policy comparison, and gap review.",
  },
  training: {
    title: "Training",
    subtitle: "Prototype operator surface for offline model and graph workflows.",
  },
  outputs: {
    title: "Outputs",
    subtitle: "Model checkpoints, graph exports, evaluation files, and reports.",
  },
};

function Sidebar({
  activeView,
  onNavigate,
  health,
}: {
  activeView: ViewKey;
  onNavigate: (view: ViewKey) => void;
  health: HealthSnapshot | null;
}) {
  const apiLabel = health?.status === "healthy" ? "API healthy" : "Prototype mode";
  const apiDetail = health ? "FastAPI /health connected" : "Using local mock data";

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="brand-block">
        <div className="brand-mark">CN</div>
        <div>
          <div className="brand-name">ComplianceNLP</div>
          <div className="prototype-label">Unified workspace</div>
        </div>
      </div>

      <nav className="nav-list">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={`nav-item ${activeView === item.key ? "is-active" : ""}`}
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
            >
              <span className="nav-icon">
                <Icon size={17} strokeWidth={2.2} />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="environment-block">
        <span className="block-label">Environment</span>
        <strong>Server compose</strong>
        <span>API + Neo4j + frontend</span>
      </div>

      <div className="sidebar-status">
        <div className={`status-dot ${health ? "status-good" : "status-warn"}`} />
        <div>
          <div className="sidebar-status-title">{apiLabel}</div>
          <div className="sidebar-status-text">{apiDetail}</div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({
  activeView,
  onNavigate,
  onRefresh,
}: {
  activeView: ViewKey;
  onNavigate: (view: ViewKey) => void;
  onRefresh: () => void;
}) {
  const copy = viewCopy[activeView];

  return (
    <header className="topbar">
      <div className="title-block">
        <p className="eyebrow">Unified compliance workspace</p>
        <h1>{copy.title}</h1>
        <p className="view-subtitle">{copy.subtitle}</p>
      </div>
      <div className="topbar-actions">
        <button className="icon-button" type="button" aria-label="Refresh data" title="Refresh data" onClick={onRefresh}>
          <RefreshCcw size={17} />
        </button>
        <button className="secondary-button" type="button" onClick={() => onNavigate("training")}>
          Training
        </button>
        <button className="primary-button" type="button" onClick={() => onNavigate("application")}>
          New Analysis
        </button>
      </div>
    </header>
  );
}

export function AppShell({
  activeView,
  health,
  onNavigate,
  onRefresh,
  children,
}: {
  activeView: ViewKey;
  health: HealthSnapshot | null;
  onNavigate: (view: ViewKey) => void;
  onRefresh: () => void;
  children: ReactNode;
}) {
  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} health={health} onNavigate={onNavigate} />

      <main className="main-pane">
        <Topbar activeView={activeView} onNavigate={onNavigate} onRefresh={onRefresh} />
        <PlatformStrip />
        {children}
      </main>
    </div>
  );
}

