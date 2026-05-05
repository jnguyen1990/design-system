# Design system audit

Surface-by-surface inventory across the three reference UI kits in `claude-design-export/ui_kits/{base,budgeter,fitness}/index.html`. The "Decision" column is the canonical choice that should drive `colors_and_type.css` + `components.css` (and the live `design-system.css`).

## 0. The single biggest finding — class-name drift [RESOLVED]

There were two parallel CSS surfaces in this repo that disagreed:

| Concept            | Spec CSS (formerly `claude-design-export/components.css`) | Live CSS (`design-system.css`, single source of truth) |
| ------------------ | --------------------------------------------------------- | ------------------------------------------------------ |
| input              | `.input` / `.select` / `.textarea`                        | `.form-control`                                        |
| table              | `.tbl` (custom)                                           | bare `<table>` inside `.table-responsive`              |
| sidebar            | `.app-sidebar` + `.sb-item`                               | `.sidebar` + `.nav-menu` + `.nav-link`                 |
| layout shell       | `.app-shell` / `.app-main` / `.app-header`                | `.main-content` + `.page-header` + `.content`          |
| color badges       | `.badge-red` / `.badge-orange` / …                        | `.badge-success` / `.badge-warning` / `.badge-error` / `.badge-info` |
| sidebar dot color  | `.sb-dot-red` / `.sb-dot-orange` / …                      | inline `<span class="color-dot" style="background: var(--green-9)">` |

**Resolution:** Spec CSS files (`colors_and_type.css` + `components.css`) deleted from `claude-design-export/`. Preview pages and slide template repointed to `../../design-system.css`. SKILL.md + README.md updated to instruct linking the canonical CSS via the CDN URL. Single source of truth going forward.

## 1. Tokens — what every app already uses consistently

These are the tokens that show up identically across all three kits and need no decision:

| Token group | Names                                                                 | Notes |
| ----------- | --------------------------------------------------------------------- | ----- |
| Surface     | `--bg`, `--bg-subtle`, `--panel`, `--panel-hover`, `--panel-active`   | All three kits use these for cards, day cols, acc cards, pr cards |
| Border      | `--border`, `--border-hover`                                          | Card borders, table dividers, row separators                      |
| Text        | `--text`, `--text-muted`, `--text-faint`                              | Heading / body / metadata, respectively                            |
| Type        | `--text-xs`, `--text-sm`, `--text-base`, `--text-md`, `--text-lg`, `--text-xl`, `--text-2xl` | Used everywhere; no app reaches for raw px |
| Spacing     | `--space-2`, `--space-3`, `--space-4`, `--space-6`, `--space-8`       | 8/12/16/24/32 — `space-1` and halfsteps unused in audited pages    |
| Radius      | `--radius-sm` (chips/inputs), `--radius-md` (cards)                   | `--radius-lg` not used in audited pages                            |
| Mono        | `--font-mono`                                                         | Always paired with `font-variant-numeric: tabular-nums` for numbers |

## 2. Per-app accent — already systemized

| App      | Accent  | `--accent-500` source | Where it appears                                          |
| -------- | ------- | --------------------- | --------------------------------------------------------- |
| Base     | slate   | `--slate-9`           | Logo only. Chrome stays neutral.                          |
| Budgeter | green   | `--green-9`           | Logo, "groceries" badge, app-card glyph stroke            |
| Fitness  | orange  | `--orange-9`          | Logo, "cycling" badge, today-column highlight, app-card glyph |

**Decision:** Keep this. The convention "accent appears in logo + one categorical signal + onboarding" is already followed.

## 3. Surface-by-surface comparison

### Buttons

