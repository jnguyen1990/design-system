---
name: joes-apps-design
description: Use whenever building, mocking, or modifying any UI for Joe's self-hosted personal apps — Base (slate), Budgeter (green), Fitness (orange), Mealplanner (purple), Upkeep (blue), Postings (crimson), or any future personal app on the joenguyen.ca domain. TRIGGER on requests like "design a settings page for X", "build a form for Y", "mock up a Budgeter screen", "add a card showing Z", or any HTML/ERB/CSS work in the base/, budgeter/, fitness/, mealplanner/, upkeep/, or postings/ Rails repos. Provides the canonical design-system.css (link via CDN), Linear-meets-Things-3 aesthetic rules, per-app accent system, and reference UI kits to copy from. SKIP for unrelated client work, generic web design, or any project outside Joe's personal-apps constellation.
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
- **Sentence case everywhere** (v4): `New entry`, `Today`, `Apr 22 · Amex`, `+ Add transaction`. Never Title Case. Micro-labels (table headers, `.stat-label`) are sentence case too since v4.4 — the UPPERCASE signature is retired.
- No emoji. Anywhere. Categorical Radix colors do the work emoji might otherwise do.
- Empty states: one line of copy, no illustration. Errors: name what's wrong, not what to do (`Amount required`, not `Please enter an amount`).

**Type**
- Geist Mono only for numbers in data (amounts, counts), IDs and kbd hints — with `font-variant-numeric: tabular-nums`. Metadata (subtitles, dates, `.text-meta`, chips) is Inter with tabular figures (v4.4). `.stat-value` big numbers are Inter.
- For amount columns / +/- deltas, use `.td-amount` + `.text-amount-positive` / `.text-amount-negative` / `.text-amount-neutral`.

**Color & accent**
- Chrome stays neutral (slate) except five v4 accent moments (all automatic from the CSS): primary button, active nav item (`--accent-soft` tint), focus ring, text selection, checked controls. Beyond those, per-app accent appears only in logo, favicon, empty-state tint, onboarding.
- Set `<html data-app="{base|budgeter|fitness|mealplanner|upkeep|postings}">` on every page — this drives `--accent-{50..700}` and the `--focus-ring`. The six accents: base slate, budgeter green, fitness orange, mealplanner purple, upkeep blue, postings crimson.
- Theme: a page that loads `shared-core.js` (every app layout, every kit) sets no theme attribute — the script applies the saved theme (`data-theme` + the matching class) before first paint; with nothing saved it follows the OS, dark when the OS has no preference. React to toggles with the `ds:themechange` event. A static mock that does **not** load it needs both `class="dark"` and `data-theme="dark"` on `<html>` for dark; the Radix dark scales key on the class.
- Categorical color comes through tinted chips: `<span class="badge badge--{red|orange|amber|green|teal|blue|indigo|purple|pink|slate}">Label</span>` (v4 — alpha-tint bg, step-11 text, no dot needed). Standalone `.color-dot--{color}` remains for legends/lists. **Never** inline `style="background: var(--X-9)"`.
- Focus rings inherit the per-app accent via `--focus-ring` → `--accent-text` (step 11, AA). Don't hardcode focus colors, and never mix them with transparency.
- Any solid fill that carries text uses `--accent-solid` + `--accent-on` (or `--danger-solid` + `--danger-on`) — never `#fff` on `--accent-500`, which fails AA in five of six apps.

