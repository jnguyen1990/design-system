# Joe's Personal Apps — Brand & Design System

A unified design language for personal self-hosted apps (Base, Budgeter, Fitness, Meal Planner, Upkeep, Postings, and future projects). Optimized for the Linear-meets-Things-3 aesthetic: sharp and precise, with breathing room.

---

## 1. Brand pillars

**Sharp. Precise. Warm-instrumented.** *(v4)*

Apps feel like considered tools with product polish. Linear's edge, Things 3's spaciousness, and (since v4) a touch of elevation and tint so screens read like an app rather than a config panel. Every pixel earns its place.

### Voice & tone
- Direct. No hype, no exclamation points.
- **Sentence case everywhere** (v4 — replaces the old lowercase-labels rule): `New entry`, `Today`, `Archive`, `Apr 22 · Amex`.
- **Micro-labels are sentence case too (v4.4, Joe 2026-11-23).** Table headers (`thead th`), `.stat-label`, `.row-section-label` and `.settings-nav-label` are 12px medium `--text-muted`, no tracking. The v4 UPPERCASE signature is retired — one casing register: sentence case for everything, nav labels and page titles included (`Today`, `All transactions`, `+ Add item`; BASE-39, Joe 2026-11-25). Stored values (category names, tags) render as stored.
- Sentence case — never Title Case — for buttons and menus.
- **Mono only for numbers in data, IDs and kbd (v4.4).** Amounts, counts and IDs in tables, `.kbd`, filter syntax. Metadata — subtitles, crumbs, dates (`.td-date`), `.text-meta`, `.mono-meta`, `.row-lead`, chips — is Inter with tabular figures. `.stat-value` big numbers are Inter (v4.1).
- Empty states: one short line of copy, no illustration.
- Error messages name what's wrong, not what to do (`Amount required` not `Please enter an amount`).

---

## 2. Typography

| Role | Family | Source |
|---|---|---|
| Sans (body, UI) | **Inter** (variable, latin + latin-ext) | self-hosted, `fonts/` (from `@fontsource-variable/inter` 5.3.0, OFL) |
| Mono (data, code, kbd) | **Geist Mono** (variable) | self-hosted, `fonts/` (from `geist` 1.3.1, OFL) |

The stylesheet's `@font-face` rules use relative URLs, so the fonts come from wherever the CSS does. Apps load them cross-origin; `_headers` sends `Access-Control-Allow-Origin` for `/fonts/*`. No Google Fonts or jsDelivr request remains (since 2026-11-23).

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'Geist Mono', 'SF Mono', Monaco, 'Cascadia Code', monospace;
```

### Scale (16px root)
```css
--text-3xs:  0.625rem;  /* 10px — smallest mono labels (round three) */
--text-2xs:  0.6875rem; /* 11px — micro-labels, table heads, meta (v4.3) */
--text-xs:   0.75rem;   /* 12px — captions, kbd hints */
--text-sm:   0.8125rem; /* 13px — secondary UI, table rows */
--text-base: 0.875rem;  /* 14px — body, default UI */
--text-md:   1rem;      /* 16px — prominent UI */
--text-lg:   1.125rem;  /* 18px — section headings */
--text-xl:   1.5rem;    /* 24px — page titles */
--text-2xl:  2rem;      /* 32px — display only */
```

### Weight & rhythm
- Body: **400**
- UI default / labels: **500**
- Headings: **600** (never 700+)
- Headings: -0.01em letter-spacing
- **Every size and tracking value is a token (round three, PLAT-30):** `font-size: var(--text-*)`, `letter-spacing: var(--tracking-tight | -snug | -wide | -wider)` (−0.02em, −0.01em, 0.02em, 0.04em). A raw px size is a one-off display number and says so (15/20/26/40px are the only ones left); the root `html { font-size: 16px }` stays.
- Line height: **1.5** body, **1.25** headings, **1.0** mono numerics
- Mono numerics use `font-variant-numeric: tabular-nums` for alignment

---

## 3. Color

### Foundation: Radix Colors

Use **Radix Colors** as the source of truth. 12-step scales, paired light + dark, accessible by step.

The scales are **inlined at the top of `design-system.css`** — the verbatim contents of `@radix-ui/colors@3.0.0`, one commented block per source file — so the stylesheet makes no colour requests to a CDN. To upgrade, replace each block with the same file from the new version. One deliberate selector edit: each dark block also answers `[data-theme="dark"]` (2026-11-24), so `data-theme="dark"` on `<html>` is all a static page needs. Every other dark rule keys on `[data-theme="dark"]` alone — write new dark-only rules that way, never on `.dark`. `shared-core.js` still sets both the attribute and the class; keep the added selector when upgrading the scales.

Step intent (memorize):
```
1   app background
2   subtle background (cards, panels)
3   UI element background (buttons rest)
4   UI element hover
5   UI element active
6   subtle borders, separators
7   UI borders (interactive)
8   hovered UI borders, focus ring
9   solid backgrounds (brand accents, "dot" colors)
10  hovered solid backgrounds
11  low-contrast text
12  high-contrast text (primary)
```

### Neutral scale: `slate`

```css
/* Light + dark are paired automatically by Radix.
   v4.4 surface model (flat, M1 B): one white page --sheet (dark: slate-1);
   only the sidebar is tinted (--sidebar-bg). Floating layers use --card. */
--bg:           var(--slate-2);    /* page + sidebar ground (dark: slate-1) */
--bg-subtle:    var(--slate-2);
--card:         #ffffff;           /* floating surfaces — modal, menu, toast, tab bar (dark: slate-2) */
--sheet:        var(--card);       /* the page (dark: --bg) */
--sidebar-bg:   var(--bg-subtle);  /* the only tinted surface (dark: --card) */
--card-border:  var(--slate-4);    /* near-invisible card edge (hover: slate-6) */
--panel:        var(--slate-3);    /* raised UI rest, row hover */
--panel-hover:  var(--slate-4);
--panel-active: var(--slate-5);
--border:       var(--slate-6);    /* default border */
--border-hover: var(--slate-7);
--focus-ring:   var(--accent-text); /* per-app step 11 (v4.3; was step 7 at 1.6-1.9:1) */
--text:         var(--slate-12);
--text-muted:   var(--slate-11);
--text-faint:   color-mix(in srgb, var(--slate-11) 70%, var(--slate-10)); /* v4.3; dark: 30% — >= 4.5:1 on card, page, panel */
```

Backgrounds are **slightly off** — light is `~#fafafa`, dark is `~#0a0a0a`. Slightly cool. Never pure black or white.

### Categorical palette (tags, statuses, categories)

The UI itself stays neutral. Categorical color does the organizing work, Things-3-style.

```
red       errors, urgent, destructive, overdue
orange    warnings, in-progress
amber     pending, scheduled
green     success, complete, income
teal      info, neutral-positive
blue      links, default selection
indigo    primary actions (system fallback)
purple    special, featured
pink      personal, journal
```

Use:
- **Step 9** as the "dot" color (sidebar item, list bullet, status indicator)
- **Step 3 background + Step 11 text + Step 6 border** for filled chips
- Never as page background or large surfaces

### Amount / delta semantics

Numeric +/- values (transactions, PR deltas, weight changes) get a dedicated set:

```css
--text-amount-positive: var(--green-11);   /* income, gains, +N PR */
--text-amount-negative: var(--red-11);     /* spending, losses, regressions */
--text-amount-neutral:  var(--text-faint); /* unchanged, $0, "match" */
```

Always paired with `font-family: var(--font-mono); font-variant-numeric: tabular-nums;` so columns of amounts align cleanly.

### Per-app brand accent

The app UI stays neutral. Each app picks **one** Radix accent for branding moments only:

| App | `data-app` | Accent |
|---|---|---|
| Base | `base` | `slate` (system default — neutral) |
| Budgeter | `budgeter` | `green` |
| Fitness | `fitness` | `orange` |
| Meal Planner | `mealplanner` | `purple` |
| Upkeep | `upkeep` | `blue` |
| Postings | `postings` | `crimson` |
| Future apps | — | one Radix accent each, no repeats |

Those six are the only `data-app` values the stylesheet defines. The legacy aliases `hub`, `health` and `meals` were removed 2026-11-05.

The brand color appears in: logo, favicon, empty-state icon tint (`.empty-state-icon`), onboarding pages, loading states — **and, since v4, in five chrome moments**: the primary button (`.btn-primary` → `--accent-solid`), the active nav item (`--accent-soft` tinted bg; label stays `--text` since v4.2), the focus ring, text selection (`::selection`), and checked checkboxes/radios. Everything else in chrome stays neutral slate. The alpha tokens (`--accent-soft` = accent `a3`, `--accent-soft-hover` = `a4`) composite correctly on any surface and remap per app.