| Property        | Base                   | Budgeter               | Fitness                | Decision                      |
| --------------- | ---------------------- | ---------------------- | ---------------------- | ----------------------------- |
| Primary class   | `.btn-primary`         | `.btn-primary`         | `.btn-primary`         | `.btn-primary` ✓               |
| Primary color   | `var(--indigo-9)`*     | `var(--indigo-9)`*     | `var(--indigo-9)`*     | Indigo (system primary, not per-app accent) |
| Secondary       | `.btn-secondary` (slate panel) | same           | same                   | `.btn-secondary` on `--panel` ✓ |
| Ghost           | `.btn-ghost` (transparent → panel on hover) | same | same                   | `.btn-ghost` ✓                 |
| Sizes           | `.btn-sm` only used    | default + `.btn-sm`    | default + `.btn-sm`    | Keep `.btn-sm` and default, drop `.btn-lg` until needed |
| Icon button     | none                   | `.btn-sm.btn-ghost` w/ "⋮" | none               | Use `.btn-icon` modifier (already in spec, not yet used) |

\* The kits don't visibly assert primary's hue — relies on system default. Not currently using `--accent-500` for primary action.

**Open question:** Should `.btn-primary` adopt the per-app accent, or stay indigo? Today it's indigo for all apps; the per-app feel comes only from accent surfaces. **Recommended:** keep indigo for all primary actions — it's load-bearing for "this is the action," and per-app accent identity is delivered via logo + categorical badges. Revisit only if it ever feels wrong.

### Cards

| Property         | Base                   | Budgeter (`.acc-card`)     | Fitness (`.pr-card`, `.day-col`) | Decision                |
| ---------------- | ---------------------- | -------------------------- | -------------------------------- | ----------------------- |
| Background       | `var(--bg-subtle)`     | `var(--bg-subtle)`         | `var(--bg-subtle)`               | `--bg-subtle` ✓          |
| Border           | `1px solid var(--border)` | same                    | same                             | `1px solid var(--border)` ✓ |
| Radius           | `var(--radius-md)` (6px) | `var(--radius-md)`       | `var(--radius-md)` for outer; `--radius-sm` for inner `.session` | `--radius-md` for cards, `--radius-sm` for nested chips ✓ |
| Padding          | 20px (default `.card`) | `var(--space-4)` (16px)    | `var(--space-3)` (12px) for `.day-col`, `.pr-card` | **DRIFT.** Standardize: `--space-5` (20px) default, `--space-3` for compact dense cards |
| Shadow           | none                   | none                       | none                             | Flat (no shadow) ✓       |
| Hover            | `border-color: var(--border-hover)` | not interactive | not interactive             | Only `.card-interactive` gets hover treatment ✓ |

**Action:** add `.card-compact` (12px padding) and `.card-dense` (16px padding) modifiers so Fitness's `.day-col` / `.pr-card` and Budgeter's `.acc-card` stop reinventing the card.

### Inputs

| Property         | Base | Budgeter                                | Fitness | Decision                                                  |
| ---------------- | ---- | --------------------------------------- | ------- | --------------------------------------------------------- |
| Class            | none | `.form-control` (text, select, month)   | none    | `.form-control` (live class) — rename spec `.input` to match |
| Background       | —    | `var(--bg-subtle)` (per spec)           | —       | `--bg-subtle` ✓                                            |
| Height           | —    | `var(--control-h)` (36px)               | —       | 36px ✓                                                     |

**Coverage gap:** none of the kits show focus state, invalid state, textarea, or labeled groups visibly. Spec covers them; verify by adding to the next kit iteration.

### Badges

