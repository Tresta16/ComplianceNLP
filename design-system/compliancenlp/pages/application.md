# Application Page Design

## Role

The application page is the analyst workbench for online serving:

- Paste or load regulatory text.
- Run obligation extraction.
- Inspect structured obligations and entities.
- Compare an obligation against internal policy text.
- Review gap result, severity, confidence, and recommended action.

## Layout

Desktop:

- Two-column workbench.
- Left side: source text and policy comparison inputs.
- Right side: extraction result, gap finding, and request diagnostics.
- Sticky or persistent action region only if it does not hide content.

Mobile:

- Source text first.
- Extraction result second.
- Policy comparison third.
- Gap finding last.

## Components

- Framework segmented control.
- Large source textarea.
- Extraction result details with empty/loading/error states.
- Obligation and policy textareas.
- Gap finding panel with classification, severity, alignment, grounding confidence, latency.
- API diagnostics row showing endpoint, status, and response mode.

## Visual Rules

- This page may be slightly more spacious than Dashboard because it is a focused workbench.
- Preserve clear input/result separation.
- Placeholder backend responses must be labeled as placeholder responses.
- Confidence and alignment values must not imply model quality until real inference is connected.

## Do Not

- Do not hide API failures behind silent prototype behavior.
- Do not present empty obligation arrays as successful extraction quality.
- Do not use dense tables for long text comparison; use readable text areas and structured details.

