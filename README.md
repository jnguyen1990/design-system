# Design System

Shared CSS design system for Joe Nguyen's self-hosted web applications. Provides consistent theming, component styles, and responsive layout across all apps.

## v3.0 — Linear meets Things 3

Sharp, precise, technical. Inter + Geist Mono, Radix Colors (slate neutral, per-app accent), 4/6/8 px corners, flat surfaces, minimal motion. See [`brand-guide.md`](brand-guide.md) for the full spec.

## Usage

Include via CDN in your HTML:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/jnguyen1990/design-system@main/design-system.css">
```

Set `data-app` on `<html>` to pick the per-app accent: `base` (slate), `budgeter` (green), `fitness` (orange), `mealplanner` (purple).

## Apps Using This System

- **Base** — base.joenguyen.ca
- **Budgeter** — budgeter.joenguyen.ca
- **Fitness** — fitness.joenguyen.ca
- **Meal Planner** — upcoming

## Features

- Light/dark theme toggle via `data-theme` attribute (both first-class)
- Radix Colors paired light/dark scales — semantic tokens (`--bg`, `--panel`, `--border`, `--text`)
- v2.1 var/class compat layer — existing app templates work unchanged
- Per-app accent via `data-app` attribute
- Responsive sidebar layout with mobile menu
- Component classes: `.card`, `.btn`, `.form-control`, `.table`, `.modal`, `.badge`, `.stat-card`, `.app-card`, `.insight-card`, `.dropdown`, etc.
- Mobile utilities: `.toolbar`, `.table-responsive`
- Mobile-first breakpoints (768px, 1024px)

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
   1–2 columns. The design system already handles `.stats-grid` and
   `.app-grid`; app-specific grids are the app's responsibility.

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
