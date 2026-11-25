# Joe's Personal Apps — Design System

A unified design language for a constellation of self-hosted personal apps (**Base**, **Budgeter**, **Fitness**, **Mealplanner**, **Upkeep**, **Postings**, and future projects). The aesthetic is **Linear-meets-Things-3, v4**: sharp and precise with product polish — elevated cards on a tinted page, mono numbers, accent-tinted chrome moments. Every pixel earns its place.

---

## Sources

- **Brand spec** — provided directly in the project brief (the canonical document; treat this README as a faithful expansion).
- **Codebase** — none attached.
- **Figma** — none attached.
- **Slide template** — none attached.

If a codebase or Figma exists, re-attach it via the Import menu so UI kits can be reconciled against real components.

---

## Index

| File / folder | What it is |
|---|---|
| `README.md` | This document — brand context, content, visual & icon foundations |
| `preview/` | Design System tab cards (swatches, type specimens, components, etc) |
| `assets/` | Logos, favicons, illustration tints |
| `ui_kits/base/` | Base — slate (neutral), today view |
| `ui_kits/budgeter/` | Budgeter — green accent, transaction ledger + add-transaction form |
| `ui_kits/fitness/` | Fitness — orange accent, training week |
| `ui_kits/mealplanner/` | Mealplanner — purple accent, recipe list with the filter bar |
| `ui_kits/upkeep/` | Upkeep — blue accent, garage (stat tiles + item cards) |
| `ui_kits/postings/` | Postings — crimson accent, postings table with the filter bar |
| `slides/` | Sample slide deck template (cover, agenda, big quote, comparison, etc) |
| `SKILL.md` | Agent Skill manifest (works in Claude Code) |
| `../design-system.css` | **Canonical shared stylesheet** — token layer + every component two or more apps use. Link from each HTML page via the CDN URL below. |
| `../apps/<app>.css` | Styles only that app uses (round three, PLAT-27); a page links it right after `design-system.css`. |
| `../brand-guide.md` | Human-readable spec for the token layer |

---

## Products at a glance

| App | Accent | Purpose |
|---|---|---|
| **Base** | `slate` (system default) | Today, goals, reminders. Neutral. |
| **Budgeter** | `green` | Transactions, accounts, budgets. |
| **Fitness** | `orange` | Workout log, lifts, sessions. |
| **Mealplanner** | `purple` | Recipes, week plan, grocery list. |
| **Upkeep** | `blue` | Maintenance for vehicles, house, gear. |
| **Postings** | `crimson` | Job postings found by a nightly sweep. |
| Future apps | one Radix accent each, no repeats | TBD |

The shared **chrome** stays neutral across all apps. The brand accent appears in the logo, favicon, empty-state tint, onboarding, loading states — and (v4) in five chrome moments: primary button, active nav item, focus ring, text selection, checked controls. Nowhere else in chrome.

---

## CONTENT FUNDAMENTALS

The product **sounds like a tool**, not a product. No marketing voice, no emoji, no exclamation points.

### Tone
- **Direct.** Say what's true; skip the hedge.
- **Sober.** No "Awesome!", no "Welcome back ✨", no rallying.
- **Functional.** Copy describes the system's state or the user's next action — nothing more.

### Casing (v4)
- **Sentence case everywhere**: `New entry`, `Today`, `Archive`, `Apr 22 · Amex`. The v3 lowercase-labels rule is retired.
- **Micro-labels are sentence case (v4.4)**: table headers (`thead th`) and stat labels (`.stat-label`) are 12px medium muted, no tracking. The old UPPERCASE instrument-panel signature is retired.
- **Sentence case** — never Title Case — for buttons, menus, headings: `Add transaction`, not `Add Transaction`.
- `.td-date` applies `text-transform: capitalize`, so lowercase strftime output renders as `Apr 22` for free.
- Acronyms keep their case: `CSV`, `ID`, `USD`.

### Person
- **You** for the reader (`You haven't logged a workout this week.`)
- **Avoid "I"** — the app doesn't have a personality.
- **Avoid "we"** — there is no "we"; this is a personal tool, not a SaaS.

### Examples — do this / not that

| ✗ Don't | ✓ Do |
|---|---|
| `Welcome back, Joe! 👋` | `Today` |
| `Please enter an amount` | `Amount required` |
| `Successfully saved!` | (silent — toast only on failure) |
| `Oops, something went wrong.` | `Save failed. Network unreachable.` |
| `Your Awesome Dashboard` | `Overview` |
| `Click here to add a new transaction` | `+ New transaction` |
| `No items yet — let's add one!` | `No entries.` |

### Empty states
One short line. **No illustration.** No CTA button unless the action is the only obvious next step.

