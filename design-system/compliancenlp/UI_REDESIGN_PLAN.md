# ComplianceNLP UI Redesign Plan

## Current State

The current frontend is a useful prototype:

- React/Vite app exists under `frontend/`.
- One shell contains Dashboard, Application, Training, and Outputs.
- Application page already calls `/health`, `/extract`, and `/analyze_gap`.
- Training page is intentionally fake/prototype-only.
- Styling is centralized in `frontend/src/styles.css`.

The main limitation is structure and polish:

- `App.tsx` contains shell, pages, and page-specific logic in one file.
- CSS is functional but not yet governed by a formal design system.
- Dashboard information density and hierarchy need refinement.
- Training prototype needs a more explicit operator-console layout.
- Outputs needs to evolve from cards to artifact-browser behavior.

## Redesign Principles

- Keep one unified frontend.
- Keep the internal-tool dashboard model; do not create a landing page.
- Preserve existing API wiring.
- Improve UI by slices, not by rewriting every page at once.
- Split React components before major visual changes.
- Keep training controls prototype-only until backend job execution is designed.

## Phase 1: Frontend Structure

Goal: make the UI easier to redesign safely.

Tasks:

- Create `frontend/src/pages/`.
- Move Dashboard, Application, Training, and Outputs into separate page modules.
- Create `frontend/src/components/` for shell, navigation, panels, status badges, buttons, and form controls.
- Keep `frontend/src/api/client.ts` unchanged unless a UI need exposes a contract issue.
- Keep current behavior and visual output nearly identical.

Validation:

- `npm run build`
- Browser check at desktop and mobile widths.

## Phase 2: Token And Shell Redesign

Goal: apply the master design system without changing product behavior.

Tasks:

- Replace CSS variables with tokens from `MASTER.md`.
- Redesign app shell, sidebar, topbar, buttons, badges, focus states, and panel primitives.
- Introduce Plus Jakarta Sans if network/font loading policy is acceptable; otherwise keep Inter/system fallback.
- Add visible keyboard focus states.
- Remove heavy decorative shadows in favor of subtle borders.

Validation:

- No horizontal scroll at 375px.
- All buttons and clickable rows have hover and focus states.
- `npm run build`

## Phase 3: Dashboard Redesign

Goal: make Dashboard the operational command center.

Tasks:

- Rework readiness strip.
- Promote analyst queue as the primary panel.
- Add compact platform/runtime summary.
- Convert wide queue rows to mobile card rows.
- Replace decorative score ring with denser metric cards or a small trend/comparison chart placeholder.

Validation:

- Dashboard reads clearly at 1440px, 1024px, 768px, and 375px.
- Mock/fake metrics are visually distinguishable from real API health values.

## Phase 4: Application Workbench Redesign

Goal: make extraction and gap analysis feel like a real analyst workflow.

Tasks:

- Keep controlled textareas and API calls.
- Separate input, result, and diagnostics regions.
- Add clear loading/empty/error/success states.
- Label placeholder backend responses explicitly.
- Improve result layout for future non-empty obligations/entities.

Validation:

- `/extract` and `/analyze_gap` calls still work through the existing client.
- Placeholder responses are not presented as model quality.

## Phase 5: Training Prototype Redesign

Goal: make offline operations understandable without implementing execution.

Tasks:

- Make prototype-only banner persistent and unambiguous.
- Use job queue + selected job detail + log panel layout.
- Improve failed/pending/running/complete state language.
- Add artifact/runbook sections.
- Keep launch controls non-operational.

Validation:

- No UI path triggers real jobs.
- Operator can understand intended flow from the screen alone.

## Phase 6: Outputs Redesign

Goal: move toward artifact browser behavior.

Tasks:

- Replace pure cards with dense artifact rows or a responsive table/card hybrid.
- Add type filters and path visibility.
- Add empty states for missing outputs.
- Keep large file download out of scope.

Validation:

- Long paths do not break layout.
- Mobile does not horizontally scroll.

## Deferred Decisions

- Whether to add a component library such as shadcn/ui.
- Whether to add chart dependency such as Recharts.
- Whether to add a real routing library.
- Whether to split Application and Training into separate deployments later.
- Whether to add dark mode.

## Recommended Next Implementation Slice

Start with Phase 1 and Phase 2 together:

- Split files into pages/components.
- Apply global design tokens and shell redesign.
- Do not change API behavior.

This gives a stable foundation before redesigning individual workflows.

