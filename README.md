# Design System

Shared CSS design system for Joe Nguyen's self-hosted web applications. Provides consistent theming, component styles, and responsive layout across all apps.

## v3.0 — Linear meets Things 3

Sharp, precise, technical. Inter + Geist Mono, Radix Colors (slate neutral, per-app accent), 4/6/8 px corners, flat surfaces, minimal motion. See [`brand-guide.md`](brand-guide.md) for the full spec.

## Usage

Include via CDN in your HTML:

```html
<!-- Styles -->
<link rel="stylesheet" href="https://design-system.joenguyen.ca/design-system.css">

<!-- Shared layout helpers: apiRequest, escapeHtml, date keys, theme
     toggle/boot, showStatus, dsConfirm/dsPrompt, installNavHotkeys
     (⌘1..9 sidebar nav), mobile menu wiring — see "JS helpers" below.
     Loaded by every app layout right after design-system.css. -->
<script src="https://design-system.joenguyen.ca/shared-core.js"></script>

<!-- Modal verbs + keys: openModal/closeModal, [data-modal-close],
     Esc to close, Enter to fire the primary action. Every app. -->
<script src="https://design-system.joenguyen.ca/modal-keys.js"></script>

<!-- Apps dock + theme toggle in the sidebar footer. Every app. -->
<script src="https://design-system.joenguyen.ca/apps-launcher.js" defer></script>

<!-- Optional: shared session-card / vitals-chip / daily-summary-modal renderer
     (apps that show sessions + vitals: base and fitness) -->
<script src="https://design-system.joenguyen.ca/session-render.js"></script>

<!-- Optional: shared goal-detail helpers (base and fitness) -->
<script src="https://design-system.joenguyen.ca/goal-render.js"></script>
```

Set `data-app` on `<html>` to pick the per-app accent:

| `data-app` | App | Accent |
|---|---|---|
| `base` | Base | slate |
| `budgeter` | Budgeter | green |
| `fitness` | Fitness | orange |
| `mealplanner` | Meal Planner | purple |
| `upkeep` | Upkeep | blue |
| `postings` | Postings | crimson |

For local dev against the un-published version of these files, run a static server inside this repo (e.g. `python3 -m http.server 8765`) and point your app's stylesheet/script tags to `http://localhost:8765/...`. All six Rails layouts support this via the `DS_BASE` env var (`DS_BASE=http://localhost:8765 bin/rails server`); unset, they default to the CDN.

## Publishing changes

