# Outputs Page Design

## Role

The outputs page is an artifact browser:

- Model checkpoints.
- Evaluation reports.
- Knowledge graph exports.
- Sample compliance reports.
- Future generated analyst reports.

## Layout

Desktop:

- Filter/action bar at top.
- Artifact table or dense card grid.
- Detail drawer or side panel for selected artifact in a future iteration.

Mobile:

- Filters become horizontal chips or stacked controls.
- Artifacts render as cards with type, path, size, and freshness.

## Components

- Artifact type chips.
- Sort/filter controls.
- Artifact metadata rows.
- Empty state for missing outputs directory.
- Future download/copy path actions.

## Visual Rules

- Prefer table-like density for many artifacts.
- Paths should use monospace styling or clear truncation.
- Large files should show size and location without pretending they are downloadable unless implemented.

## Do Not

- Do not stream large model files through the frontend in the first version.
- Do not hide file paths; operators need exact output locations.
- Do not use decorative cards for every artifact if the list becomes large.

