import { useEffect, useState } from "react";

import { fetchHealthSnapshot } from "./api/client";
import { AppShell } from "./components/AppShell";
import { ApplicationPage } from "./pages/ApplicationPage";
import { DashboardPage } from "./pages/DashboardPage";
import { OutputsPage } from "./pages/OutputsPage";
import { TrainingPage } from "./pages/TrainingPage";
import type { HealthSnapshot, ViewKey } from "./types";

export function App() {
  const [activeView, setActiveView] = useState<ViewKey>("dashboard");
  const [health, setHealth] = useState<HealthSnapshot | null>(null);

  async function refreshHealth() {
    const snapshot = await fetchHealthSnapshot();
    setHealth(snapshot);
  }

  useEffect(() => {
    void refreshHealth();
  }, []);

  return (
    <AppShell activeView={activeView} health={health} onNavigate={setActiveView} onRefresh={refreshHealth}>
      {activeView === "dashboard" && <DashboardPage health={health} onNavigate={setActiveView} />}
      {activeView === "application" && <ApplicationPage />}
      {activeView === "training" && <TrainingPage />}
      {activeView === "outputs" && <OutputsPage />}
    </AppShell>
  );
}