> `No transactions this month.`
> `Inbox empty.`
> `0 workouts logged.`

### Errors
Name what's wrong, not what to do. The user can usually figure out the fix.

> `Amount required` (not `Please enter an amount`)
> `Date must be in the past` (not `Please choose an earlier date`)
> `Sync failed — last attempt 2m ago` (not `Oh no! Could not sync.`)

### Numbers, IDs, time
Numbers in data — currency, counts, durations, hashes — and keyboard shortcuts are **monospace**, tabular-nums. Metadata (dates in subtitles, timestamps in meta lines) is Inter with tabular figures since v4.4.

> `$1,247.03` · `12:04` · `tx_8f3a` · `⌘K`

### Emoji
**Not used.** Anywhere. Brand accents do the categorical work that emoji might otherwise do.

---

## VISUAL FOUNDATIONS

### Colors
- **Source of truth:** Radix Colors paired light/dark scales.
- **Neutral chrome:** `slate` (slightly cool — `~#fafafa` light, `~#0a0a0a` dark; never pure black or white).
- **12-step intent ladder:** step 1 page bg → step 9 solid accent → step 12 high-contrast text. Memorize it; never invent custom mid-scale colors.
- **Categorical palette** (red/orange/amber/green/teal/blue/indigo/purple/pink) does the organizing work. Used as **dots, badges, and chips** — never as page background or large surface.
- **Per-app accent** appears in logo, onboarding, empty-state tint — and (v4) primary button, active nav, focus ring, selection, checked controls. `--accent-soft`/`--accent-soft-hover` (accent a3/a4 alpha) + `--accent-text` (accent 11) are the chrome-tint tokens.

### Type
- **Inter** for body and UI. Weights: 400/500/600 (never 700+).
- **Geist Mono** for numbers in data, IDs and kbd hints. `font-variant-numeric: tabular-nums` always. Metadata is Inter (v4.4).
- Heading letter-spacing: `-0.01em`. Body line-height `1.5`, headings `1.25`.

### Spacing
- **8px base** with 4px halfsteps for tight UI.
- Density target: **spacious**. Default row/control height **36–40px** (not 28). Never cramped.

### Backgrounds & imagery
- **Flat surfaces only.** No gradients on chrome. No textures, no patterns, no hand-drawn illustrations, no full-bleed photography.
- The only "imagery" is the per-app accent tint behind onboarding and the favicon glyph.
- No hero photos, no marketing illustrations, no stock imagery.

### Animation
- **Minimal.** No springs, no layout animations, no page transitions.
- Three durations only: `120ms` (hover), `160ms` (state change), `200ms` (modal in).
- Easing always `cubic-bezier(0.2, 0, 0, 1)` — sharp start, soft end. Never bounce, never linear.
- Honor `prefers-reduced-motion: reduce`.

### Hover states
- Surfaces: background steps **+1** in the slate scale (e.g. `panel` → `panel-hover` = slate-3 → slate-4).
- Borders: step **+1** (`border` → `border-hover`).
- **Never** opacity changes for hover — opacity reads as "disabled".
- **Never** scale, lift, or shadow growth on hover.

### Press / active states
- Surfaces: step **+1 again** (`panel-active`).
- Solid buttons: shift to next-darker step (`indigo-9` → `indigo-10` hover → `indigo-11` active).
- **No shrink, no scale, no transform.** Just a color shift.

### Borders
- **1px solid** always. Never 2px hairlines, never dashed, never dotted on chrome.
- Default: `--border` (slate-6). Interactive: `--border-hover` (slate-7) on hover. Focus: `--focus-ring` (per-app accent step 11, = `--accent-text`; v4.3) — the input border plus a 1px outline (a 2px ring), and a 2px outline on buttons. Full strength, never alpha-mixed (the old step-7-at-30% ring measured 1.1–1.2:1). Renders indigo by default, green in Budgeter, orange in Fitness, slate in Base.

### Shadows (v4)
- **No resting shadows (v4.4 flat model).** Only floating layers (modal, menu, toast, tab bar, sheet) cast `--shadow-floating`.
- **Floating elements** (popover, dropdown, modal): `--shadow-floating` `0 8px 24px rgba(0,0,0,0.12)` light / `…0.4` dark, on the `--card` surface.
- Solid buttons get an inner highlight (`inset 0 1px 0 rgba(255,255,255,0.12)`) plus tiny press shadow (`0 1px 2px rgba(0,0,0,0.08)`) — Linear-style tactile, never skeuomorphic.
- **No protection gradients.** Floating UI sits on a backdrop scrim instead.