**Solid fills that carry text (v4.3).** Never put `#fff` on `--accent-500`: white on step 9 measured 2.97–3.85:1 in five of six apps. Use the pair tokens, which pass AA in both themes for every app:

| Token | Light | Dark |
|---|---|---|
| `--accent-solid` / `--accent-on` | step 11 / white (4.5–6.1:1) | step 9 / white for base, mealplanner (and the indigo default); near-black (`--slate-1`) for budgeter, fitness, upkeep, postings (4.9–6.4:1) |
| `--accent-solid-hover`, `--accent-solid-active` | darkened 14% / 24% | moved away from the text colour, so hover never loses contrast |
| `--danger-solid` / `--danger-on` (+ `-hover`, `-active`) | red-11 / white | red-9 / near-black |

`.btn-primary`, `.btn-danger` and checked checkboxes/radios use them. A new app's `[data-app]` block needs nothing extra unless its step 9 is bright: then add it to the dark near-black rule beside budgeter/fitness/upkeep/postings.

---

## 4. Spacing

8px base, with 4px halfsteps for tight UI.

```css
--space-0_5: 2px;   /* hairline gap */
--space-1:   4px;   /* icon-to-text in dense rows */
--space-1_5: 6px;   /* v4.3 — label-to-field, chip gaps */
--space-2:   8px;   /* tight padding */
--space-2_5: 10px;  /* v4.3 — compact row padding */
--space-3:  12px;   /* control padding */
--space-4:  16px;   /* default gap, card padding */
--space-6:  24px;   /* section spacing */
--space-8:  32px;   /* page header to content */
--space-12: 48px;   /* major sections */
```

**Density target: spacious.**
- Default row height: 36–40px (not 28)
- Default form input height: 36px
- Default button height: 36px (sm: 32, lg: 40)
- **Touch (`pointer: coarse`): 44px** (sm 40, lg 48) — the tokens `--control-h-sm/-h/-lg` change, so never hard-code a control height

**Layout primitives (v4.3)** — use these instead of inline `style=""`:
- `.stack` — vertical rhythm, 16px (`.stack-sm` 8, `.stack-lg` 24); children's margins are zeroed
- `.cluster` — wrapping centred row, 8px (`.cluster-between`, `.cluster-end`)
- `.columns-2` — two equal `minmax(0, 1fr)` columns, one column below 900px
- `.columns-aside` — main column + 280–380px rail, one column below 900px
- margins `m-0`, `mt-/mb-{0,1,2,3,4,5,6,8}`; gaps `gap-{1..6}`

**Layers.** z-index only from the scale: `--z-raised` 1, `--z-sticky` 50, `--z-overlay` 99, `--z-sidebar` 100, `--z-toggle` 101, `--z-drawer` 102, `--z-dropdown` 150, `--z-popover` 160, `--z-modal` 200, `--z-toast` 300.

---

## 5. Layout

- **Width (v4.4):** `.content` caps at 1200px of content, left-aligned with the page header (wider screens get empty sheet on the right, not stretched cards).
- **Sidebar (v4.4 — the quietest text on screen):** 240px, tinted `--sidebar-bg`. 34px rows, 14px regular `--text-muted` labels, 16px `--text-faint` outline icons; the active row is `--text` medium on the `--accent-soft` tint; ⌘ hints appear on hover. Brand 15px. The app dock's icons are full colour with the app name on hover.
- **Main padding:** 32px horizontal, 8px top under the header, more below.
- **Phones (v4.4, M2):** below 768px the engine shell's floating tab bar replaces the hamburger + drawer — see §11 "Mobile tab bar".
- **Narrow pages (round three, PLAT-22):** settings and single-form pages cap at 720px with `.content-narrow` (left-aligned like everything else; on a `.settings-pane` page the 720px is the pane beside the 190px section list). The gem's shell applies it from `config.narrow_pages` (default: `/settings`, `…/new`, `…/edit`); a page overrides with `content_for :content_width, "narrow" | "wide"`.
- **Density (round three, PLAT-16):** `<html data-density="compact">` shortens controls (36→32, sm 32→28), rows (36→30) and cell/card padding, under a fine pointer only. Toggled from the ⌘K palette; stored beside the theme.

