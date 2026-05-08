---
name: joes-apps-design
description: Use whenever building, mocking, or modifying any UI for Joe's self-hosted personal apps — Base (slate), Budgeter (green), Fitness (orange), or any future personal app on the joenguyen.ca domain. TRIGGER on requests like "design a settings page for X", "build a form for Y", "mock up a Budgeter screen", "add a card showing Z", or any HTML/ERB/CSS work in the base/, budgeter/, or fitness/ Rails repos. Provides the canonical design-system.css (link via CDN), Linear-meets-Things-3 aesthetic rules, per-app accent system, and reference UI kits to copy from. SKIP for unrelated client work, generic web design, or any project outside Joe's personal-apps constellation.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. Link the canonical stylesheet from CDN in each HTML page:

```html
<link rel="stylesheet" href="https://design-system.joenguyen.ca/design-system.css">
```

Reach for semantic tokens (`var(--text)`, `var(--panel)`, `var(--border)`, `var(--focus-ring)`, `var(--text-amount-positive)`) — not raw Radix scales — so light/dark parity and per-app accent are automatic.

If working on production code, copy assets and read the rules here to become an expert in designing with this brand. The full source for `design-system.css` lives one level up from this skill at `../design-system.css`.

Key rules to internalize:

**Voice & content**
- Lowercase UI labels where clarity allows (`new entry`, `today`); sentence case for buttons (`Add transaction`).
- No emoji. Anywhere. Categorical Radix colors do the work emoji might otherwise do.
- Empty states: one line of copy, no illustration. Errors: name what's wrong, not what to do (`Amount required`, not `Please enter an amount`).

**Type**
- Geist Mono for **all** numbers, IDs, timestamps, kbd hints — with `font-variant-numeric: tabular-nums`.
- For amount columns / +/- deltas, use `.td-amount` + `.text-amount-positive` / `.text-amount-negative` / `.text-amount-neutral`.

**Color & accent**
- Chrome stays neutral (slate). Per-app accent appears only in logo, favicon, empty-state tint, onboarding.
- Set `<html data-app="{base|budgeter|fitness}" data-theme="{light|dark}">` on every page — this drives `--accent-{50..700}` and the `--focus-ring`.
- Categorical color comes through `<span class="color-dot color-dot--{red|orange|amber|green|teal|blue|indigo|purple|pink|slate|accent}"></span>`. **Never** inline `style="background: var(--X-9)"`.
- Focus rings inherit the per-app accent via `--focus-ring` → `--accent-300`. Don't hardcode focus colors.

**Surfaces**
- Cards are flat (no shadow). Default `.card` (20px), `.card-dense` (16px) for stat tiles, `.card-compact` (12px) for calendar/grid cells.
- For tile-style numeric metrics, use `.stats-grid > .stat-card` with `.stat-label` / `.stat-value` / `.stat-subtext` children — don't reinvent.
- Shadows reserved for floating elements (popover, dropdown, modal).

**Interaction**
- Hover = next slate step (panel→panel-hover). Never opacity, never lift, never scale.
- Animation is minimal: `120ms` / `160ms` / `200ms`, ease-out only (`cubic-bezier(0.2, 0, 0, 1)`).
- Density floor: 36px controls, 36–40px rows. Spacious, not cramped.

**Tables**
- Use bare `<table>` inside `.table-responsive`. Semantic td modifiers: `.td-date` (mono+muted+xs+nowrap), `.td-amount` (mono+tabular+right), `.td-actions` (48px wide), `.td-muted` (mono-friendly secondary).

**Forms**
- `.form-control` for all inputs (text, number, date, select, textarea). `.form-group` wrapper, `.form-label` for labels, `.form-hint` for helper text, `.form-error` for error text. Set `aria-invalid="true"` on the input to trigger the red error border.
- See `ui_kits/budgeter/add-transaction.html` for the canonical form pattern.

**Token discipline (the rule that makes everything else work)**
- Always reach for semantic tokens: `var(--text)`, `var(--panel)`, `var(--border)`, `var(--focus-ring)`, `var(--text-amount-positive)`, `var(--accent-500)`, `var(--space-4)`, etc.
- **Never** inline raw Radix steps (`var(--slate-9)`, `var(--green-3)`) in component code, page-local CSS, or HTML `style=""`. The only exception is the `.color-dot--{color}` modifiers themselves, which encode the categorical mapping.

The same `design-system` repo is linked into **Claude Design** (claude.ai/design) as the org-wide design system, so web/Claude Design and Claude Code work from the same source. When the CSS or brand guide changes: push to GitHub, then "remix" in Claude Design org settings (no continuous sync).

Folder layout:
- `README.md` — full brand + content + visual + iconography spec
- `preview/` — Design System tab cards (one HTML page per token group / component family)
- `assets/` — app logos
- `ui_kits/{base,budgeter,fitness}/` — reconciled static-HTML kits using the live `design-system.css` from CDN, modeled on real Rails ERB pages. Each kit has an `index.html` (the most-trafficked screen) plus additional pages for distinct surface patterns. **Budgeter** also has `add-transaction.html` covering form patterns (text/number/date/select/textarea inputs, radio chip group, error state, action row). When starting a new app: pick the closest existing kit, copy the folder, swap `data-app="…"`, and replace content.
- `../design-system.css` — canonical stylesheet (tokens + components, single source of truth)
- `../brand-guide.md` — human-readable spec for the token layer

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