### Layout rules
- **Responsive, 1600px content (2026-11-25; 1200px in v4.4).** Sidebar (240px, the only tinted surface) + one white sheet; content grows to `--content-max` (1600px), left-aligned with the header; prose held to 72ch (`--measure`). Phones get the engine shell's floating tab bar + "More" sheet.
- **Reading views** (settings, long-form notes, account): cap content at **720px**, centered.
- **Main padding:** 32px horizontal, 24px top, more below.
- **Mobile:** all pages render at 375px wide with zero horizontal page-level scroll. Tables wrap, grids collapse to 1–2 cols under 768px.

### Transparency & blur
- **Not used in chrome.** No frosted glass, no backdrop-filter, no translucent panels.
- Modal backdrop is the only translucent surface: `rgba(0,0,0,0.4)` light / `0.6` dark — solid scrim, no blur.

### Corner radii (v4)
- `7px` — buttons, inputs, badges, chips, nav items (`--radius-sm`).
- `9px` — cards, panels, modals, dropdowns (`--radius-md`).
- `12px` — page-level containers (rare, `--radius-lg`).
- **Never** larger than 12px. **No pills.** Checkboxes stay 4px. Use exact circles for avatars/dots.

### Cards (v4.4 — flat sections)
- No fill, no side borders, no radius, no shadow: a top hairline (`--border`) opens each section, 20px above / 24px below, content flush with the page title.
- The **page** takes the subtle tint (`--bg` = slate-2 light / slate-1 dark); cards float above it — inverted from v3.
- Hover only changes border color to `--card-border-hover` (slate-6). Interactive cards add `cursor: pointer`. They do not lift, and shadows never grow on hover.

---

## ICONOGRAPHY

### System
**Lucide** is the canonical icon set. Outline style, `1.5px` stroke, `currentColor` fill (so icons inherit text color and theme automatically).

Loaded via CDN in UI kit pages:
```html
<script src="https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js"></script>
<script>lucide.createIcons();</script>
```

Or as inline React with `lucide-react` if a build step exists.

### Sizes
- **14px** — inline with body text (e.g. icon + label in dense rows)
- **16px** — default UI (buttons, menu items, sidebar items)
- **20px** — page headers, large card affordances
- Larger sizes are **not used inline**. Decorative oversize icons (e.g. an empty-state glyph) are explicitly disallowed by the brand — empty states have no illustration.

### Icon-only buttons
Reserved for **universally understood actions**: `X` (close), `Search`, `Settings`, `MoreHorizontal`. Anything else gets a text label — no `Save`-as-disk-icon, no `Edit`-as-pencil-only.

### Emoji
**Never** used as iconography. Not in labels, not in empty states, not in toasts.

### Unicode characters
Used sparingly for:
- Math/formatting: `·` (middle dot separator), `–` (en dash for ranges), `→` (arrow in helper copy)
- Keyboard symbols: `⌘`, `⌥`, `⇧`, `⌃`, `↵`, `⇥` — always rendered in `.kbd` with Geist Mono

### Logos & brand assets
Each app has a **single-glyph logo** rendered as inline SVG using its accent color at step 9. See `assets/` — favicons and SVG marks only, no marketing-style logo lockups.

### Substitutions flagged
- **Inter** & **Geist Mono** — self-hosted variable woff2 in the repo's `fonts/` (OFL licences beside them), declared with `@font-face` in `design-system.css` since v4.3. No Google Fonts or jsDelivr request.
- **Lucide** — pulled from CDN. No local sprite. Replace with a self-hosted copy if needed.

---

## How to use this system

1. **Link the shared stylesheet on every page, then the app's own** (round three, PLAT-27):
   ```html
   <link rel="stylesheet" href="https://design-system.joenguyen.ca/design-system.css">
   <link rel="stylesheet" href="https://design-system.joenguyen.ca/apps/budgeter.css">
   ```
   Set `<html data-app="budgeter">` to choose the accent (`base`, `budgeter`, `fitness`, `mealplanner`, `upkeep`, `postings`). Load `shared-core.js` after the stylesheet and it applies the saved theme; a page without it sets `data-theme="dark"` itself.
2. **Reach for tokens, not raw Radix:** use `var(--text)` / `var(--panel)` / `var(--border)` / `var(--focus-ring)` — not `var(--slate-12)` directly. The semantic layer is what makes light/dark parity and per-app accent automatic.
3. **One accent per app.** Don't mix per-app accents into shared chrome.
4. **Categorical color comes from chips/dots, not surfaces.** A red row background is wrong; a red dot in a row is right.
5. **Density floor:** 36px controls, 36–40px rows, 16/20/24px card padding; 44×44 tap targets on touch (the `--control-h` tokens do it under `pointer: coarse`).