| Type              | Base                    | Budgeter                  | Fitness                | Decision |
| ----------------- | ----------------------- | ------------------------- | ---------------------- | -------- |
| Neutral           | `.badge` (slate)        | `.badge` (subscriptions, dining) | `.badge` (rest)  | `.badge` ✓ |
| Success           | `.badge-success` (uncategorized) | `.badge-success` (groceries) | `.badge-success` (PR delta) | `.badge-success` ✓ |
| Info              | —                       | `.badge-info` (income)    | —                      | `.badge-info` ✓ |
| Warning           | —                       | `.badge-warning` (transport) | —                  | `.badge-warning` ✓ |
| Error             | —                       | `.badge-error` (housing)  | —                      | `.badge-error` ✓ |
| Domain-tag        | `.badge.session-type-cycling` | (purple subscriptions: bare `.badge`) | `.session-type-cycling/-running/-strength/-mobility` | **DRIFT.** Fitness has named domain badges; Budgeter inlines a color. Standardize on a domain-tag pattern (see Action #3). |
| Color-dot prefix  | always `<span class="color-dot" style="background: var(--X-9)">` | same | same | Keep `.color-dot`, but stop inlining the color — use a class like `.color-dot--green` |

### Tables

| Property           | Budgeter (only kit with a table)               | Decision |
| ------------------ | ---------------------------------------------- | -------- |
| Wrapper            | `.table-responsive`                            | `.table-responsive` ✓ |
| Element            | bare `<table>` (no class)                      | Keep bare; current live CSS already styles it |
| Row hover          | yes (live default)                             | ✓ |
| Numeric cells      | `.font-mono` + `.text-right` (color-coded `amount-out` / `amount-in` is page-local) | Promote color-coded `td-amount-positive` / `td-amount-negative` into the system |
| Header style       | small caps removed; lowercase muted text       | ✓ |
| Date cells         | `.font-mono.td-muted` (e.g. "apr 22")          | Add `.td-date` semantic class |
| Action cell ("⋮")  | last `<td>` width 48 with `.btn-sm.btn-ghost`  | Add `.td-actions` semantic class |

### Stat cards

| Property      | Fitness (`.stat-card`)                                | Decision                  |
| ------------- | ----------------------------------------------------- | ------------------------- |
| Container     | `.stats-grid` (auto-fit grid)                          | `.stats-grid` ✓            |
| Card          | `.stat-card` (`--bg-subtle` + border + `--radius-md`) | `.stat-card` ✓             |
| Label         | `.stat-label` (xs, muted, lowercase)                  | ✓                          |
| Value         | `.stat-value` (mono, tabular, large)                  | ✓                          |
| Subtext       | `.stat-subtext` + optional `.text-success` etc.       | ✓                          |

Only Fitness uses these. Promote them — Budgeter's `.acc-card` is a near-duplicate of `.stat-card`. **Action #4** below.

### Sidebar / nav

| Property         | All three apps                                            | Decision |
| ---------------- | --------------------------------------------------------- | -------- |
| Container        | `<nav class="sidebar">`                                   | ✓ |
| Header           | `.sidebar-header > h1` with inline SVG logo + app name    | ✓ |
| Items            | `.nav-menu > li > .nav-link` (`.active` modifier)         | ✓ |
| Submenu          | `.nav-submenu` containing `.submenu` (Budgeter, Fitness)  | ✓ |
| Mobile toggle    | `.mobile-menu-toggle` + `.mobile-overlay`                 | ✓ |

No drift. Sidebar is the most stable surface across the three apps.

### Page header / toolbar

| Property         | Base                              | Budgeter                          | Fitness                           | Decision |
| ---------------- | --------------------------------- | --------------------------------- | --------------------------------- | -------- |
| Container        | `<header class="page-header">`    | same                              | same                              | ✓ |
| Title            | `.page-title`                     | same                              | same                              | ✓ |
| Subtitle/meta    | inline span muted+mono (`thu · apr 24`) | same pattern                | same pattern                      | Add `.page-subtitle` + `.page-meta` semantic classes (already partially in live CSS) |
| Action area      | `.btn-secondary.btn-sm + .btn-primary.btn-sm` inside `.d-flex.gap-2` | `.toolbar-end` with multiple buttons | `.toolbar-end` with badges + buttons | Standardize on `.toolbar` + `.toolbar-start`/`.toolbar-end` for any non-trivial header action area |

### Insight cards (Fitness only)

`.insight-card` with `.insight-success` / `.insight-info` / `.insight-warning` modifiers. Self-contained, well-scoped. **Decision:** keep app-local for now; promote only if Base or Budgeter reach for it.

### Theme toggle

All three: `.theme-toggle` button (top-right, fixed) + JS that flips `data-theme` and the sun/moon glyph. Identical implementation. ✓

## 4. App-specific patterns (do NOT systemize)

These are page-local CSS in each kit and should stay that way:

**Base** (`ui_kits/base/index.html`)
- `.app-card` (the launcher tile pattern) and its parts: `.app-card-glyph`, `.app-card-top`, `.app-card-name`, `.app-card-desc`, `.app-card-footer`
- `.recent-row` / `.pill-row` (cross-app activity rows)
- `.status-dot.online` (presence indicator)

**Budgeter** (`ui_kits/budgeter/index.html`)
- `.amount-out` / `.amount-in` — **promote to system** as `.text-amount-out` / `.text-amount-in`; this is reusable
- `.budget-row` + `.b-track` / `.b-fill` (progress bar inside row); modifiers `.over` / `.warn` / `.ok`
- `.acc-card` — **promote** by aliasing to `.stat-card` (see Action #4)

**Fitness** (`ui_kits/fitness/index.html`)
- `.week-grid` + `.day-col` (calendar)
- `.session` (item inside day col), `.session.rest` modifier
- `.lift-row` + `.lift-name` / `.lift-prescr` / `.lift-prev` / `.lift-curr`
- `.pr-bar` + `.pr-card` — **near-duplicate of `.stat-card`**, see Action #4
- `.insight-card` family

## 5. Action items (drives steps 2–3)

Listed in priority order. Each maps directly to a change in `components.css` (or, if you collapse the two layers, in `design-system.css`).

1. **Resolve the two-CSS-files drift.** [DONE] Spec files deleted, preview/slides repointed to `../../design-system.css`, SKILL.md + README.md updated to point at the canonical CSS via CDN. See section 0.
2. **Promote `.text-amount-positive` / `.text-amount-negative` / `.text-amount-neutral`.** [DONE] Tokens added in step 2 (`--text-amount-positive/negative/neutral`); utility classes added in step 3 (`design-system.css:432-434`). Budgeter UI kit refactored to use them. Old page-local `.amount-out` / `.amount-in` declarations removed.
3. **Standardize the domain-tag badge / color-dot.** [DONE] `.color-dot--{red|orange|amber|green|teal|blue|indigo|purple|pink|slate|accent}` modifiers added (`design-system.css:1067-1077`). All 25 inline `style="background: var(--X-9)"` color-dot uses across base/budgeter/fitness UI kits replaced with `.color-dot--X` modifiers. Documented in brand-guide.md.
4. **Unify `.acc-card` / `.pr-card` / `.stat-card`.** [PARTIAL] `.stat-card` confirmed canonical (`design-system.css:1228-1267`). Budgeter's unused `.acc-card` page-local CSS deleted. Fitness `.pr-card` left page-local — its smaller value font (`--text-lg` vs `--text-2xl`) and tighter padding don't cleanly map to `.stat-card.card-compact`. Future cleanup if Fitness ever uses both at the same scale.
5. **Add card density modifiers.** [DONE] `.card-dense` (16px) and `.card-compact` (12px) added; default `.card` padding now `var(--space-5)` (was hardcoded `20px`). Documented in brand-guide.md.
6. **Add semantic table cell classes.** [DONE] `.td-date` / `.td-amount` / `.td-actions` added (`design-system.css:1149-1167`). Budgeter table refactored to use them. Documented in brand-guide.md.
7. **Verify input coverage.** [DONE] Added `claude-design-export/ui_kits/budgeter/add-transaction.html` covering: text/number/date inputs, select, textarea, radio chip group with `:has(:checked)` selection styling, focus state (per-app accent via `--focus-ring`), `aria-invalid="true"` error state with `.form-error` text, helper text, disabled secondary button, and a live preview of the resulting ledger row. Sidebar updated to link the two pages. Static check confirms zero token leaks → light/dark parity is structural.

## 6. What's already good (don't touch)

- Token layer: surface/text/border/space/radius/mono are consistent across all three apps and need no work.
- Per-app accent strategy: chrome neutral, accent only in logo + one categorical signal. Keep.
- Sidebar/nav: identical across all three. Most stable surface.
- Theme toggle + dark mode: works the same way everywhere.
- "Lowercase labels, mono numbers, no emoji, no shadows on cards" — all three kits respect these. The rules are in the SKILL.md and they're being followed.
