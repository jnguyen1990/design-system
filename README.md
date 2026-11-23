# Design System

Shared CSS design system for Joe Nguyen's self-hosted web applications. Provides consistent theming, component styles, and responsive layout across all apps.

## v4.4 — Linear meets Things 3

Sharp, precise, technical. Inter + Geist Mono (self-hosted in `fonts/`), Radix Colors (slate neutral, per-app accent), 7/9 px corners, minimal motion. **v4.4 (2026-11-23, Joe's M1 B + M2 picks):** one flat white sheet with hairline sections (only the sidebar is tinted), a quieter sidebar, mono only for numbers, sentence-case micro-labels, a 1200px content measure, a floating tab bar + "More" sheet on phones (rendered by the gem's engine shell), and stacked-table card rows. v4.3 (2026-11-23) is the accessibility, mobile and safety-net release: AA solid buttons and focus rings, dialog focus management, a 44px touch floor, 16px mobile inputs, empty/loading/print/chart/keyboard components, layout primitives, and `scripts/check.mjs`. See [`brand-guide.md`](brand-guide.md) for the full spec.

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

For local dev against the un-published version of these files, run `python3 scripts/serve.py 8765` in this repo. Not plain `python3 -m http.server`: the self-hosted fonts load cross-origin from the app's port, and that server sends no `Access-Control-Allow-Origin`, so Inter and Geist Mono are refused and the system fallback fonts show; `serve.py` is the same server plus that header and point your app's stylesheet/script tags to `http://localhost:8765/...`. All six Rails layouts support this via the `DS_BASE` env var (`DS_BASE=http://localhost:8765 bin/rails server`); unset, they default to the CDN.

## Publishing changes

