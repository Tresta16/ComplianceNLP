# Dashboard Page Design

## Role

The dashboard is the first operational screen. It should answer:

- Is the serving stack healthy?
- What needs analyst attention?
- What changed in regulatory coverage or model operations?
- Which workflow should the user open next?

## Layout

Desktop:

- Top command bar with page title, refresh, and primary "New analysis" action.
- System readiness strip with API, Neo4j, retriever, model status.
- Main grid with analyst queue as the largest panel.
- Secondary column for service posture, recent jobs, and coverage summary.

Mobile:

- Stack nav, status, queue, and summaries in that order.
- Convert analyst queue rows into compact cards.

## Components

- Readiness tiles with icon, label, state, and short detail.
- Analyst queue table with severity, framework, owner, and state.
- Coverage bars by framework.
- Offline job summary list.
- Small trend chart placeholder for future risk/review volume.

## Visual Rules

- Use data-dense layout; avoid large empty marketing blocks.
- Give the analyst queue highest visual priority.
- Use amber for review-needed, red for failed/critical, green for complete.
- Keep metric cards compact and comparable.

## Do Not

- Do not use hero copy or product marketing language.
- Do not use circular score charts as the only representation of model quality.
- Do not show fake production accuracy as if it came from real monitoring.