### Mobile rules (already in repo README)
- All pages render at 375px wide with zero horizontal page-level scroll — check `document.body.scrollWidth <= window.innerWidth` (not `documentElement`, which the system's `overflow-x: hidden` makes always pass)
- Text inputs are 16px under 768px (the system does it; iOS zooms below 16px)
- Touch targets 44px (the system does it through `--control-h`; the controls that keep a smaller look — dock icons, button badges, `.btn-sm`, `.btn-icon` — get an invisible 44px `::before`, PLAT-08)
- Tables wrap in `.table-responsive`, or opt into card rows with `.table-stack` (§11 "Stacked tables")
- Page-header controls use `.toolbar` (flex-wrap)
- Grids collapse to 1–2 columns under 768px
- Calendars switch to per-day list under 768px

---

## 6. Surfaces

### Corners (v4)
```css
--radius-sm: 7px;   /* buttons, inputs, badges, chips, nav items */
--radius-md: 9px;   /* cards, panels, modals, dropdowns */
--radius-lg: 12px;  /* page-level containers */
```
Never larger than 12px. No pills. (16px checkboxes stay at 4px so they don't read as circles.)

### Cards (v4.4 — flat sections, Joe's M1 pick B, 2026-11-23)
One sheet; a `.card` is a section of it, opened by a hairline. No fill, no side borders, no radius, no shadow. Its content lines up with the page title.
```css
.card {
  background: transparent;
  border: 0;
  border-top: 1px solid var(--border);      /* the hairline that opens the section */
  border-radius: 0;
  padding: var(--space-5) 0 var(--space-6); /* vertical rhythm only */
  box-shadow: none;
}
.card-dense   { padding: var(--space-4) 0; }
.card-compact { padding: var(--space-3) 0; }
.card .list-row, .card table first/last cells   /* flush to the section edges */
```
`.card-stack`, `.dc-main` and `.dc-rail` have no gap (the hairlines split sections); `.detail-columns` has 40px between columns. A `.card-link` keeps a small inset and a hover tint. `.card.danger-zone` opens with a red hairline. Floating layers (modal, dropdown, toast, tab bar, sheet) keep `--card` + `--shadow-floating`.

For numeric tiles use `.stats-grid > .stat-card`: one hairline band split by vertical hairlines on desktop; on phones the tiles sit in a 2-up (≤768) / 1-up (≤480) grid under the band's top hairline, with no vertical rules.

```html
<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-label">back squat 1RM</div>
    <div class="stat-value">285 lb</div>
    <div class="stat-subtext">apr 12 · +5 lb</div>
  </div>
</div>
```

### Elevation (v4.4)
- **Resting surfaces have none.** `--shadow-card` remains as a token but the core components no longer use it.
- **Interactive hover:** a tint (`--panel-hover`), never lift or shadow growth
- **Floating** (popover, dropdown, modal, toast, tab bar, sheet): `--shadow-floating`, on the `--card` surface

---

## 7. Buttons

Linear-style: solid fill + subtle inner highlight + tiny shadow. Tactile, not skeuomorphic.

### Primary (v4 — per-app accent; v4.3 — AA solid tokens)
```css
.btn-primary {
  background: var(--accent-solid);  /* step 11 light / step 9 dark of the app accent */
  color: var(--accent-on);          /* white, or near-black on bright dark accents */
  border: 1px solid var(--accent-solid);
  border-radius: var(--radius-sm);
  height: 36px;
  padding: 0 12px;
  font: 500 13px/1 'Inter', sans-serif;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.12),
    0 1px 2px rgba(0,0,0,0.08);
  transition: background 120ms ease-out, border-color 120ms ease-out;
}
.btn-primary:hover  { background: var(--accent-solid-hover); }
.btn-primary:active { background: var(--accent-solid-active); }
```

### Secondary
```css
.btn-secondary {
  background: var(--panel);              /* slate-3 */
  color: var(--text);
  border: 1px solid var(--border);
}
.btn-secondary:hover { background: var(--panel-hover); }
```

### Ghost
```css
.btn-ghost {
  background: transparent;
  color: var(--text);
  border: 1px solid transparent;
}
.btn-ghost:hover { background: var(--panel); }
```

### Destructive
`.btn-danger`: same structure as primary on `--danger-solid` / `--danger-on`.

### Sizes
- `sm`: height 32px, padding 0 10px, font 12px
- `default`: height 36px, padding 0 12px, font 13px
- `lg`: height 40px, padding 0 16px, font 14px

### Focus
```css
outline: 2px solid var(--focus-ring);   /* = --accent-text, step 11: 4.5:1+ on a card */
outline-offset: 2px;
```
Never mix the ring with transparency: the old 30% mix on inputs measured 1.1–1.2:1.

---

## 8. Forms

The class is `.form-control` (there is no `.input`), inside a `.form-group` with a `.form-label`:

```css
.form-control {
  height: var(--control-h);           /* 36px, 44px on touch */
  padding: 0 12px;
  background: var(--bg);              /* inset field on the elevated card */
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font: 400 14px 'Inter', sans-serif; /* 16px under 768px */
}
.form-control::placeholder { color: var(--text-faint); }
.form-control:focus {
  border-color: var(--focus-ring);
  outline: 1px solid var(--focus-ring);  /* + the border = a 2px ring */
}
.form-control[aria-invalid="true"] { border-color: var(--red-7); }
```

`select.form-control` draws its own chevron. Associate every label: `<label for>` + `id`, or let shared-core's `dsEnhanceLabels()` do it — it wires a `.form-group` with exactly one `<label>` and one text control on load and on every modal open.

- Label: 13px / weight 500 / `--text` / 6px below label
- Helper text: 12px / weight 400 / `--text-muted`
- Error text: 12px / weight 400 / `--red-11`

---

## 9. Iconography

**Lucide**, 1.5px stroke (default), `currentColor`.

Sizes:
- `14px` inline with body text
- `16px` default UI (buttons, menu items)
- `20px` page headers, large cards

Never larger inline. Icon-only buttons reserved for universally understood actions: close, search, settings, more.

---

## 10. Motion

Minimal. No springs, no layout animations.

```css
--motion-fast: 120ms cubic-bezier(0.2, 0, 0, 1);   /* hover */
--motion-base: 160ms cubic-bezier(0.2, 0, 0, 1);   /* state change */
--motion-slow: 200ms cubic-bezier(0.2, 0, 0, 1);   /* modal in */
```

- Page-to-page navigation cross-fades the content (cross-document view transitions, 160ms, round three PLAT-15); the sidebar, page header and tab bar are named groups and hold still. Nothing else moves between pages, and nothing at all under reduced motion
- The modal fades in (`modalIn`, `--motion-slow`). The token already carries the easing: never append a second timing function to a `--motion-*` value — that makes the declaration invalid and silently drops it (the v4.2 modal had no animation for this reason)
- Respect `prefers-reduced-motion: reduce` (skeleton shimmer and toast slide stop too)
- Easing is always ease-out (sharp start, soft end)

---

## 11. Component patterns

### Sidebar list item (Things 3 style)
```
┌──────────────────────────────────────────┐
│  ▢  Item label                       ⌘1  │
└──────────────────────────────────────────┘
```
- v4.2 rows: a 17px outline icon + label. No color dots — they clash with the accent tint (`.color-dot` inside `.nav-link` is hidden by the CSS).
- Icons: `<span class="nav-ico" data-ico="name"></span>` — shared-core.js injects the SVG from its `NAV_ICONS` registry (Feather-style, 1.7px stroke, `currentColor`). Muted at rest, `--text` on hover/active; the accent never colors them.
- Item height: 32px, padding: 6px 12px
- Hover: `--panel` background, no border change
- Selected (v4.2): `--accent-soft` tinted background + semibold only — the label keeps `--text`, never `--accent-text`
- Kbd hint: Geist Mono 11px, `--text-faint`

### Status badge (v4 — tinted chip)
```
┌────────────┐
│  Active    │
└────────────┘
```
```css
.badge {
  display: inline-flex; align-items: center; gap: 6px;
  height: 22px; padding: 0 9px;
  background: var(--{color}-a3);   /* alpha tint — composites on any surface */
  color: var(--{color}-11);
  border: 1px solid transparent;   /* borderless; keeps box metrics */
  border-radius: var(--radius-sm);
  font: 500 12px 'Inter', sans-serif;
}
/* Categorical modifiers carry the tint: .badge--green, .badge--red, … .badge--slate.
   Semantic variants unchanged in name: .badge-success/-warning/-error/-info/-accent.
   The tint IS the category color, so .color-dot inside a modified badge is hidden
   automatically — dots remain for standalone use (legends, category lists). */
.badge-numeric { font-family: 'Geist Mono', monospace; }
```

```html
<!-- ✓ do (v4) -->
<span class="badge badge--green">Groceries</span>
<!-- ✓ still fine — dot markup is auto-hidden inside variant badges -->
<span class="badge badge-success"><span class="color-dot color-dot--green"></span> Groceries</span>
<!-- ✗ don't -->
<span class="badge badge-success"><span class="color-dot" style="background: var(--green-9);"></span> groceries</span>
```

### Keyboard shortcut hint
```css
.kbd {
  display: inline-block;
  padding: 2px 6px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 3px;
  font: 400 11px 'Geist Mono', monospace;
  color: var(--text-faint);
}
```

### Table row
- Height: 40px (spacious), 36px (default)
- Bottom border: 1px `--border`
- Hover: `--bg-subtle`
- Numeric columns: Geist Mono, tabular-nums, right-aligned
- No zebra striping

#### Semantic cell modifiers
Use these to keep transaction tables, log tables, and ledger views consistent across apps:

```css
.td-date    { /* mono + muted + xs + nowrap */ }
.td-amount  { /* mono + tabular + right-aligned + nowrap */ }
.td-actions { /* 48px wide, right-aligned */ }
.td-muted   { /* mono-friendly secondary text */ }
```

Compose with the amount-color utilities for +/- columns:
```html
<td class="td-date">Apr 22</td>
<td class="td-amount text-amount-negative">−$84.20</td>
<td class="td-amount text-amount-positive">+$3,400.00</td>
<td class="td-actions"><button class="btn btn-sm btn-ghost">⋮</button></td>
```

### Modal
- Width: 480px (sm), 640px (default), 800px (lg)
- Background: `--card`
- Border: 1px `--card-border`
- Radius: `--radius-md`
- Shadow: floating shadow (see §6)
- Backdrop: `rgba(0,0,0,0.4)` light, `rgba(0,0,0,0.6)` dark
- Behaviour (modal-keys.js, v4.3, automatic for every `.modal`): `role="dialog"` + `aria-modal` + `aria-labelledby` its `.modal-title`; focus moves to the first field on open; Tab stays inside; focus returns to the opener on close. Give every modal a `.modal-title` so it has a name.

### Toast (success / error / status messages)
Use `.status-message` plus a variant (`.status-success`, `.status-error`, `.status-warning`, `.status-info`) for any transient feedback ("saved", "deleted", "sync failed"). The class is **position: fixed, bottom-centered** — it never pushes layout. Floating shadow, 4px colored left border that encodes severity.

- **Bottom-center** of the viewport, 24px above the bottom edge.
- **No icon, no emoji.** The color and copy do the work. A small `×` affordance is baked in via CSS (`::after`) — don't add a close button in markup.
- **Click anywhere on the toast to dismiss** (v4.2 — delegated listener in `shared-core.js`). **Success also auto-dismisses** after ~3s; errors stay until dismissed, the next action, or page nav.
- **Don't toast on every save.** Silent success is fine for the common path; toast only when the action isn't otherwise visible (e.g. a save with no inline state change). Errors always toast.
- Copy: name the outcome, not the reaction. `saved`, `deleted`, `sync failed`, `amount required`. Never `Successfully saved!` or `Oops!`.
- One toast at a time per page — reuse a single `<div class="status-message">` element and update its text/class.
- **Undo, not confirm, for recoverable removals (v4.3).** `dsToast('Removed "Rent"', 'success', {action: {label: 'Undo', onClick: restore}})` — the action renders inside the toast, runs once, and the toast stays 6s. Keep `dsConfirm` for what cannot come back.
- **Toasts sit above modals** (`z-index: 300` over `.modal`'s 200), so a validation message raised while a modal is open reads at full strength over the scrim and can be clicked away. This holds over the `dsConfirm` / `dsPrompt` dialogs too: the toast is pinned to the bottom edge, the dialog box is centred.

```html
<!-- canonical markup; lives once per page, toggled by showStatus() -->
<div id="page-status" class="status-message" style="display:none"></div>
```

```js
// success — auto-dismisses
showStatus('page-status', 'saved', 'success');
// error — sticks until the next state change
showStatus('page-status', 'save failed — network unreachable', 'error');
```

---

### 11.x Record editors — chips, editable rows, decision bars

Added 2026-09-11. All five live in `design-system.css`. Every one of them
existed as a private app copy first — chips alone had five (`.component-chip`
and `.chip` in mealplanner, `.info-chip` and `.ref-chip` in upkeep,
`.file-chip` and `.term-chip` in postings). **Never re-declare these in an app
stylesheet.**

- **`.choice-chip`** (in a `.choice-chip-row`) — a chip that *is* a checkbox or
  radio: the `<label>` wraps the input so the whole chip is the hit target, and
  the checked state comes from `:has(input:checked)`, no JS and no extra class.
  Distinct from `.filter-chip` (toggles a *view*, not a value) and `.badge`
  (not interactive at all). Picking one of those three wrongly is the most
  common chip mistake.
- **`.edit-rows`** — dense editable row list as a real `<table>`, so columns
  align down the list. Width utilities on the cells: `.col-narrow` (74px),
  `.col-short` (84px), `.col-select` (116px), `.col-action` (32px).
- **`.step-rows`** — numbered editable steps (`.step-row` + `.step-n` + a
  textarea). A method, a checklist, an ordered procedure.
- **`.decide-bar`** — sticky accept/discard bar for one record, so the decision
  is reachable without scrolling past a long form. Button order mirrors
  `.modal-footer`: destructive far left (a first-child `.btn-danger` is pushed
  there automatically), affirmative rightmost.
- **`.dropzone`** — file drop target; add `.dragover` on drag.

### 11.y Sticky offsets — derive them, never hardcode

`.page-header` is sticky at `top: 0`, so anything else that sticks must start
below it — and **its height is not a constant**: 63px with a title alone, 87px
with a subtitle, 113px with a crumb as well, and ~15px less below 1024px.

`shared-core.js` measures it and publishes **`--header-h`** on `:root`
(re-measured via `ResizeObserver`, since a subtitle can wrap). Sticky
components consume it:

```css
.settings-nav { top: calc(var(--header-h, 87px) + var(--space-3)); }
```

This was a real bug, not a hypothetical: `.settings-nav` shipped with a
hardcoded `top: 84px`, which put 3px of the rail under the header in four apps
and **29px in upkeep and postings**, both of which render a crumb.

---

### 11.z The consolidation — app stylesheets are empty now

On 2026-09-11 every app stylesheet was emptied into this file. Before: base 25
lines, fitness 10, budgeter 10, postings 51, upkeep 109, **mealplanner 652**.
After: comment headers only, plus two ID-selector hooks in base for its own
todo/mood markup.

**The rule is now absolute: an app stylesheet declares nothing.** If you are
about to write CSS in an app repo, you are about to create the sixth private
copy of something. Put it here.

What the audit found, and what it became:

| Private copies | Now |
|---|---|
| `.component-chip`, `.chip` (mealplanner), `.info-chip`, `.ref-chip` (upkeep), `.file-chip`, `.term-chip` (postings) | `.choice-chip` (sets a value), `.filter-chip` (toggles a view), `.meta-chip` (a fact), `.pick-chip` (picks a record) |
| `.item-grid`, `.artifact-grid`, `.profile-grid`, `.recipe-grid`, `.grocery-grid`, `.sale-grid`, `.recipe-suggest-grid` | `.auto-grid` + `--auto-min` / `--xs --sm --md --lg` |
| `.artifact-thumb`, `.item-photo`, `.r-thumb` | `.media-thumb` + `--thumb-ratio`, `.media-thumb--text` |
| `.task-row`, `.history-entry`, `.recent-row`, `.doc-row` | `.list-rows` (border rhythm) + `.list-row` / `.icon-row` |
| `.spec-row` (upkeep), `.row` (mealplanner) | `.spec-row`, `.spec-row--tight` |
| `.meta-list` (postings, 92px) | `.detail-list` + `--detail-label-w` |
| ~25 hand-written `font-mono; 11px; muted` | `.mono-meta` / `.mono-faint` / `.tabular` |
| `.posting-body` | `.prose` |
| `.status-pills` | `.segmented` / `.segment` |
| `.g-line` / `.g-check` | `.check-row` / `.check-box` |
| `.year-strip` / `.ys-*` | `.month-strip` / `.ms-*` |
| `.step-list`, `.step-flow` (mealplanner) | both, here |
| `.icon-btn`, `.artifact-open`, `.artifact-remove` | `.btn-icon`, `.btn-reset`, `.hover-reveal` |

Two bugs fell out of doing it:

- **base's Today meal picker wrote `class="chip"` against a class that existed
  in neither base's stylesheet nor this file** — those chips had been rendering
  unstyled. `.pick-chip` is that fix.
- **`.stat-card.card-dense` silently rendered at 20px**, because `.card-dense`
  is declared ~700 lines before `.stat-card` at equal specificity. Mealplanner
  carried a local override for it. Fixed at the source.

Mealplanner's domain components (`.r-card`, `.nutri-grid`/`.n-day`,
`.macro-bar`, `.drawer`, `.meal-form`/`.dish-*`, `.sale-*`) were relocated
verbatim into a **Mealplanner components** section, beside the app-scoped
families this file already owned (`.cal-*`, `.meter`, `.session-type-*`).

#### Removed 2026-11-05 — do not reintroduce

A second pass, after the apps were swept onto the shared helpers, deleted what
nothing referenced any more (checked by grep over all six `app/` trees and this
repo’s JS):

| Removed | Use instead |
|---|---|
| `updateThemeIcon()` and the `#theme-icon` sync in `shared-core.js` | nothing — the apps dock draws the theme glyph; `toggleTheme()` is unchanged |
| `[data-app="hub"]`, `[data-app="health"]`, `[data-app="meals"]` | `base`, and the six real `data-app` values |
| `.btn-success`, `.btn-error`, `.btn-cta` | `.btn-primary`, `.btn-danger`, `.btn-primary` |
| `.app-grid`, `.app-card*`, `[data-app-color]` | the apps dock; `.auto-grid` + `.card.card-link` for a grid of linked cards |
| `.category-group-card`, `.category-list`, `.category-item`, `.category-*` | `.card`, `.list-rows` / `.list-row`, `.color-dot` |
| `.nav-submenu`, `.submenu` (2026-11-24: never used) | a flat nav list |
| `.btn-lg`, `.modal-backdrop`, `.table-wrapper`, `.nav-section-label`, `.nav-icon`, `.filter-btn` (2026-11-24, PLAT-28: no references in any app, kit or script) | `.btn`, `.modal` (its own scrim), `.table-responsive`, `.settings-nav-label`, `.nav-ico`, `.filter-chip` |
| App leftovers (2026-11-24): `.arch-day-row` (+ `.date-col`, `.score-pips`), `.brief-main` / `.brief-rail`, `.cat-note`, `.drop-indicator`, `.insight-bar`, `.insight-error`, `.kw-row`, `.tprev`, `.virtual-rows`, `.week-foot`, `.week-sessions`, `.ws-cmp` | nothing — the pages that used them were rebuilt |
| `.copy-btn.ok` | the "Copied" toast from `data-copy-text` / `data-copy-target` |
| Fitness’s stepper-era goal detail: `.stepper`, `.block-card*`, `.step-arrow`, `.bc-*`, `.blocks-head`, `.goal-meta`, `.goal-notes`, `.recap` / `.rc-*`, `.adh-row`, `.adh-label`, `.muted-dash` | the **Goal pages** section (`.target-band`, `.plan-*`); `.adh-track` / `.adh-fill` / `.adh-count`, `.gm-label` / `.gm-val` and `.progress-*` are still live |

Same pass: `.dash-side-by-side` now carries its own desktop grid (`1fr 380px`,
one column at 768px and below) so the fitness dashboard needs no inline style, and
the identical `.goal-tabs` / `.goal-tab` rules for fitness and base are one pair,
still scoped to those two apps. `.theme-toggle*` was removed on 2026-11-06 once
`rails-app-template` moved to the dock; the app dock renders the theme button.

#### Removed 2026-11-23 (v4.3) — do not reintroduce

Token-name grep over the stylesheet, this repo's JS, kits and previews, all six
`app/` trees, the gem, the template, mini and proxmox-scripts (quoted names too,
for `cssToken()`):

| Removed | Use instead |
|---|---|
| `--gray-50…950` | `--slate-N` / the semantic tokens |
| `--success-*`, `--warning-*`, `--error-*`, `--info-500`, `--primary-500` | `--green-N`, `--amber-N`, `--red-N`, `--teal-N`, `--accent-500` |
| `--gradient-*` | `--accent-500`, `--accent-soft` |
| `--surface`, `--surface-hover`, `--surface-raised`, `--bg-primary`, `--bg-tertiary` | `--bg`, `--bg-subtle`, `--panel` |
| `--border-light`, `--border-medium` | `--border` |
| `--text-primary`, `--text-secondary`, `--text-tertiary` | `--text`, `--text-muted`, `--text-faint` |
| `--shadow-md`, `--shadow-lg`, `--shadow-xl`, `--shadow-accent` | `--shadow-card`, `--shadow-floating` (`--shadow-sm` stays) |
| `--leading-*`, `--transition-*` | `--lh-body` / `--lh-heading`, `--motion-*` |
| `--text-3xl`, `--text-4xl`, `--radius-lg/xl/2xl` | `--text-2xl`, `--radius-md` |
| `--color-primary`, `--color-feature`, `--color-personal`, `--color-warning` | `--accent-500`, `--purple-9`, `--pink-9`, `--orange-9` |
| `--sidebar-w` (256px) | `--sidebar-width` (240px) |
| raw `z-index` numbers | the `--z-*` scale (§4) |

Removed 2026-11-24 (PLAT-29, no use in the stylesheet, its scripts, the kits or any app):
`--accent-soft-hover`, `--accent-50` / `-100` / `-400` / `-600` (each `[data-app]` block now sets
`--accent-300`, `-500`, `-700`, `--accent-soft`, `--accent-text` and the solid pair), `--space-16`,
`--lh-mono`. Kept although unused: `--row-h-spacious` and `--space-0_5` (density and spacing
steps round three is about to use).

---

## 12. Light ↔ dark parity

Both modes are first-class. Test every screen in both. Use Radix paired scales — never hardcode hex except for shadows. Toggle via `data-theme="light"` / `data-theme="dark"` on `<html>`. Default to system preference (`prefers-color-scheme`).

---

## 13. Page conventions

Apps that share the design system follow these patterns so screens feel like the same product.

### Stacked-card layout

A page is a vertical list of `<div class="card">` sections. Each card has `style="margin-bottom:16px"` (or use a flex column with `gap: var(--space-4)`). Never `1rem` / `1.5rem` / `12px` / `20px` — always **16px** between cards. Mixed values look careless.

### Section structure inside a card

```html
<div class="card" style="margin-bottom:16px">
    <h3>Sentence case heading</h3>
    <p class="card-subtitle">One-line description of what this section does.</p>
    <!-- form fields, table, list, chart, etc. -->
    <div class="d-flex gap-2" style="margin-top:12px">
        <button class="btn btn-primary btn-sm">Primary action</button>
        <button class="btn btn-secondary btn-sm">Secondary</button>
    </div>
</div>
```

- **`<h3>`** for section titles (no `<h2>` inside cards — `<h2 class="page-title">` is reserved for the page header rendered by the layout).
- **Sentence case** for headings, labels, and button text. "Backup & restore", not "Backup & Restore". Acronyms keep their case (CSV, ID, MCP, HRV).
- **`<p class="card-subtitle">` description** below the heading. Explains what the section is for in one short sentence. Never `.stat-label` here — that is the micro-label for stat tiles and renders a sentence in caps.
- **`.d-flex gap-2`** for action button rows; or `.toolbar` if there's a left/right split.

### Page subtitle (mono, dynamic)

Pages often need a subtitle below the page title — a count, date range, or filter state. Render it as a `<p>` sibling to the page header content with mono muted styling, populated by JS after data loads:

```erb
<p id="pageSubtitle" class="text-muted" style="margin: -8px 0 var(--space-3); font-family: var(--font-mono); font-size: var(--text-sm);">&nbsp;</p>
```

Example values: `"april 2026 · 982 transactions"`, `"3 transactions need a category"`, `"apr 23–29, 2026"`.

### Toolbar pattern

For action rows inside cards (e.g. `[Title (count)]   [filter] [filter] [+ Add]`):

```html
<div class="toolbar">
    <div class="toolbar-start">
        <h2 class="card-title" style="margin:0">Title <span class="text-muted" style="font-weight:400">(N)</span></h2>
    </div>
    <div class="toolbar-end">
        <button class="btn btn-secondary btn-sm">Filter</button>
        <button class="btn btn-primary btn-sm">+ Add</button>
    </div>
</div>
```

Same pattern works for prev/today/next month-pickers (`<button>‹</button> <h2>April 2026</h2> <button>›</button>`).

### Button class palette

Only these:

| Class | When |
|---|---|
| `btn-primary` | The primary action of a section. One per row max. |
| `btn-secondary` | Everything else (filters, secondary actions, links-as-buttons). |
| `btn-ghost` | Icon-only or text-only affordances inside dense rows (⋮, ×). |
| `btn-danger` | Destructive (delete, wipe, remove). Always paired with a confirm dialog. |

**Forbidden:** `btn-success`, `btn-error`, `btn-warning`, `btn-info`, `btn-cta` — none of them exist in the stylesheet (the last three legacy rules were removed 2026-11-05). Color a button by intent (`btn-primary` for "go", `btn-danger` for destructive), not by mood.

**Sizes:** `btn-sm` for in-card and table-row actions. Plain `btn` for stand-alone primary CTAs at the page level and for modal footers. Pick one size per row and stick with it — never mix `btn` and `btn-sm` in the same action group.

### Modal & dialog action rows

Every modal's actions live in a **`.modal-footer`** — never hand-rolled flex rows inside `.modal-body`. The design system right-aligns the footer. Order, left → right:

1. **Destructive extras** (a delete inside an edit dialog) — `btn-danger`, pushed to the far left with `style="margin-right:auto"` so it can't be fat-fingered next to save.
2. **Tertiary extras** (snooze, preview, download) — `btn-secondary`.
3. **Cancel / close** — `btn-secondary`.
4. **The affirmative action, always rightmost** — `btn-primary`; in a confirm dialog whose whole purpose is the destructive act, `btn-danger` takes this slot instead.

```html
<div class="modal-footer">
    <button class="btn btn-danger" style="margin-right:auto" onclick="del()">delete</button>
    <button class="btn btn-secondary" onclick="closeModal()">cancel</button>
    <button class="btn btn-primary" onclick="save()">save</button>
</div>
```

Sizes: plain `btn` in modal footers (they're dialog-level actions); `btn-sm` for rows inside the modal body. Every modal has a header `×` (`class="modal-close btn-ghost"`). This rule applies equally to JS-generated footers (`innerHTML` into a footer div).

**Deliberate asymmetry with cards:** in-card action rows lead with the primary on the LEFT (`.d-flex gap-2`, `btn-sm` — see below); modal footers anchor the primary bottom-RIGHT like native dialogs. Cards read top-down and lead with the action; dialogs commit at the corner. Don't cross the two.

### Destructive micro-actions

A `×` that removes a row, chip, or field **inside an uncommitted form** is `btn-ghost` — no confirm needed, nothing is persisted until save. `btn-danger` is reserved for committing destruction of persisted data, and is always paired with a confirm.

### Confirms — `dsConfirm()`, not `window.confirm()`

`shared-core.js` ships `dsConfirm(message, opts) → Promise<boolean>` — a styled DS modal (affirmative rightmost; `danger: true` default renders it `btn-danger`, which deliberately opts it out of modal-keys' Enter-to-primary). Rails `data-turbo-confirm` is auto-routed through it, so `button_to ... turbo_confirm:` needs no change. New JS code never calls native `confirm()`:

```js
if (!(await dsConfirm('Delete this goal?'))) return;
// or in an onclick: onclick="dsConfirm('Remove?').then(ok => { if (ok) remove(id) })"
```

Typed-confirmation flows (type RESTORE/DELETE to proceed) keep their bespoke modals.

### Prompts — `dsPrompt()`, not `window.prompt()`

`dsPrompt(message, opts) → Promise<string|null>` is the same dialog with one text field: the typed string on OK (`''` if left blank), `null` on cancel, Esc or a backdrop click — `window.prompt()`'s contract. `opts`: `title`, `value`, `placeholder`, `confirmLabel`, `cancelLabel`, `danger` (default **false**), `multiline`.

```js
const reason = await dsPrompt('Archive this session — why?', { title: 'Archive session', placeholder: 'e.g. accidental watch start', confirmLabel: 'Archive' });
if (reason === null) return;
```

### Opening and closing modals

A modal is open while it carries `modal-open`. `modal-keys.js` provides the verbs so pages stop writing `classList.add('modal-open')` by hand:

```html
<button class="btn btn-primary" onclick="openModal('goal-modal')">Add goal</button>

<div id="goal-modal" class="modal" data-backdrop-close>
  <div class="modal-box">
    <div class="modal-header"><h3>Add goal</h3><button class="modal-close" data-modal-close>&times;</button></div>
    …
    <div class="modal-footer"><button class="btn btn-secondary" data-modal-close>Cancel</button><button class="btn btn-primary">Save</button></div>
  </div>
</div>
```

- `openModal(id)` / `closeModal(id)` take an id or the element, and fire a bubbling `modal:open` / `modal:close` event on the modal — hang form resets and chart teardown on `modal:close` rather than on each close button.
- `data-modal-close` on any element closes the modal it sits in (or the one it names: `data-modal-close="other-modal"`).
- `data-backdrop-close` on the `.modal` lets a click on the scrim close it. **Opt-in**: leave it off a form the user could lose work in.
- Esc closes the topmost modal through the same path as `closeModal()`, so `modal:close` fires and close-cleanup runs however the modal was dismissed. Enter fires its `.btn-primary`.

### Shared helpers — use these, don't re-write them

All globals from `shared-core.js`, loaded by every layout. Each of these existed as several private copies before 2026-11-05.

| Need | Use | Not |
|---|---|---|
| Put a string into `innerHTML` | `escapeHtml(value)` — `null`/`undefined` → `''` | a page-local `escapeHtml` / `esc` |
| Today, for a date input or an API param | `todayKey()` → `2026-11-05` | `new Date().toISOString().slice(0, 10)` — that is **UTC** and reads as tomorrow every evening |
| A `Date` as a key | `dateKey(date)`, `monthKey(date)` | `toISOString().split('T')[0]` |
| Prefill `<input type="datetime-local">` | `localDateTimeValue(date)` | `toISOString().slice(0, 16)` |
| A token as a colour string (Chart.js, Leaflet) | `cssToken('green-9', '#30A46C')` | `getComputedStyle(…).getPropertyValue(…)` inline |
| Call the app's JSON API | `apiRequest(url, options)` — sends the CSRF token on writes, passes `FormData` through, and the thrown error has `.status`, `.data`, `.serverMessage` | a hand-rolled `fetch` with an `X-CSRF-Token` header |
| A date for display | `formatDate(d)` long, `formatDate(d, { short: true })` → `Jul 6, 2026`, `shortDate(d)` → `Jul 6` | a layout-level `formatDate` override |
| A copy button | `data-copy-text="…"` or `data-copy-target="#field"` on the button (toast confirms; `data-copy-label` to change it). From script: `dsCopy(text)` | a per-page `navigator.clipboard` handler |
| A toast with no pre-placed div | `dsToast('saved')`, `dsToast('sync failed', 'error')` | — (`showStatus(id, …)` is still right when the page owns a status div) |
| A flash from the server | render `.status-message.status-success` / `.status-error`; success hides itself after 3s | a `setTimeout` one-liner in the layout |
| An undo after a removal | `dsToast(msg, 'success', {action: {label: 'Undo', onClick}})` | a confirm dialog before a recoverable delete |
| Nothing to show | `.empty-state` markup, or `dsEmptyState(text, {icon, action, compact})` from JS | a bare "No items" string or a "Loading…" string left behind |
| Data is loading | `.skeleton` shapes inside the container, `apiRequest(url, {busy: container})` | "Loading…" text |
| A chart | `const t = dsChartTheme()` → `t.palette[i]`, `t.grid`, `t.axis`; Chart.js defaults and theme toggles are handled | `cssToken('green-9')` per dataset, hand-set tick colours |
| j/k through a list | `dsListKeys(container, {keys, onEnter, search})` | a page-local keydown handler |
| React to the theme | `document.addEventListener('ds:themechange', e => …e.detail.theme)` | polling `data-theme` |

Two helpers take a per-app default, set once in the layout, for apps that want the other behaviour everywhere: `formatDate.defaults.short = true` (budgeter, fitness) and `apiRequest.defaults.serverErrorMessage = true` (fitness — `error.message` becomes the server's `error` text instead of `HTTP error! status: 422`).

`goal-render.js` (base + fitness, beside `session-render.js`) exports `GoalRender.shortMonthDay`, `.parseGoalValue`, `.formatMinutes`, `.togglePlan`, `.toggleNotes` for the goal-detail screen the two apps share; its CSS is the **Goal pages** section of `design-system.css`.

### Empty states — `.empty-state` (v4.3)

One line of copy (§1 voice: what is empty, not an apology), an optional icon tile and at most one action. No illustration.

```html
<div class="empty-state">
  <span class="empty-state-icon"><span class="nav-ico" data-ico="inbox"></span></span>
  <p class="empty-state-text">No uncategorized transactions</p>
  <a class="btn btn-sm" href="/import">Import CSV</a>
</div>
```

`.empty-state--compact` is the one-line form for a table cell (`<td colspan="N">`) or a card that already has a title. The icon tile is one of the places the app accent may tint.

### Loading — `.skeleton` (v4.3)

Shapes that stand where the content will be: `.skeleton.skeleton-text` (a line; `style="--w: 60%"`), `.skeleton-row` (a table-row bar), `.skeleton-block` (`--h`). Put `aria-busy="true"` on the container — `apiRequest(url, {busy: el})` does it for the life of the request. The shimmer stops under reduced motion.

### Charts — `dsChartTheme()` and `--viz-*` (v4.3)

Series colours are `--viz-1…8` in that fixed order (blue, orange, teal, purple, amber, pink, indigo, green); validated for lightness band, CVD and normal-vision separation and 3:1 on the card in both themes. Never cycle past eight — fold the rest into "Other". `--viz-grid` and `--viz-axis` are the recessive grid and tick colours. Status colours (`--green/amber/red-*`) stay reserved for state, never "series 4". Call `dsChartTheme()` before building Chart.js charts; it sets the defaults and re-themes live charts on a theme toggle.

### Keyboard lists — `dsListKeys()` (v4.3)

Ledgers, inboxes and reminder lists share one keyboard: `j`/`k` move, `Enter` opens, `Esc` clears, `/` focuses the filter, plus per-page action keys (`c` categorize, `x` select…). The focus row is `.is-key-focus`. Show the keys in the page's `?` help or a `.kbd` hint, not in a toast.

### Mobile tab bar — engine shell (v4.4, M2)

Below 768px the shell renders a floating, translucent pill (`backdrop-filter` blur; solid `--card` where unsupported) with the app's first four nav items (or those marked `tab: true` in `nav_items`) plus **More**, which opens a bottom sheet with the remaining items and the app dock. Inactive tabs are 44px icons (label kept for screen readers); the active tab (`aria-current="page"`) shows its label on the accent tint. The sheet traps focus, closes on Esc / scrim / a link and returns focus to More. A page without a tab bar (postings) keeps the hamburger + drawer. Markup contract: README "Mobile tab bar". Config: `tab_bar`, `tab_count` in the gem.

### Stacked tables (v4.4, M2)

Below 768px a table opts into rows of cards; desktop is untouched and no table needs its own CSS.
- **`.table-stack`** — every `td[data-label="…"]` renders as a "label · value" line; `data-cell="select"` top-left, `"title"` first line, `"actions"` top-right, `"hide"` dropped; other cells span the card. A `tr.row-section` is a plain section label. The `.card` around the table steps back so the rows are the cards.
- **`.table-stack.table-stack--days`** — the ledger: `tr.stack-day` rows (hidden on desktop) are sticky day headers with `.stack-day-total`; rows are `data-cell="title"` + `"amount"` over `"meta"` + `"aside"`, optional `"select"` / `"actions"`; cells without a role hide.

### Page patterns (v4.4, round one)
Shared: `.list-rows--flush`, `.row-section-label--block`, `.detail-columns.reflow` + `.reflow-first` (a rail card second on the page below 1024px). Base Today: `.att-label`, `.att-list`, `.att-item`. Weekly review: `.rv-matrix(-wrap)`, `.rv-total`, `.rv-chip` (`--miss`, `--rest`), `.rv-low`, phone `.rv-days` / `.rv-day(-h/-b/-k)`, `.rv-row`. Budgeter inbox: `.card.pane-card` > `.pane-wrap` > `.pane-list` (`.pane-search`, `.pane-row` + `.is-current`) / `.pane-detail` (`.pane-back`, `.focus-title`, `.rule-box`/`-h`/`-line`/`-meta`, `.form-control--inline`, `.pane-foot`), `.kbd-bar`. Dashboard: `.hero-line`, `.meter-seg--due`, `.swatch--due`, `.swatch--warn`.

### Print (v4.3)

Pages print light with chrome, toolbars and row actions hidden, cards unsplit and tables in full. Mark anything else screen-only with `.no-print`; paper-only content (a printed date, a total) with `.print-only`.

### Card stacks — `.card-stack`

Wrap a page's stacked cards in `<div class="card-stack">` (flex column, 16px gap) instead of per-card `style="margin-bottom:16px"`. New pages use the wrapper; existing margin-bottom stacks are fine until touched.

### Danger zone — `.card.danger-zone`

Each app's settings page collects its destructive actions (wipe, restore-overwrite, mass delete) in ONE card marked `class="card danger-zone"` (red border, red `h3`), last on the page.

### Row actions — `.row-actions`

The action cluster at the end of a table/list row is `<span class="row-actions">` holding `btn-ghost btn-sm` (and at most one `btn-danger btn-sm`) buttons — never hand-rolled flex with custom padding. Overflow beyond ~3 actions collapses into a `⋮` ghost button + `.dropdown`.

### Filter chips — `.filter-chip`

Toggle-state filters (status tabs, category filters) are `.filter-chip` elements (`<a>` or `<button>`) with `.active` on the current one — not `btn-secondary` rows. Buttons stay for one-shot actions.

### Filter bar — `installFilterTags`

A list page's search-and-filter field, where each committed term becomes a tag. The field is built by `installFilterTags(el, opts)`; the page writes only the mount point, the "+ Filter" button and the error line:

```html
<div class="toolbar" style="align-items: flex-start;">
  <div id="goal-filters"></div>
  <button type="button" id="goal-add-filter" class="btn btn-secondary btn-sm filter-tags-add">+ Filter</button>
</div>
<div class="filter-tags-error" id="goal-filter-error"></div>
```

- **`.filter-tags-add`** on the builder button makes it the field's height (36px) whatever `.btn` size it carries. Never `style="height:36px"`. `installFilterTags` adds the class to its `builderButton` as well, but write it in the markup so the button does not grow on load.
- **`exact: true`** on a text or enum field makes `filterTagsMatch` compare the whole value rather than a substring — use it for enums whose values contain one another (`running` / `indoor_running`):

  ```js
  fields: { type: { type: 'enum', values: TYPES, exact: true }, keyword: { type: 'text' } }
  ```

  Fields without it match as substrings, as before. Array values (tags on a record) always match by element. Server-backed pages (`opts.navigate`) are unaffected — their controller does the matching.

### Forbidden color tokens

Use Radix scale tokens. Never use these legacy aliases:

| Don't | Use |
|---|---|
| `var(--success-500)` / `--success-600` | `var(--green-9)` / `var(--green-11)` |
| `var(--error-500)` / `--error-600` | `var(--red-9)` / `var(--red-11)` |
| `var(--warning-500)` / `--warning-600` | `var(--amber-9)` / `var(--amber-11)` |
| `var(--primary-400)` / `--primary-500` | `var(--accent-9)` |
| `var(--hover-bg)` | `var(--bg-subtle)` |
| `var(--bg-tertiary)` | `var(--bg-subtle)` |
| `var(--color-bg, #...)` | `var(--bg-subtle)` |
| `var(--color-border, #...)` | `var(--border)` |
| `var(--color-error/success/primary, #...)` | `var(--red-11)` / `var(--green-11)` / `var(--accent-9)` |

If a hex fallback is in your code, the token has been replaced — drop both the legacy var and the fallback.

### Number cells & amounts

Anything numeric — currency, counts, durations, distances, IDs, dates inside tables — is **mono + tabular-nums**:

```css
font-family: var(--font-mono);
font-variant-numeric: tabular-nums;
```

Sign + color for positive/negative values:
- Outflows / negative: `−$84.20` in `var(--red-11)`
- Inflows / positive: `+$3,400.00` in `var(--green-11)`

Use the unicode minus `−` (U+2212), not the hyphen `-`, so widths match the plus.

### Meters — `.meter`

For "spent against an allocation", not "task N% complete" (that is `.progress-bar`). A meter is **bounded**: clamp the fill at 100% and let colour report overspend, so an over-budget row can never look identical to a full one.

```html
<div class="meter meter--sm meter--over"><div class="meter-fill" style="width:100%"></div></div>
```

Modifiers: `--sm` / `--lg`, and `--over` / `--warn` / `--idle` / `--accent`. For a two-part split use `.meter-stack` with `.meter-seg--accent` + `.meter-seg--info` — pairing accent with `--success` renders as one undifferentiated bar in any app whose accent is already green. A "you are here" marker (`.meter-marker`) must be a **sibling** of `.meter` inside `.meter-wrap`, because `.meter` clips its children.

Two rules that came out of budgeter:

- **"Warn" means ahead of pace, not near the ceiling.** A bill paid in full sits at exactly 100% and is the definition of on-plan — it must read green. Warn when the share of the envelope spent meaningfully exceeds the share of the period elapsed, and only below 100%.
- **Summary rows never warn.** Group and total meters aggregate commitments that land early in the period, so a pace rule paints them amber for weeks at a time. Colour them accent, and reserve red for a genuine overspend.

### Grouped tables — `.row-section` / `.row-total`

A group label that carries its own subtotals **in the same columns**, instead of splitting the data into a card per group where no column lines up with any other.

```html
<tr class="row-section">
  <td><span class="row-section-label">Bills</span></td>
  <td class="td-amount">$2,370.00</td>
  …
</tr>
<tr class="row-total"><td>Total</td>…</tr>
```

Below ~768px a wide numeric table starves its label column to nothing. Stack the rows instead — and remember the `<table>` and `<tbody>` must become `display:block` too, not just the rows: grid `<tr>`s leave the table with no cells to size from and it shrink-wraps to ~100px.

### Tables

Wrap every `<table>` in `<div class="table-responsive">` so it scrolls inside its card on mobile instead of pushing the page wider. Dense embedded tables (modal detail tables, plan segments, logged sets) take `class="table-compact"` (12px) instead of an inline `font-size` — one class, same density everywhere. For column-aligned tables across multiple cards (e.g. the budget page's "Monthly Bills" + "Everyday Expenses"), use a shared class with explicit `<colgroup>` widths so headers and cells line up identically across cards.

Row pattern for a transaction-style list:
- Date — mono, muted, short ("Apr 22")
- Payee — bold + small muted memo line below
- Category — `.badge` with `.color-dot` (color via inline `style="background:var(--<radix>-9)"`)
- Amount — text-right, mono, colored (red outflow, green inflow)
- Source — mono, muted ("Amex")
- Action — `⋮` ghost button → dropdown

### Visual concept cards (over technical dumps)

When explaining how parts of a system relate (entities, layers, workflows), prefer a grid of **labelled accent-bordered cards** + a small visual nesting diagram. Avoid `<pre>` ASCII trees and `<code>`-tag-heavy bullet lists — they look like a SQL schema dump.

Pattern:

```html
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
  <div style="padding:14px;background:var(--bg-subtle);border:1px solid var(--border);border-left:3px solid var(--green-9);border-radius:var(--radius-sm)">
    <div style="font-weight:600;font-size:15px;margin-bottom:4px">Entity name</div>
    <div style="font-size:13px;color:var(--text-muted)">One-sentence plain-English description of what it is.</div>
  </div>
  <!-- repeat per concept, varying the left-border color from the categorical palette -->
</div>
```

Follow with a small nested-bullet list using colored dots for hierarchy, no monospace.

### Emoji policy

The brand says no emoji. The exceptions — characters that read as **functional UI symbols** rather than decoration — are these and only these:

| Allowed | Why |
|---|---|
| `✓` `✕` (`&#10003;` `&#10005;`) | completion / dismiss markers |
| `⋮` (`&#8942;`) | row action menu |
| `×` (`&times;`) | modal close |
| `←` `→` (`&larr;` `&rarr;`) | nav prev/next, or `‹` `›` for compact toolbars |
| `☰` (`&#9776;`) | mobile menu toggle |
| `☀` `☽` | theme toggle — drawn by the apps dock (`apps-launcher.js`); pages never render their own |
| `★` `☆` (`&#9733;` `&#9734;` `&#11088;`) | rating UI |
| `−` (`&#8722;`) | negative-amount sign (paired with `+`) |
| `·` `–` | typographic separators in mono meta lines |
| `▲` | trend up indicator (vitals chip) |
| `▸` | disclosure/expand marker (`<details>`, collapsible rows) |
| `😴` `❤️` `🚶` | vitals chip metrics — locked exception |
| `👟` `🚲` | gear glyphs in session meta lines (fitness) — locked exception |

Anything else (📊 📄 📋 🤖 📈 📉 🏆 💾 🗑️ ⚠️ ⚙️ ➕ ✏️ ✂️ 📅 ⬇️ 🔄 🎉 ⬛ ✅ 💰 📥 📂 etc.) does not appear in headings, button labels, or section titles. Use the chip + `.color-dot` system for categorical signaling instead.

### Settings / config pages — panes

**Every app's settings page is a `.settings-pane`: a section list on the left, one pane visible at a time.** (Joe's call, 2026-09-11; all six apps swept the same day. Supersedes the old "stack of full-width cards in a 1fr 1fr grid" pattern.) The page is never taller than its tallest section, and the danger zone becomes somewhere you choose to go rather than something you scroll past on the way to the README editor.

```html
<div class="settings-pane">
  <nav class="settings-nav" id="settingsNav">
    <a href="#categories" data-pane="categories">Categories</a>
    <a href="#connector"  data-pane="connector">Claude connector</a>
    <div class="settings-nav-label">Reference</div>
    <a href="#help"  data-pane="help">Help</a>
    <a href="#about" data-pane="about">About this app</a>
    <div class="settings-nav-label">Careful</div>
    <a href="#danger" data-pane="danger">Danger zone</a>
  </nav>
  <div>
    <section class="pane" data-pane="categories">…</section>
    <section class="pane" data-pane="connector" hidden>…</section>
  </div>
</div>
```

`initSettingsPanes()` (shared-core.js) wires it: shows one pane, marks the active nav link, keeps the `#hash` in sync for deep links and reloads, and fires a bubbling `settingspane:change` event so the page can swap its header actions.

Rules learned in the sweep:

- **Subscribe to `settingspane:change` BEFORE calling `initSettingsPanes()`** — it fires for the pane it opens with, and a listener attached afterwards misses it.
- **Modals live outside the pane grid.** An overlay hidden along with the pane it happened to sit in is a bug waiting to happen.
- **A form that POSTs should redirect back to its own pane** (`settings_path(anchor: "notifications")`), or saving bounces the user to the first pane.
- **Every app gets an "about this app" pane**: version, host, database size, record counts, connector tool count. Facts like these go stale silently when they live in prose — budgeter's connector card claimed "no tools registered yet" for two months after six shipped.
- **The connector pane renders from the app's `Mcp::ToolRegistry`**, never a hand-written list, so a newly registered tool appears on its own.

Use `.detail-list` (a `<dl>`) for labelled facts and `.tool-grid` / `.tool-item` for the MCP tool list, rather than per-app `.kv` / `.tool-pill` copies.

### Danger-zone card

```html
<div class="card danger-zone">
    <h3>Danger zone</h3>
    <p class="card-subtitle">Exactly what this deletes, what survives, and that it cannot be undone.</p>
    <button class="btn btn-danger" style="margin-top:var(--space-4)" onclick="…">Action verb</button>
</div>
```

Always require a confirm dialog — `dsConfirm()`, or a typed-confirmation modal for catastrophic actions like wipe-all.

**The button label and the modal must promise the same thing.** Budgeter's button said "Remove all transactions" while its modal said "delete ALL your data"; they were the same action, and the mismatch is the kind of thing that stops you trusting either one.

Note `.card-subtitle`, not `.stat-label`. `.stat-label` is the micro-label for stat tiles — used as body copy it renders whole sentences in caps (it did until v4.4), which is how it went unnoticed across four apps until the 2026-09-11 sweep.

### Session card + vitals chip (fitness pattern)

Cross-app shared widgets — paired with `session-render.js` and the `.session-card` / `.vitals-chip` / `.sleep-chip` / `.vitals-modal-grid` styles in `design-system.css`. See `session-render.js` for the global `SessionRender` API. Both the dashboard week grid and the calendar render through these helpers so they always look consistent. Don't fork them.

---

### Where a style lives: the shared stylesheet or the app's own (2026-11-24, PLAT-27)

Every app loads `design-system.css` (tokens, chrome, every component two or more apps use) and then its own `apps/<app>.css` (what only that app uses), from the same pinned release. A rule goes in the app's file while only that app's pages use its classes, and moves up to the shared file the moment a second app needs it. An override sits in the same file as the rule it overrides. App repos still hold no CSS. Details: README → "Two stylesheets".

### New pages render on the server; shared components ship a class and a helper (2026-11-24)

Two page styles coexist and neither is being rewritten: base, budgeter and fitness build most pages in the browser from JSON (`apiRequest` + template strings), while mealplanner, upkeep and postings render on the server (ERB). Every shared behaviour — loading, errors, undo, empty states, confirm dialogs — therefore exists twice. The rule from here on:

- **A new page is server-rendered** (ERB from the controller, plain links and forms, JS only for what the server cannot do — live filtering, drag, a chart). Client-built pages stay as they are until there is another reason to touch them; do not convert one for its own sake.
- **A new shared component ships both halves**: the CSS class in `design-system.css` (so ERB can render it directly) **and** a JS helper in `shared-core.js` that emits the same markup (so a client-built page can make it too) — `dsToast`/`.toast`, `dsConfirm`/`.modal`, `installFilterTags`/`.filter-tags` are the pattern. A component with only one half is unfinished.

The rails-app-template README carries the same rule for new apps.

## 14. Accessibility floor

Enforced by `scripts/check.mjs` on the kits; hold new pages to it.

- Text contrast ≥ 4.5:1 — including `--text-faint` (v4.3) and text on solid fills: use `--accent-solid`/`--accent-on`, `--danger-solid`/`--danger-on`, never `#fff` on step 9
- Focus visible on every interactive element: 2px `--focus-ring` (step 11, ≥ 3:1), never mixed with transparency, never `outline: none` without replacement
- Color is never the only signal — pair colored dots with text labels
- Tap targets ≥ 44×44px on touch — `--control-h` does it for controls; custom hit areas use the token
- All form fields have a `<label>` tied to the control (`for`/`id`, wrapping, or `dsEnhanceLabels()`), or an `.sr-only` one; icon-only buttons get `aria-label`
- Modals are dialogs with a name and trapped, restored focus (automatic via modal-keys.js); a danger confirm focuses Cancel
- `aria-current="page"` on the active nav link (automatic); `color-scheme` follows the theme (automatic)
- Text inputs 16px on mobile (automatic); `prefers-reduced-motion` honoured

---

## Appendix: token import (CSS)

For a project that cannot link `design-system.css`. Pull Radix from the `@radix-ui/colors` package. (`design-system.css` itself no longer `@import`s these — it inlines version 3.0.0; see §3.)

```css
@import "@radix-ui/colors/slate.css";
@import "@radix-ui/colors/slate-dark.css";
@import "@radix-ui/colors/indigo.css";
@import "@radix-ui/colors/indigo-dark.css";
@import "@radix-ui/colors/red.css";
@import "@radix-ui/colors/red-dark.css";
@import "@radix-ui/colors/green.css";
@import "@radix-ui/colors/green-dark.css";
@import "@radix-ui/colors/orange.css";
@import "@radix-ui/colors/orange-dark.css";
@import "@radix-ui/colors/amber.css";
@import "@radix-ui/colors/amber-dark.css";
@import "@radix-ui/colors/teal.css";
@import "@radix-ui/colors/teal-dark.css";
@import "@radix-ui/colors/blue.css";
@import "@radix-ui/colors/blue-dark.css";
@import "@radix-ui/colors/purple.css";
@import "@radix-ui/colors/purple-dark.css";
@import "@radix-ui/colors/pink.css";
@import "@radix-ui/colors/pink-dark.css";

:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'Geist Mono', 'SF Mono', Monaco, monospace;

  --radius-sm: 7px;
  --radius-md: 9px;

  --motion-fast: 120ms cubic-bezier(0.2, 0, 0, 1);
  --motion-base: 160ms cubic-bezier(0.2, 0, 0, 1);
  --motion-slow: 200ms cubic-bezier(0.2, 0, 0, 1);

  --bg:           var(--slate-1);
  --bg-subtle:    var(--slate-2);
  --panel:        var(--slate-3);
  --panel-hover:  var(--slate-4);
  --panel-active: var(--slate-5);
  --border:       var(--slate-6);
  --border-hover: var(--slate-7);
  --focus-ring:   var(--indigo-11);   /* the app accent's step 11 */
  --text:         var(--slate-12);
  --text-muted:   var(--slate-11);
  --text-faint:   color-mix(in srgb, var(--slate-11) 70%, var(--slate-10));
}

[data-theme="dark"] {
  /* Radix's *-dark.css already remaps the same var names */
}
```
