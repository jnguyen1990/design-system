# Joe's Personal Apps — Design System

A unified design language for a constellation of self-hosted personal apps (**Base**, **Budgeter**, **Fitness**, and future projects). The aesthetic is **Linear-meets-Things-3**: sharp, precise, technical, with breathing room. Every pixel earns its place.

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
| `colors_and_type.css` | Token layer — Radix imports, type/spacing/radius/motion vars, semantic surface tokens, base element styles |
| `components.css` | Component layer — buttons, inputs, cards, badges, kbd, sidebar items, tables, modals |
| `preview/` | Design System tab cards (swatches, type specimens, components, etc) |
| `assets/` | Logos, favicons, illustration tints |
| `ui_kits/base/` | Base — neutral launcher / cross-app home |
| `ui_kits/budgeter/` | Budgeter — green accent, transaction ledger |
| `ui_kits/fitness/` | Fitness — orange accent, workout log |
| `slides/` | Sample slide deck template (cover, agenda, big quote, comparison, etc) |
| `SKILL.md` | Agent Skill manifest (works in Claude Code) |

---

## Products at a glance

| App | Accent | Purpose |
|---|---|---|
| **Base** | `slate` (system default) | Launcher / cross-app home. Neutral. |
| **Budgeter** | `green` | Transactions, accounts, budgets. |
| **Fitness** | `orange` | Workout log, lifts, sessions. |
| Future apps | one Radix accent each, no repeats | TBD |

The shared **chrome** stays neutral across all apps. The brand accent appears only in the logo, favicon, empty-state tint, onboarding, and loading states — **never** in chrome buttons.

---

## CONTENT FUNDAMENTALS

The product **sounds like a tool**, not a product. No marketing voice, no emoji, no exclamation points.

### Tone
- **Direct.** Say what's true; skip the hedge.
- **Sober.** No "Awesome!", no "Welcome back ✨", no rallying.
- **Functional.** Copy describes the system's state or the user's next action — nothing more.

### Casing
- **Lowercase UI labels** when clarity isn't hurt: `new entry`, `today`, `archive`, `inbox`, `someday`.
- **Sentence case** — never Title Case — for buttons, menus, headings: `Add transaction`, not `Add Transaction`.
- **Sentence case** for page titles too: `Recent activity`, not `Recent Activity`.
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
| `Click here to add a new transaction` | `+ new transaction` |
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
Always **monospace**, always tabular-nums. Currency, counts, durations, timestamps, hashes, keyboard shortcuts. This is non-negotiable — alignment matters.

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
- **Per-app accent** appears in logo + onboarding + empty-state tint only.

### Type
- **Inter** for body and UI. Weights: 400/500/600 (never 700+).
- **Geist Mono** for any data-shaped content: numbers, IDs, timestamps, kbd hints. `font-variant-numeric: tabular-nums` always.
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
- Default: `--border` (slate-6). Interactive: `--border-hover` (slate-7) on hover. Focus: `--focus-ring` (slate-8) plus a 2px indigo-7 outline at 30% alpha.

### Shadows
- **Resting elements have no shadow.** Cards are flat. Hover does not introduce shadow.
- **Floating elements only** (popover, dropdown, modal): `0 8px 24px rgba(0,0,0,0.12)` light / `…0.4` dark.
- Solid buttons get an inner highlight (`inset 0 1px 0 rgba(255,255,255,0.12)`) plus tiny press shadow (`0 1px 2px rgba(0,0,0,0.08)`) — Linear-style tactile, never skeuomorphic.
- **No protection gradients.** Floating UI sits on a backdrop scrim instead.

### Layout rules
- **Wide / responsive.** Sidebar (240–260px fixed) + main fills viewport. No artificial centered max-width on dashboards.
- **Reading views** (settings, long-form notes, account): cap content at **720px**, centered.
- **Main padding:** 32px horizontal, 24px top, more below.
- **Mobile:** all pages render at 375px wide with zero horizontal page-level scroll. Tables wrap, grids collapse to 1–2 cols under 768px.

### Transparency & blur
- **Not used in chrome.** No frosted glass, no backdrop-filter, no translucent panels.
- Modal backdrop is the only translucent surface: `rgba(0,0,0,0.4)` light / `0.6` dark — solid scrim, no blur.

### Corner radii
- `4px` — buttons, inputs, badges, chips.
- `6px` — cards, panels, modals.
- `8px` — page-level containers (rare).
- **Never** larger than 8px. **No pills.** No fully rounded avatars at >8px (use exact circles for avatars instead).

### Cards
- Background `--bg-subtle` (slate-2), 1px `--border` (slate-6), `radius-md` (6px), 20px padding.
- **No shadow.** Hover only changes border color to `border-hover` (slate-7).
- Interactive cards add `cursor: pointer`. They do not lift.

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
- **Inter** & **Geist Mono** — loaded from Google Fonts and jsDelivr CDN respectively. No local TTFs included. Replace with self-hosted copies if offline reliability matters.
- **Lucide** — pulled from CDN. No local sprite. Replace with a self-hosted copy if needed.

---

## How to use this system

1. **Link tokens first:** every page imports `colors_and_type.css`, then `components.css`.
2. **Reach for tokens, not raw Radix:** use `var(--text)` / `var(--panel)` / `var(--border)` — not `var(--slate-12)` directly. The semantic layer is what makes light/dark parity automatic.
3. **One accent per app.** Don't mix per-app accents into shared chrome.
4. **Categorical color comes from chips/dots, not surfaces.** A red row background is wrong; a red dot in a row is right.
5. **Density floor:** 36px controls, 36–40px rows, 16/20/24px card padding, 32×32 minimum tap target on mobile (36 preferred).
