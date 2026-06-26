# ComplianceNLP Design System

> Source of truth for the ComplianceNLP frontend redesign.
>
> Retrieval rule: before designing a specific page, read
> `design-system/compliancenlp/pages/<page>.md`. Page rules override this file.

## Product Frame

- Product type: internal compliance NLP SaaS workspace.
- Primary users: compliance analysts, ML/platform operators, backend engineers validating model/API status.
- UI mode: operational application, not marketing landing page.
- Design goal: dense but calm work surface for extraction, gap analysis, training operations, artifacts, and system readiness.

## Skill Search Basis

`ui-ux-pro-max` returned useful matches for:

- Product: Analytics Dashboard, Financial Dashboard, SaaS.
- Style: Data-Dense Dashboard, Trust & Authority, Minimalism & Swiss Style.
- Color: SaaS general, Analytics Dashboard, Financial Dashboard.
- Typography: Friendly SaaS with Plus Jakarta Sans.
- UX: responsive table handling, no horizontal mobile overflow, controlled forms, explicit loading/error states.
- React stack: controlled components, measure before optimizing, avoid unnecessary manual batching.

The generated "Webinar Registration" pattern is rejected because ComplianceNLP is an authenticated/internal tool, not a conversion landing page.

## Visual Direction

Use a "regulated operations console" style:

- Dense dashboard layout with 8-16px internal spacing.
- Clear left navigation and page-level command bar.
- White/light work surfaces with navy framing.
- Trust blue as the main action color.
- Amber only for review attention or warning states.
- Green/red only for status, pass/fail, positive/negative indicators.
- Subtle borders over decorative shadows.
- No hero sections, marketing cards, gradient blobs, or decorative illustrations.

## Color Tokens

| Token | Hex | Usage |
| --- | --- | --- |
| `--color-bg` | `#F8FAFC` | App background |
| `--color-surface` | `#FFFFFF` | Panels, cards, forms |
| `--color-surface-muted` | `#F1F5F9` | Secondary panel backgrounds |
| `--color-border` | `#CBD5E1` | Standard borders |
| `--color-border-strong` | `#94A3B8` | Active or section borders |
| `--color-text` | `#0F172A` | Primary text |
| `--color-muted` | `#475569` | Secondary text, metadata |
| `--color-nav` | `#0F172A` | Sidebar/nav background |
| `--color-primary` | `#2563EB` | Main actions, selected nav |
| `--color-primary-soft` | `#DBEAFE` | Selected backgrounds |
| `--color-accent` | `#F59E0B` | Review attention, warnings |
| `--color-success` | `#059669` | Connected, complete, compliant |
| `--color-danger` | `#DC2626` | Failed, critical, errors |

## Typography

- Primary font: Plus Jakarta Sans.
- Fallback: Inter, system UI, sans-serif.
- Headings should be compact and functional.
- Avoid oversized hero text inside dashboards.
- Body text must remain readable at 13-15px.
- Data labels and metadata can use 11-12px with strong contrast.

Recommended scale:

| Role | Size | Weight |
| --- | --- | --- |
| Page title | 28-34px | 700-800 |
| Section heading | 17-20px | 700 |
| Body | 14-15px | 400-500 |
| Metadata | 12-13px | 600 |
| Table row text | 13-14px | 500 |

## Layout System

- App shell: persistent left sidebar on desktop, stacked navigation on tablet/mobile.
- Main pane: max width should not be overly constrained; dashboards need horizontal working room.
- Grid: use 12-column thinking on desktop, collapse to 1 column under tablet width.
- Panel radius: 8px maximum unless using native input pills.
- Panel padding: 16-20px desktop, 12-16px mobile.
- Dashboard tables/lists should use fixed row heights where possible.
- Avoid nested cards; panels contain controls, repeated items can be cards/rows.

## Component Rules

### Buttons

- Primary buttons use trust blue.
- Secondary buttons use white background, visible border, navy text.
- Icon-only buttons must have accessible labels and tooltips/titles.
- Loading buttons should disable interaction and keep width stable.
- Hover states use color/border/shadow changes, not scale transforms.

### Forms

- Use controlled React components for all inputs.
- Inputs need visible labels.
- Textareas should have stable min-height.
- Validation and API errors appear near the related workflow, not only as global banners.
- Required fields must be visibly marked when real validation is introduced.

### Status

- Every status label must use both text and color.
- Green means ready/complete/compliant only.
- Amber means review/waiting/partial.
- Red means failed/critical/error.
- Neutral status uses slate/gray.

### Tables And Lists

- Prefer dense rows for analyst queues and job queues.
- On mobile, transform wide tables into stacked rows/cards.
- Do not allow horizontal page scroll.
- Keep row hover feedback subtle and non-shifting.

### Charts

- Trend over time: line chart.
- Framework/category comparison: horizontal or vertical bar chart.
- Multi-factor risk comparison: radar only if axes are limited to 5-8 and paired with a table.
- Always show values or accessible labels; do not rely on color alone.

## Page Architecture

Primary navigation:

- Dashboard: operational overview and queues.
- Application: extraction and gap analysis workbench.
- Training: visual operator workspace for offline jobs.
- Outputs: artifacts, reports, model checkpoints, graph exports.

Future navigation can add:

- Corpus: regulatory source ingestion and document inventory.
- Reports: analyst review and export history.
- Settings: model/runtime configuration.

## Anti-Patterns

- No landing page hero as the default screen.
- No webinar, urgency, or conversion page structure.
- No purple/pink AI gradients.
- No decorative gradient orbs, bokeh, or abstract backgrounds.
- No cards inside cards.
- No emoji icons.
- No invisible focus states.
- No low-contrast muted text.
- No hover transforms that shift layout.
- No fake precision in UI copy when backend endpoints are placeholders.

## Implementation Plan

1. Keep the existing React/Vite app.
2. Refactor the frontend into page and component modules before large visual changes.
3. Replace current CSS variables with the token set above.
4. Redesign Dashboard first because it establishes global navigation, density, and status language.
5. Redesign Application second because it validates API workflows.
6. Redesign Training third as a prototype-only operator surface.
7. Redesign Outputs last as an artifact browser.
8. Validate at 375px, 768px, 1024px, and 1440px.
9. Run `npm run build` after every implementation slice.

## Pre-Delivery Checklist

- [ ] Uses Lucide icons consistently.
- [ ] All interactive elements show pointer and hover/focus feedback.
- [ ] Keyboard focus is visible.
- [ ] No horizontal mobile scroll.
- [ ] Text contrast is at least WCAG AA.
- [ ] Loading, empty, success, and error states exist for API workflows.
- [ ] Training page still clearly indicates prototype-only behavior.
- [ ] Backend placeholder responses are not presented as real inference quality.
