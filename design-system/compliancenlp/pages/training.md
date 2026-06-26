# Training Page Design

## Role

The training page is currently a prototype-only operator workspace. It communicates the intended offline workflow without executing jobs:

- Knowledge graph ingestion.
- Extraction model training.
- Gap model distillation.
- Medusa/speculative decoding training.
- Evaluation.
- Artifact staging.

## Layout

Desktop:

- Clear prototype banner at top.
- Job queue on the left.
- Selected job detail and logs on the right.
- Artifact and runbook sections below.

Mobile:

- Prototype banner first.
- Job queue second.
- Job detail/logs third.
- Runbook and artifacts last.

## Components

- Job cards with state, progress, runtime, output path, and command.
- Log panel with monospace text.
- Artifact summary list.
- Runbook sequence.
- Disabled or prototype-only launch controls.

## Visual Rules

- Use operator-console density, but do not make it look like a terminal-only page.
- Logs can use a dark panel because they are code/output artifacts.
- Failed jobs use red state and visible failure reason.
- Pending jobs use amber or neutral, not green.

## Do Not

- Do not wire buttons to shell commands from the browser.
- Do not imply real queue persistence exists.
- Do not mix training controls into the analyst Application page.