Push to `main`. Cloudflare Workers Static Assets auto-deploys the repo root (configured in `wrangler.jsonc`). `_headers` sets `Cache-Control: public, no-cache` for all paths: browsers keep a cached copy but revalidate on every use via ETag (Workers Static Assets serves strong ETags, so unchanged files are cheap 304s). Changes propagate to all apps on the next page load — no manual cache purge, no version param, no hard refresh. Was `max-age=43200` until 2026-08-21, which left up to a 12h stale window after a push (bit the mealplanner `.cal-*` rollout). Migrated off jsDelivr on 2026-05-07 (jsDelivr's 7-day `@main` cache was blocking propagation).

## Apps using this system

- **Base** — base.joenguyen.ca
- **Budgeter** — budgeter.joenguyen.ca
- **Fitness** — fitness.joenguyen.ca
- **Meal Planner** — mealplanner.joenguyen.ca
- **Upkeep** — upkeep.joenguyen.ca
- **Postings** — postings.joenguyen.ca

All six are server-rendered ERB with vanilla JS (no Turbo, no Stimulus) and load these files with `no-cache`, so a push to `main` is live in every app on its next page load. Treat every change as a production deploy to six apps: add, don't rename or restyle.

## Features

- Light/dark theme toggle via `data-theme` attribute (both first-class)
- Radix Colors paired light/dark scales, inlined in the stylesheet (`@radix-ui/colors@3.0.0`, no CDN request) — semantic tokens (`--bg`, `--panel`, `--border`, `--text`, `--{color}-{1..12}`)
- Per-app accent via `data-app` attribute
- Responsive sidebar layout with mobile menu
- Component classes: `.card`, `.btn`, `.form-control`, `.table`, `.modal`, `.badge`, `.stat-card`, `.insight-card`, `.dropdown`, `.toolbar`, `.table-responsive`, `.card-stack`, `.danger-zone`, `.row-actions`, `.filter-chip`
- `dsConfirm(message, opts)` in shared-core.js — styled Promise-based confirm; auto-wired into `data-turbo-confirm`. New code never calls native `confirm()`; `dsPrompt(message, opts)` is its sibling for native `prompt()`
- Session/calendar widgets: `.session-card` (with `.session-type-*` color variants), `.session-done` indicator, `.sleep-chip`, `.vitals-chip`, `.vitals-modal-grid`, `.session-done-mark` — all driven by [`session-render.js`](session-render.js)
- Goal-detail screen (base + fitness): `.target-band`, `.plan-row` / `.plan-item` / `.plan-expand`, `.pe-*`, `.notes-text` — the **Goal pages** section of the stylesheet, driven by [`goal-render.js`](goal-render.js)
- Mobile-first breakpoints (768px, 1024px)

## JS helpers

Everything below is a global from `shared-core.js` unless noted. Use these instead of writing a page-local copy — each one replaced several.

| Helper | What it does |
|---|---|
| `apiRequest(url, options)` | JSON fetch; resolves with the parsed body, throws `Error("HTTP error! status: N")` on a non-2xx. Sends `X-CSRF-Token` (from the `csrf-token` meta) on same-origin non-GET requests; a `FormData` body is sent without a JSON content type. The thrown error carries `.status`, `.data` (parsed error body) and `.serverMessage`. Options: `accept: 'json'`, `csrf: false`, `serverErrorMessage: true` (make `error.message` the server's message). App-wide: `apiRequest.defaults.serverErrorMessage = true`. |
| `escapeHtml(value)` | Escapes `& < > " '`; `null`/`undefined` → `''`. |
| `todayKey()` | Today as `YYYY-MM-DD` in the browser's **local** zone. Never use `new Date().toISOString()` for this — it is UTC and shows tomorrow in the evening. |
| `dateKey(date)`, `monthKey(date)` | `YYYY-MM-DD` / `YYYY-MM` for a `Date`, local. |
| `localDateTimeValue(date)` | `YYYY-MM-DDTHH:MM` for `<input type="datetime-local">`. |
| `formatDate(dateString, opts)` | `Monday, July 6, 2026`; with `{ short: true }` (or `'short'`) → `Jul 6, 2026`. App-wide: `formatDate.defaults.short = true`. |
| `shortDate(dateString)` | `Jul 6`. |
| `cssToken(name, fallback)` | A `:root` custom property as a trimmed string, for Chart.js/Leaflet colours: `cssToken('green-9', '#30A46C')`. Returns the fallback when the read is empty (stylesheet not applied yet). |
| `dsConfirm(message, opts)` | `Promise<boolean>`. `opts`: `title`, `confirmLabel`, `cancelLabel`, `danger` (default true). |
| `dsPrompt(message, opts)` | `Promise<string\|null>` — the text on OK, `null` on cancel. `opts`: `title`, `value`, `placeholder`, `confirmLabel`, `cancelLabel`, `danger` (default false), `multiline`. |
| `showStatus(divId, message, type)` | Shows a page's own `.status-message` div; success hides after 3s. |
| `dsToast(message, type, ms)` | A toast that needs no div in the page. `type`: `success` (default), `error`, `info`, `warning`. |
| `dsCopy(text)` | Copies to the clipboard → `Promise<boolean>`. |
| `[data-copy-text="…"]`, `[data-copy-target="<selector>"]` | Markup-only copy button: copies the literal text, or the target's value/text, and toasts "Copied" (`data-copy-label` to change it). |
| Flash auto-dismiss | A `.status-message.status-success` visible at page load hides after 3s; errors stay. No layout script needed. |
| `openModal(id)`, `closeModal(id)` *(modal-keys.js)* | Add/remove `modal-open`; fire `modal:open` / `modal:close` on the modal. Esc closes the topmost modal through the same path, so `modal:close` fires for it too. |
| `[data-modal-close]` *(modal-keys.js)* | Closes the modal it sits in, or the one it names. |
| `.modal[data-backdrop-close]` *(modal-keys.js)* | Opt-in: a click on the scrim closes the modal. |
| `GoalRender.*` *(goal-render.js)* | `shortMonthDay`, `parseGoalValue`, `formatMinutes`, `togglePlan`, `toggleNotes`. |
| `SessionRender.*` *(session-render.js)* | Session cards, vitals chip, plan tables — see the file header. |
| `installFilterTags(el, opts)` | The list-page filter bar: a committed term becomes a tag. The "+ Filter" button passed as `builderButton` takes `class="btn btn-secondary btn-sm filter-tags-add"` — no inline height. A text or enum field can set `exact: true`. |
| `filterTagsMatch(row, tags, get)` | Client-side matcher for pages that hold their own rows. Strings match as substrings, except fields declared `exact: true` (`type:running` then no longer matches `indoor_running`). |
| `installNavHotkeys`, `initSettingsPanes`, `enhanceFileInputs`, `toggleTheme` | See the header of [`shared-core.js`](shared-core.js). |

## Page conventions

Apps that share this system also share a set of layout/markup/copy conventions so screens feel like the same product. **Read [section 13 of `brand-guide.md`](brand-guide.md#13-page-conventions) before building or modifying any page.** Key rules:

- Stack of `<div class="card" style="margin-bottom:16px">` sections — never `1rem`/`1.5rem`/`12px`/`20px`
- Each section: `<h3>` (sentence case) + `<p class="card-subtitle">` description + content + `.toolbar` action row. `.card-subtitle` is the class for muted description copy; `.stat-label` is only the UPPERCASE micro-label on stat tiles
- Buttons: only `btn-primary` / `btn-secondary` / `btn-ghost` / `btn-danger`. `btn-success`, `btn-error` and `btn-cta` no longer exist in the stylesheet
- Modal actions: always in `.modal-footer` (right-aligned, plain `btn`), affirmative action rightmost, cancel to its left, destructive far-left via `margin-right:auto`; in-card rows are the mirror (primary first, left, `btn-sm`)
- Row/chip/field remove `×` inside an uncommitted form: `btn-ghost`, no confirm; `btn-danger` = persisted destruction, always confirmed
- Numbers: mono + tabular-nums; `var(--red-11)` for outflow, `var(--green-11)` for inflow; unicode minus `−` not hyphen
- Tables wrapped in `.table-responsive`; shared `<colgroup>` widths when stacked across cards
- Color tokens: Radix scale only (`var(--green-9)`), never legacy aliases (`var(--success-500)`, `var(--hover-bg)`, `var(--color-bg)`, `var(--color-border)` — those are forbidden and have all been swept from the production apps)
- Emoji: only the functional symbols whitelisted in the brand guide (✓ ✕ ⋮ × ← → ☰ ☀ stars `−` `·` `–` ▲ + the vitals chip's 😴 ❤️ 🚶). Decorative emoji (📊📄💾🗑️⚠️📥 etc.) do not appear in headings or button labels — use `.badge` + `.color-dot` for categorical signaling.
- Concept explainers in settings use a grid of accent-bordered cards + small nested-bullet diagram, not `<pre>` ASCII trees or `<code>`-heavy bullet lists

## Mobile Design Rules

All pages must render at **375px wide (iPhone SE)** with **zero horizontal
scrolling at the page level**. A rule-of-thumb check in the browser console:

```js
document.documentElement.scrollWidth === document.documentElement.clientWidth
```

### The rules

1. **No fixed widths on text inputs or containers.** Replace `width: 250px`
   with `flex: 1; min-width: 180px` (or similar). Hard-coded pixel widths
   break at 375px.

2. **Wrap any `<table>` in `.table-responsive`.** Tables have intrinsic
   minimum widths based on content — let them scroll internally rather
   than pushing the whole page wider.

   ```html
   <div class="table-responsive">
     <table class="table">...</table>
   </div>
   ```

3. **Use `.toolbar` for page-header control rows.** It's a flex row with
   `flex-wrap: wrap` baked in, so filter buttons and action buttons reflow
   onto new lines instead of overflowing.

   ```html
   <div class="toolbar">
     <div class="toolbar-start">
       <button class="btn btn-sm">All</button>
       <button class="btn btn-sm">Active</button>
       <select class="form-control">...</select>
     </div>
     <div class="toolbar-end">
       <button class="btn btn-primary">+ Add</button>
     </div>
   </div>
   ```

4. **Grids must collapse on mobile.** Any `grid-template-columns` of 3+
   fixed columns needs a `@media (max-width: 768px)` rule that drops to
   1–2 columns. The design system already handles `.stats-grid`,
   `.auto-grid` and `.dash-side-by-side`; app-specific grids are the
   app's responsibility.

5. **Calendar / month-grid views → switch to a week list on mobile.**
   A 7-column grid squeezed into 375px produces unreadable cells. Fitness
   app pattern: render a vertical per-day list on `max-width: 768px`,
   keep Prev/Next controls, navigate by week instead of month. See
   `fitness/app/views/pages/calendar.html.erb` for the reference
   implementation.

6. **No `white-space: nowrap` on long content outside a scroll
   container.** Long titles, URLs, and key/value pairs should wrap.
   Tokens that must stay on one line (API keys, IDs) go in a
   `.table-responsive` / `overflow-x: auto` wrapper.

7. **Session-type badges, chips, and filter rows use `flex-wrap: wrap`
   with a gap.** Don't rely on horizontal scroll for primary navigation
   controls — users will miss the overflow.

### How to verify

At viewport 375×812 (iPhone SE preset), walk every page in the app and
run the overflow check. Record any offenders, then apply the rules
above. The fitness app audit (2026-04-23) caught `/goals` and
`/exercises` — both fixed by applying rules #1–#3.