Push to `main`. Cloudflare Workers Static Assets auto-deploys the repo root (configured in `wrangler.jsonc`). `_headers` sets `Cache-Control: public, no-cache` for all paths: browsers keep a cached copy but revalidate on every use via ETag (Workers Static Assets serves strong ETags, so unchanged files are cheap 304s). Changes propagate to all apps on the next page load — no manual cache purge, no version param, no hard refresh. Was `max-age=43200` until 2026-08-21, which left up to a 12h stale window after a push (bit the mealplanner `.cal-*` rollout). Migrated off jsDelivr on 2026-05-07 (jsDelivr's 7-day `@main` cache was blocking propagation).

### Before you push: `scripts/check.mjs`

There is no CI between `main` and six production apps, so run the check by
hand before every push (the repo has no git-hooks convention, so it is not
installed as a hook):

```bash
/usr/local/bin/mise exec node@22 -- node scripts/check.mjs           # every kit
/usr/local/bin/mise exec node@22 -- node scripts/check.mjs budgeter  # kits whose path matches
```

It renders each `claude-design-export/ui_kits/*/*.html` from the working
tree (CDN URLs are answered from local files) in light and dark at 1440px
and 375px, writes a screenshot per render (`$TMPDIR/ds-check`, or
`CHECK_OUT=…`), and fails on any broken invariant: theme boot and
`color-scheme`, one `<h1>`, a chevron on `select.form-control`,
`<a class="btn">` hover keeping its colour, the modal entry animation,
dialog role/focus-in/focus-restore, `dsConfirm` focusing Cancel, AA
contrast for primary/danger buttons, `--text-faint` and the focus ring,
`.sr-only`, label association, `aria-current` on the active nav link, the
self-hosted fonts loading with no Google Fonts / jsDelivr request, and at
375px: 16px inputs, 44px controls under touch, and nothing past the
viewport outside `.table-responsive`. Exit code 0 is a pass. It needs
Google Chrome and `playwright-core` (it uses `~/Repos/mini/browser_sweep`'s
copy, or `PLAYWRIGHT_CORE=…`). Add an invariant whenever a regression slips
through.

`.assetsignore` keeps `tmp/`, docs, `scripts/`, the scraps and the Claude
config off the CDN.

## Apps using this system

- **Base** — base.joenguyen.ca
- **Budgeter** — budgeter.joenguyen.ca
- **Fitness** — fitness.joenguyen.ca
- **Meal Planner** — mealplanner.joenguyen.ca
- **Upkeep** — upkeep.joenguyen.ca
- **Postings** — postings.joenguyen.ca

All six are server-rendered ERB with vanilla JS (no Turbo, no Stimulus) and load these files with `no-cache`, so a push to `main` is live in every app on its next page load. Treat every change as a production deploy to six apps: add, don't rename or restyle.

## Features

- Light/dark theme via `data-theme` (both first-class). With nothing saved, the boot follows the OS (`prefers-color-scheme`; dark when the OS has no preference). `toggleTheme()` fires `ds:themechange`. `color-scheme` follows the theme. Pages print light.
- Radix Colors paired light/dark scales, inlined in the stylesheet (`@radix-ui/colors@3.0.0`, no CDN request) — semantic tokens (`--bg`, `--panel`, `--border`, `--text`, `--{color}-{1..12}`)
- Per-app accent via `data-app` attribute
- Responsive sidebar layout with mobile menu
- Component classes: `.card`, `.btn`, `.form-control`, `.table`, `.modal`, `.badge`, `.stat-card`, `.insight-card`, `.dropdown`, `.toolbar`, `.table-responsive`, `.card-stack`, `.danger-zone`, `.row-actions`, `.filter-chip`, `.empty-state`, `.skeleton`, `.sr-only`
- Layout primitives: `.stack` (`.stack-sm`, `.stack-lg`), `.cluster` (`.cluster-between`, `.cluster-end`), `.columns-2`, `.columns-aside`, plus `m-0`, `mt/mb-{0,1,2,3,4,5,6,8}`, `gap-{1..6}`. Use them instead of inline `style=""`.
- Tokens added in v4.3: `--accent-solid` / `--accent-on` (+ `-hover`, `-active`) and `--danger-solid` / `--danger-on` for any fill that carries text; `--text-2xs` (11px); `--space-1_5` (6px), `--space-2_5` (10px); the layer scale `--z-raised … --z-toast`; `--viz-1…8`, `--viz-grid`, `--viz-axis`. Removed: the whole v2.1 alias block (see brand-guide "Removed").
- Print: chrome hidden, cards unsplit, tables in full; `.no-print`, `.print-only`.
- `dsConfirm(message, opts)` in shared-core.js — styled Promise-based confirm; auto-wired into `data-turbo-confirm`. New code never calls native `confirm()`; `dsPrompt(message, opts)` is its sibling for native `prompt()`
- Session/calendar widgets: `.session-card` (with `.session-type-*` color variants), `.session-done` indicator, `.sleep-chip`, `.vitals-chip`, `.vitals-modal-grid`, `.session-done-mark` — all driven by [`session-render.js`](session-render.js)
- Goal-detail screen (base + fitness): `.target-band`, `.plan-row` / `.plan-item` / `.plan-expand`, `.pe-*`, `.notes-text` — the **Goal pages** section of the stylesheet, driven by [`goal-render.js`](goal-render.js)
- Mobile-first breakpoints (768px, 1024px); 16px inputs under 768px; 44px controls under `(pointer: coarse)` (via `--control-h`); safe-area insets and `dvh`

## JS helpers

Everything below is a global from `shared-core.js` unless noted. Use these instead of writing a page-local copy — each one replaced several.

| Helper | What it does |
|---|---|
| `apiRequest(url, options)` | JSON fetch; resolves with the parsed body, throws `Error("HTTP error! status: N")` on a non-2xx. Sends `X-CSRF-Token` (from the `csrf-token` meta) on same-origin non-GET requests; a `FormData` body is sent without a JSON content type. The thrown error carries `.status`, `.data` (parsed error body) and `.serverMessage`. Options: `accept: 'json'`, `csrf: false`, `serverErrorMessage: true` (make `error.message` the server's message), `busy: el` (that element is `aria-busy` while the request runs — pair with `.skeleton`). App-wide: `apiRequest.defaults.serverErrorMessage = true`. |
| `escapeHtml(value)` | Escapes `& < > " '`; `null`/`undefined` → `''`. |
| `todayKey()` | Today as `YYYY-MM-DD` in the browser's **local** zone. Never use `new Date().toISOString()` for this — it is UTC and shows tomorrow in the evening. |
| `dateKey(date)`, `monthKey(date)` | `YYYY-MM-DD` / `YYYY-MM` for a `Date`, local. |
| `localDateTimeValue(date)` | `YYYY-MM-DDTHH:MM` for `<input type="datetime-local">`. |
| `formatDate(dateString, opts)` | `Monday, July 6, 2026`; with `{ short: true }` (or `'short'`) → `Jul 6, 2026`. App-wide: `formatDate.defaults.short = true`. |
| `shortDate(dateString)` | `Jul 6`. |
| `cssToken(name, fallback)` | A `:root` custom property as a trimmed string, for Chart.js/Leaflet colours: `cssToken('green-9', '#30A46C')`. Returns the fallback when the read is empty (stylesheet not applied yet). |
| `dsConfirm(message, opts)` | `Promise<boolean>`. `opts`: `title`, `confirmLabel`, `cancelLabel`, `danger` (default true — Cancel then takes focus, so Enter never fires the destructive action). |
| `dsPrompt(message, opts)` | `Promise<string\|null>` — the text on OK, `null` on cancel. `opts`: `title`, `value`, `placeholder`, `confirmLabel`, `cancelLabel`, `danger` (default false), `multiline`. |
| `showStatus(divId, message, type)` | Shows a page's own `.status-message` div; success hides after 3s. |
| `dsToast(message, type, ms)` | A toast that needs no div in the page. `type`: `success` (default), `error`, `info`, `warning`. The third (or second) argument may be `{ms, action: {label, onClick}}`: the action is a button in the toast ("Undo"), runs once, and the toast stays 6s. |
| `dsEmptyState(text, opts)` | HTML for an `.empty-state`: `opts.icon` (a nav icon name), `opts.action` (trusted HTML), `opts.compact`. `text` is escaped. |
| `dsChartTheme()` | `{palette, grid, axis, text, surface, border, font, mono}` from the `--viz-*` and surface tokens. With Chart.js present it sets `Chart.defaults` and from then on re-themes live charts on `ds:themechange`. Use `palette[i]` in order; never cycle past 8. |
| `dsListKeys(container, opts)` | j/k list keyboard: `rows` (selector), `keys` (`{c: row => …}`), `onEnter(row)` (default: the row's `[data-row-open]` or first link), `search` (selector focused by `/`), `arrows`, `onFocus`. Returns `{focus, current, clear, destroy}`. The focus row gets `.is-key-focus`. |
| `dsEnhanceLabels(root)` | Points a `.form-group`'s lone `<label>` at its lone text control. Runs on load and on every modal open; call it after inserting a form by hand. |
| `ds:themechange` event | Fired on `document` by `toggleTheme()` and by an OS scheme change (when no theme is saved); `detail.theme` is `light` or `dark`. |
| `dsCopy(text)` | Copies to the clipboard → `Promise<boolean>`. |
| `[data-copy-text="…"]`, `[data-copy-target="<selector>"]` | Markup-only copy button: copies the literal text, or the target's value/text, and toasts "Copied" (`data-copy-label` to change it). |
| Flash auto-dismiss | A `.status-message.status-success` visible at page load hides after 3s; errors stay. No layout script needed. |
| `openModal(id)`, `closeModal(id)` *(modal-keys.js)* | Add/remove `modal-open`; fire `modal:open` / `modal:close` on the modal. Esc closes the topmost modal through the same path, so `modal:close` fires for it too. Any open `.modal` (however it was opened) gets `role="dialog"`, `aria-modal`, `aria-labelledby` (its `.modal-title` or first heading), focus moved to its first field, Tab trapped inside, and focus returned to the opener on close. |
| `[data-modal-close]` *(modal-keys.js)* | Closes the modal it sits in, or the one it names. |
| `.modal[data-backdrop-close]` *(modal-keys.js)* | Opt-in: a click on the scrim closes the modal. |
| `GoalRender.*` *(goal-render.js)* | `shortMonthDay`, `parseGoalValue`, `formatMinutes`, `togglePlan`, `toggleNotes`. |
| `SessionRender.*` *(session-render.js)* | Session cards, vitals chip, plan tables — see the file header. |
| `installFilterTags(el, opts)` | The list-page filter bar: a committed term becomes a tag. The "+ Filter" button passed as `builderButton` takes `class="btn btn-secondary btn-sm filter-tags-add"` — no inline height. A text or enum field can set `exact: true`. |
| `filterTagsMatch(row, tags, get)` | Client-side matcher for pages that hold their own rows. Strings match as substrings, except fields declared `exact: true` (`type:running` then no longer matches `indoor_running`). |
| `installNavHotkeys`, `initSettingsPanes`, `enhanceFileInputs`, `toggleTheme` | See the header of [`shared-core.js`](shared-core.js). |
| `dsSheet(id, open)` | Open/close a `.sheet` bottom sheet. Markup buttons use `[data-sheet-toggle][aria-controls="<id>"]` instead. |
| Automatic | `aria-current="page"` on `.nav-link.active`; `aria-label`/`aria-expanded` on `#mobileMenuBtn`; Esc closes the mobile drawer; the "More" sheet's focus trap / Esc / scrim; print uses the light theme. |

## Page conventions

Apps that share this system also share a set of layout/markup/copy conventions so screens feel like the same product. **Read [section 13 of `brand-guide.md`](brand-guide.md#13-page-conventions) before building or modifying any page.** Key rules:

- Stack of `<div class="card" style="margin-bottom:16px">` sections — never `1rem`/`1.5rem`/`12px`/`20px`
- Each section: `<h3>` (sentence case) + `<p class="card-subtitle">` description + content + `.toolbar` action row. `.card-subtitle` is the class for muted description copy; `.stat-label` is only theASE micro-label on stat tiles
- Buttons: only `btn-primary` / `btn-secondary` / `btn-ghost` / `btn-danger`. `btn-success`, `btn-error` and `btn-cta` no longer exist in the stylesheet
- Modal actions: always in `.modal-footer` (right-aligned, plain `btn`), affirmative action rightmost, cancel to its left, destructive far-left via `margin-right:auto`; in-card rows are the mirror (primary first, left, `btn-sm`)
- Row/chip/field remove `×` inside an uncommitted form: `btn-ghost`, no confirm; `btn-danger` = persisted destruction, always confirmed
- Numbers: mono + tabular-nums; `var(--red-11)` for outflow, `var(--green-11)` for inflow; unicode minus `−` not hyphen
- Tables wrapped in `.table-responsive`; shared `<colgroup>` widths when stacked across cards
- Color tokens: Radix scale only (`var(--green-9)`), never legacy aliases (`var(--success-500)`, `var(--hover-bg)`, `var(--color-bg)`, `var(--color-border)` — those are forbidden and have all been swept from the production apps)
- Emoji: only the functional symbols whitelisted in the brand guide (✓ ✕ ⋮ × ← → ☰ ☀ stars `−` `·` `–` ▲ + the vitals chip's 😴 ❤️ 🚶). Decorative emoji (📊📄💾🗑️⚠️📥 etc.) do not appear in headings or button labels — use `.badge` + `.color-dot` for categorical signaling.
- Concept explainers in settings use a grid of accent-bordered cards + small nested-bullet diagram, not `<pre>` ASCII trees or `<code>`-heavy bullet lists

## Mobile tab bar and stacked tables (v4.4)

**Tab bar.** Apps on the engine shell (personal_app_client 0.8.0) get it from `nav_items`: the first four (or `tab: true` ones; `tab: false` keeps one out; `tab_count`, `tab_bar: false` in the gem config) plus More. Markup, for a page that is not on the shell:

```html
<nav class="tab-bar" aria-label="Tabs">                       <!-- a direct child of <body> -->
  <a href="/" class="tab-bar-item active" aria-current="page">
    <span class="tab-bar-ico"><span class="nav-ico" data-ico="grid"></span></span>
    <span class="tab-bar-label">dashboard</span></a>
  …
  <button type="button" class="tab-bar-item" data-sheet-toggle aria-controls="more-sheet"
          aria-expanded="false" aria-haspopup="dialog">
    <span class="tab-bar-ico"><span class="nav-ico" data-ico="more"></span></span>
    <span class="tab-bar-label">More</span></button>
</nav>
<div class="sheet-scrim" hidden></div>
<div class="sheet" id="more-sheet" role="dialog" aria-modal="true" aria-label="More" hidden>
  <div class="sheet-handle" aria-hidden="true"></div>
  <ul class="nav-menu"><li><a class="nav-link" href="/settings">…</a></li></ul>
  <div class="sheet-sec">Apps</div><div class="sheet-dock"></div>   <!-- apps-launcher.js fills it -->
</div>
```

When `body > .tab-bar` exists, the hamburger and overlay hide below 768px, the main column gets bottom padding and toasts sit above the bar. Without it (postings) the hamburger + drawer work as before.

**Stacked tables.** Below 768px, opt in per table; desktop is untouched:

```html
<table class="table-stack">                       <!-- generic card rows -->
  <tr><td data-cell="select">…</td><td data-cell="title">Costco</td><td data-cell="actions">⋮</td>
      <td data-label="Amount" class="td-amount">−$720.03</td><td data-cell="hide">Sep 22</td></tr>
  <tr class="row-section"><td>Bills</td><td>$1,200</td></tr>   <!-- a section label, not a card -->

<table class="table-stack table-stack--days">     <!-- day-grouped ledger -->
  <tr class="stack-day"><td colspan="8"><span>Tue, Sep 22</span><span class="stack-day-total">−$755.92</span></td></tr>
  <tr><td data-cell="title">…</td><td data-cell="amount">…</td><td data-cell="meta">badge</td><td data-cell="aside">Amex</td><td>hidden on phones</td></tr>
```

`scripts/check.mjs` asserts both at 375px.

## Mobile Design Rules

All pages must render at **375px wide (iPhone SE)** with **zero horizontal
scrolling at the page level**. The check, in the browser console:

```js
document.body.scrollWidth <= window.innerWidth
```

Measure `body`, not `documentElement`: the design system sets
`html, body { overflow-x: hidden }` under 768px, which clips the overflow
and makes `documentElement.scrollWidth === clientWidth` true even when half
the content is unreachable. For a stricter check, list elements whose
`getBoundingClientRect().right` exceeds `window.innerWidth` outside a
`.table-responsive`. `scripts/check.mjs` does both for the kits.

Also under 768px: text-like inputs are 16px (iOS zooms on anything
smaller), and under `(pointer: coarse)` controls are 44px tall
(`--control-h`), so never hard-code a control height.

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
