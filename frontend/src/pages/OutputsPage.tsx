import { useMemo, useState } from "react";

import { artifacts } from "../data";
import { SectionHeader } from "../components/SectionHeader";
import type { Artifact } from "../types";

const ALL_ARTIFACT_TYPES = "All";
type ArtifactTypeFilter = typeof ALL_ARTIFACT_TYPES | string;

function ArtifactSummaryStrip({ filteredArtifacts }: { filteredArtifacts: Artifact[] }) {
  const totalSizeLabel = `${filteredArtifacts.length} listed`;

  return (
    <section className="output-summary-grid" aria-label="Artifact inventory summary">
      <div className="meta-tile">
        <span>Inventory</span>
        <strong>{totalSizeLabel}</strong>
      </div>
      <div className="meta-tile">
        <span>Primary location</span>
        <strong>outputs/</strong>
      </div>
      <div className="meta-tile">
        <span>Availability</span>
        <strong>Local paths only</strong>
      </div>
    </section>
  );
}

function ArtifactTypeFilters({
  artifactTypes,
  selectedType,
  onSelectType,
}: {
  artifactTypes: string[];
  selectedType: ArtifactTypeFilter;
  onSelectType: (type: ArtifactTypeFilter) => void;
}) {
  return (
    <div className="filter-row output-filter-row" aria-label="Artifact type filters">
      {[ALL_ARTIFACT_TYPES, ...artifactTypes].map((type) => (
        <button
          className={`segment ${selectedType === type ? "is-selected" : ""}`}
          key={type}
          type="button"
          onClick={() => onSelectType(type)}
        >
          {type}
        </button>
      ))}
    </div>
  );
}

function ArtifactRows({
  filteredArtifacts,
  selectedArtifact,
  onSelectArtifact,
}: {
  filteredArtifacts: Artifact[];
  selectedArtifact: Artifact | null;
  onSelectArtifact: (artifact: Artifact) => void;
}) {
  if (filteredArtifacts.length === 0) {
    return (
      <div className="empty-state">
        <strong>No artifacts match this filter</strong>
        <span>Choose a different artifact type or confirm the local outputs directory has been staged.</span>
      </div>
    );
  }

  return (
    <div className="output-artifact-list" role="list">
      {filteredArtifacts.map((artifact) => (
        <button
          className={`output-artifact-row ${selectedArtifact?.path === artifact.path ? "is-selected" : ""}`}
          key={artifact.path}
          type="button"
          onClick={() => onSelectArtifact(artifact)}
        >
          <div className="output-artifact-main">
            <span className="artifact-type">{artifact.type}</span>
            <strong>{artifact.title}</strong>
            <code>{artifact.path}</code>
          </div>
          <span>{artifact.size}</span>
          <span className="state-badge pending">Path only</span>
        </button>
      ))}
    </div>
  );
}

function ArtifactDetailPanel({ artifact }: { artifact: Artifact | null }) {
  if (!artifact) {
    return (
      <section className="panel-block output-detail-panel">
        <SectionHeader eyebrow="Artifact detail" title="No artifact selected" />
        <div className="empty-state">
          <strong>Select an artifact</strong>
          <span>Artifact metadata appears here without downloading or streaming large files through the browser.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="panel-block output-detail-panel">
      <SectionHeader
        eyebrow="Artifact detail"
        title={artifact.title}
        actions={<span className="artifact-type">{artifact.type}</span>}
      />
      <dl className="detail-list compact-detail-list">
        <div>
          <dt>Type</dt>
          <dd>{artifact.type}</dd>
        </div>
        <div>
          <dt>Size</dt>
          <dd>{artifact.size}</dd>
        </div>
        <div>
          <dt>Path</dt>
          <dd>
            <code className="artifact-detail-path">{artifact.path}</code>
          </dd>
        </div>
      </dl>
      <div className="placeholder-callout">
        <strong>Browser download is not implemented</strong>
        <span>Use the exact local path above from the deployment host or artifact volume.</span>
      </div>
    </section>
  );
}

export function OutputsPage() {
  const artifactTypes = useMemo(
    () => Array.from(new Set(artifacts.map((artifact) => artifact.type))).sort(),
    [],
  );
  const [selectedType, setSelectedType] = useState<ArtifactTypeFilter>(ALL_ARTIFACT_TYPES);
  const filteredArtifacts = useMemo(
    () =>
      selectedType === ALL_ARTIFACT_TYPES
        ? artifacts
        : artifacts.filter((artifact) => artifact.type === selectedType),
    [selectedType],
  );
  const [selectedArtifactPath, setSelectedArtifactPath] = useState(artifacts[0]?.path ?? "");
  const selectedArtifact =
    filteredArtifacts.find((artifact) => artifact.path === selectedArtifactPath) ?? filteredArtifacts[0] ?? null;

  return (
    <section className="view-panel">
      <SectionHeader
        eyebrow="Outputs"
        title="Artifact browser"
        actions={
          <ArtifactTypeFilters
            artifactTypes={artifactTypes}
            selectedType={selectedType}
            onSelectType={(type) => {
              setSelectedType(type);
              const nextArtifact = type === ALL_ARTIFACT_TYPES ? artifacts[0] : artifacts.find((artifact) => artifact.type === type);
              setSelectedArtifactPath(nextArtifact?.path ?? "");
            }}
          />
        }
      />

      <ArtifactSummaryStrip filteredArtifacts={filteredArtifacts} />

      <div className="outputs-browser-grid">
        <section className="panel-block outputs-list-panel">
          <SectionHeader
            eyebrow="Artifact inventory"
            title={`${filteredArtifacts.length} artifacts`}
            actions={<span className="state-badge pending">No download action</span>}
          />
          <ArtifactRows
            filteredArtifacts={filteredArtifacts}
            selectedArtifact={selectedArtifact}
            onSelectArtifact={(artifact) => setSelectedArtifactPath(artifact.path)}
          />
        </section>

        <ArtifactDetailPanel artifact={selectedArtifact} />
      </div>
    </section>
  );
}