**Surfaces (v4.4 — flat, Joe's M1 pick B)**
- One white page sheet (`--sheet`; dark slate-1); only the sidebar is tinted. A `.card` is a flat section opened by a top hairline — no fill, side borders, radius or shadow — with content aligned to the page title; never hand-roll card boxes. `.card-dense` / `.card-compact` change vertical rhythm only.
- Numeric tiles: `.stats-grid > .stat-card` with `.stat-label` / `.stat-value` / `.stat-subtext` — a hairline band split by vertical hairlines.
- Only floating layers (modal, dropdown, toast, tab bar, sheet) use `--card` + `--shadow-floating`. Content is capped at 1200px, left-aligned.

**Interaction**
- Hover = next slate step (panel→panel-hover); card hover = border to `--card-border-hover`. Never opacity, never lift, never scale, never shadow growth.
- Animation is minimal: `120ms` / `160ms` / `200ms`, ease-out only (`cubic-bezier(0.2, 0, 0, 1)`).
- Density floor: 36px controls, 36–40px rows; 44px on touch (automatic via `--control-h` — never hard-code a control height). Spacious, not cramped.
- Modals: `openModal(id)` / `.modal-open`; modal-keys.js makes every open `.modal` a named dialog with focus moved in, trapped and restored — give it a `.modal-title`. Recoverable removals get an undo toast (`dsToast(msg, 'success', {action: {label: 'Undo', onClick}})`), not a confirm.
- Lists with keyboard: `dsListKeys(container, {keys, onEnter, search})` — j/k/Enter/Esc/`/` the same in every app.

**Phones (v4.4)**
- Apps on the engine shell get a floating tab bar + "More" sheet from `nav_items` below 768px (`tab: true` picks the tabs; default first four). Don't build per-app mobile nav. Pages without it keep the hamburger.
- Tables that must read on a phone: `.table-stack` (cells carry `data-label`, roles via `data-cell="select|title|actions|hide"`) or `.table-stack--days` for a ledger (`tr.stack-day` headers; `data-cell="title|amount|meta|aside"`).

**Layout & states (v4.3)**
- No inline `style=""` for layout: `.stack` (`-sm`/`-lg`), `.cluster` (`-between`/`-end`), `.columns-2`, `.columns-aside`, `m-0`, `mt-/mb-{0,1,2,3,4,5,6,8}`, `gap-{1..6}`. Tokens for the in-between steps: `--text-2xs` (11px), `--space-1_5` (6px), `--space-2_5` (10px); z-index only from `--z-*`.
- Empty: `.empty-state` (+ `.empty-state-icon`, `.empty-state-text`, optional action; `--compact`), or `dsEmptyState(text, {icon})` from JS. Loading: `.skeleton` shapes + `apiRequest(url, {busy: el})`. Never a bare "Loading…".
- Charts: `const t = dsChartTheme()`; series colours `t.palette[0..7]` (`--viz-1…8`) in order, `t.grid`, `t.axis`. Never cycle past 8.
- Print is handled; mark screen-only bits `.no-print`.
- Mobile check: `document.body.scrollWidth <= window.innerWidth` at 375px (not `documentElement`). Before pushing the design system itself: `scripts/check.mjs`.

**Tables**
- Use bare `<table>` inside `.table-responsive`. Semantic td modifiers: `.td-date` (mono+muted+xs+nowrap+capitalize), `.td-amount` (mono+tabular+right), `.td-actions` (48px wide), `.td-muted` (mono-friendly secondary).

**Forms**
- `.form-control` for all inputs (text, number, date, select, textarea). `.form-group` wrapper, `.form-label` for labels, `.form-hint` for helper text, `.form-error` for error text. Set `aria-invalid="true"` on the input to trigger the red error border. Tie labels to fields (`for`/`id`; shared-core's `dsEnhanceLabels()` wires a group with one label and one field automatically); label-less fields and icon-only buttons get `.sr-only` text or `aria-label`.
- See `ui_kits/budgeter/add-transaction.html` for the canonical form pattern.

**Token discipline (the rule that makes everything else work)**
- Always reach for semantic tokens: `var(--text)`, `var(--panel)`, `var(--border)`, `var(--focus-ring)`, `var(--text-amount-positive)`, `var(--accent-500)`, `var(--space-4)`, etc.
- **Never** inline raw Radix steps (`var(--slate-9)`, `var(--green-3)`) in component code, page-local CSS, or HTML `style=""`. The only exception is the `.color-dot--{color}` modifiers themselves, which encode the categorical mapping.

The same `design-system` repo is linked into **Claude Design** (claude.ai/design) as the org-wide design system, so web/Claude Design and Claude Code work from the same source. When the CSS or brand guide changes: push to GitHub, then "remix" in Claude Design org settings (no continuous sync).

Folder layout:
- `README.md` — full brand + content + visual + iconography spec
- `preview/` — Design System tab cards (one HTML page per token group / component family)
- `assets/` — the six app logos (`{app}-logo.svg`)
- `ui_kits/{base,budgeter,fitness,mealplanner,upkeep,postings}/` — static-HTML kits, one per app, using the live `design-system.css` and JS from the CDN and modeled on real Rails ERB pages. Every kit carries the current app chrome exactly as the layouts render it: `.brand-title` with the app's `.brand-logo`, the icon nav (`.nav-ico` + `⌘` hints), an empty `.sidebar-footer` that `apps-launcher.js` fills with the apps dock and theme toggle, and a single `<h1 class="page-title">` in the page header. No kit has its own theme toggle or theme script. Each has an `index.html` (the most-trafficked screen); **Budgeter** also has `add-transaction.html` covering form patterns (text/number/date/select/textarea inputs, radio chip group, error state, action row), and the **Mealplanner** and **Postings** kits show the `installFilterTags` filter bar with its `.filter-tags-add` button. When starting a new app: pick the closest existing kit, copy the folder, swap `data-app="…"`, the logo and the nav, and replace content.
- `../design-system.css` — canonical stylesheet (tokens + components, single source of truth)
- `../brand-guide.md` — human-readable spec for the token layer

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
