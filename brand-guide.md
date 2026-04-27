# Joe's Personal Apps — Brand & Design System

A unified design language for personal self-hosted apps (Hub, Budgeter, Fitness, and future projects). Optimized for the Linear-meets-Things-3 aesthetic: sharp and precise, with breathing room.

---

## 1. Brand pillars

**Sharp. Precise. Technical.**

Apps feel like considered tools. Linear's edge with Things 3's spaciousness. No marketing fluff, no warmth-for-warmth's-sake, no ornament. Every pixel earns its place.

### Voice & tone
- Direct. No hype, no exclamation points.
- Lowercase UI labels where it doesn't hurt clarity (`new entry`, `today`, `archive`).
- Sentence case — never Title Case — for buttons and menus.
- Monospace for anything data-shaped: IDs, timestamps, currency, counts, keyboard shortcuts.
- Empty states: one short line of copy, no illustration.
- Error messages name what's wrong, not what to do (`Amount required` not `Please enter an amount`).

---

## 2. Typography

| Role | Family | Source |
|---|---|---|
| Sans (body, UI) | **Inter** | Google Fonts |
| Mono (data, code, kbd) | **Geist Mono** | `geist-font` package / jsDelivr |

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'Geist Mono', 'SF Mono', Monaco, 'Cascadia Code', monospace;
```

### Scale (16px root)
```css
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
- Line height: **1.5** body, **1.25** headings, **1.0** mono numerics
- Mono numerics use `font-variant-numeric: tabular-nums` for alignment

---

## 3. Color

### Foundation: Radix Colors

Use **Radix Colors** as the source of truth. 12-step scales, paired light + dark, accessible by step.

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
/* Light + dark are paired automatically by Radix */
--bg:           var(--slate-1);    /* page background */
--bg-subtle:    var(--slate-2);    /* subtle surface, card fill */
--panel:        var(--slate-3);    /* raised UI rest */
--panel-hover:  var(--slate-4);
--panel-active: var(--slate-5);
--border:       var(--slate-6);    /* default border */
--border-hover: var(--slate-7);
--focus-ring:   var(--slate-8);
--text:         var(--slate-12);
--text-muted:   var(--slate-11);
--text-faint:   var(--slate-10);
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

### Per-app brand accent

The app UI stays neutral. Each app picks **one** Radix accent for branding moments only:

| App | Accent |
|---|---|
| Hub | `slate` (system default — neutral) |
| Budgeter | `green` |
| Fitness | `orange` |
| Future apps | one Radix accent each, no repeats |

The brand color appears in: logo, favicon, empty-state illustration tint, onboarding pages, loading states. **Not** in primary buttons or chrome — those use the neutral system or a shared `indigo` accent.

---

## 4. Spacing

8px base, with 4px halfsteps for tight UI.

```css
--space-0_5: 2px;   /* hairline gap */
--space-1:   4px;   /* icon-to-text in dense rows */
--space-2:   8px;   /* tight padding */
--space-3:  12px;   /* control padding */
--space-4:  16px;   /* default gap, card padding */
--space-6:  24px;   /* section spacing */
--space-8:  32px;   /* page header to content */
--space-12: 48px;   /* major sections */
--space-16: 64px;   /* hero spacing */
```

**Density target: spacious.**
- Default row height: 36–40px (not 28)
- Default form input height: 36px
- Default button height: 36px (sm: 32, lg: 40)

---

## 5. Layout

- **Width:** wide / responsive. Sidebar + main fills viewport. No artificial centered max-width on dashboard surfaces.
- **Sidebar:** 240–260px fixed width. Things 3 style — colored dots before items, no section dividers, generous vertical rhythm, hover = `panel` background only.
- **Main padding:** 32px horizontal, 24px top, more below.
- **Reading views** (long-form notes, settings, account pages): cap content width at 720px, centered.

### Mobile rules (already in repo README)
- All pages render at 375px wide with zero horizontal page-level scroll
- Tables wrap in `.table-responsive`
- Page-header controls use `.toolbar` (flex-wrap)
- Grids collapse to 1–2 columns under 768px
- Calendars switch to per-day list under 768px

---

## 6. Surfaces

### Corners
```css
--radius-sm: 4px;   /* buttons, inputs, badges, chips */
--radius-md: 6px;   /* cards, panels, modals */
--radius-lg: 8px;   /* page-level containers */
```
Never larger than 8px. No pills.

### Cards
```css
.card {
  background: var(--bg-subtle);          /* slate-2 */
  border: 1px solid var(--border);       /* slate-6 */
  border-radius: var(--radius-md);
  padding: 20px;                          /* sm:16, lg:24 */
  /* no shadow — shadows reserved for floating elements */
}
.card:hover {                             /* if interactive */
  border-color: var(--border-hover);      /* slate-7 */
}
```

### Elevation
- **Resting:** flat, no shadow
- **Interactive hover:** border darkens, no lift
- **Floating** (popover, dropdown, modal):
  ```css
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);     /* light */
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);      /* dark */
  border: 1px solid var(--border);
  ```

---

## 7. Buttons

Linear-style: solid fill + subtle inner highlight + tiny shadow. Tactile, not skeuomorphic.

### Primary
```css
.btn-primary {
  background: var(--indigo-9);
  color: white;
  border: 1px solid var(--indigo-10);
  border-radius: var(--radius-sm);
  height: 36px;
  padding: 0 12px;
  font: 500 13px/1 'Inter', sans-serif;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.12),
    0 1px 2px rgba(0,0,0,0.08);
  transition: background 120ms ease-out, border-color 120ms ease-out;
}
.btn-primary:hover  { background: var(--indigo-10); }
.btn-primary:active { background: var(--indigo-11); }
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
Same structure as primary, swap `--indigo-*` for `--red-*`.

### Sizes
- `sm`: height 32px, padding 0 10px, font 12px
- `default`: height 36px, padding 0 12px, font 13px
- `lg`: height 40px, padding 0 16px, font 14px

### Focus
```css
outline: 2px solid var(--indigo-7);
outline-offset: 2px;
```

---

## 8. Forms

```css
.input {
  height: 36px;
  padding: 0 12px;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font: 400 14px 'Inter', sans-serif;
}
.input::placeholder { color: var(--text-faint); }
.input:focus {
  border-color: var(--focus-ring);
  outline: 2px solid var(--indigo-7);
  outline-offset: 0;
  outline-color: color-mix(in srgb, var(--indigo-7) 30%, transparent);
}
.input[aria-invalid="true"] {
  border-color: var(--red-7);
}
```

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

- No page transitions
- Respect `prefers-reduced-motion: reduce`
- Easing is always ease-out (sharp start, soft end)

---

## 11. Component patterns

### Sidebar list item (Things 3 style)
```
┌──────────────────────────────────────────┐
│  ●  Item label                       ⌘1  │
└──────────────────────────────────────────┘
```
- 8px colored dot (`--{category}-9`), 10px gap to label
- Item height: 32px, padding: 6px 12px
- Hover: `--panel` background, no border change
- Selected: `--panel-hover` background, dot becomes filled chip
- Kbd hint: Geist Mono 11px, `--text-faint`

### Status badge
```
┌────────────┐
│ ● Active   │
└────────────┘
```
```css
.badge {
  display: inline-flex; align-items: center; gap: 6px;
  height: 20px; padding: 0 8px;
  background: var(--{color}-3);
  color: var(--{color}-11);
  border: 1px solid var(--{color}-6);
  border-radius: var(--radius-sm);
  font: 500 11px 'Inter', sans-serif;
}
.badge-dot { /* leading dot */
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--{color}-9);
}
.badge-numeric { font-family: 'Geist Mono', monospace; }
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

### Modal
- Width: 480px (sm), 640px (default), 800px (lg)
- Background: `--bg`
- Border: 1px `--border`
- Radius: `--radius-md`
- Shadow: floating shadow (see §6)
- Backdrop: `rgba(0,0,0,0.4)` light, `rgba(0,0,0,0.6)` dark

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
    <p class="stat-label">One-line description of what this section does.</p>
    <!-- form fields, table, list, chart, etc. -->
    <div class="d-flex gap-2" style="margin-top:12px">
        <button class="btn btn-primary btn-sm">Primary action</button>
        <button class="btn btn-secondary btn-sm">Secondary</button>
    </div>
</div>
```

- **`<h3>`** for section titles (no `<h2>` inside cards — `<h2 class="page-title">` is reserved for the page header rendered by the layout).
- **Sentence case** for headings, labels, and button text. "Backup & restore", not "Backup & Restore". Acronyms keep their case (CSV, ID, MCP, HRV).
- **`<p class="stat-label">` description** below the heading. Explains what the section is for in one short sentence.
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

**Forbidden:** `btn-success`, `btn-error`, `btn-warning`, `btn-info`. Color a button by intent (`btn-primary` for "go", `btn-danger` for destructive), not by mood.

**Sizes:** `btn-sm` for in-card and table-row actions. Plain `btn` for stand-alone primary CTAs at the page level. Pick one size per row and stick with it — never mix `btn` and `btn-sm` in the same action group.

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

### Tables

Wrap every `<table>` in `<div class="table-responsive">` so it scrolls inside its card on mobile instead of pushing the page wider. For column-aligned tables across multiple cards (e.g. the budget page's "Monthly Bills" + "Everyday Expenses"), use a shared class with explicit `<colgroup>` widths so headers and cells line up identically across cards.

Row pattern for a transaction-style list:
- Date — mono, muted, lowercase short ("apr 22")
- Payee — bold + small muted memo line below
- Category — `.badge` with `.color-dot` (color via inline `style="background:var(--<radix>-9)"`)
- Amount — text-right, mono, colored (red outflow, green inflow)
- Source — mono, muted, lowercase ("amex")
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
| `☀` `🌙` | theme toggle |
| `★` `☆` (`&#9733;` `&#9734;` `&#11088;`) | rating UI |
| `−` (`&#8722;`) | negative-amount sign (paired with `+`) |
| `·` `–` | typographic separators in mono meta lines |
| `▲` | trend up indicator (vitals chip) |
| `😴` `❤️` `🚶` | vitals chip metrics — locked exception |

Anything else (📊 📄 📋 🤖 📈 📉 🏆 💾 🗑️ ⚠️ ⚙️ ➕ ✏️ ✂️ 📅 ⬇️ 🔄 🎉 ⬛ ✅ 💰 📥 📂 etc.) does not appear in headings, button labels, or section titles. Use the chip + `.color-dot` system for categorical signaling instead.

### Settings / config pages

A settings page is a stack of full-width cards, one per concern (Integrations, MCP, Backup & restore, Danger zone, Help, etc.). Two-column grid layouts (`grid-template-columns: 1fr 1fr; gap: 20px`) work for related-pair sections (e.g. Fitness app + iCloud, Google Calendar + Telegram). MCP / advanced cards span full width via `grid-column: 1 / -1`. Save/Test buttons inside an integration card go side-by-side with `gap:8px` and consistent sizing (both `btn-sm`).

### Danger-zone card

```html
<div class="card" style="margin-bottom:16px;border-color:var(--red-9)">
    <h3 style="color:var(--red-11)">Danger zone</h3>
    <p class="stat-label">What this deletes, and that it cannot be undone.</p>
    <button class="btn btn-danger btn-sm" style="margin-top:12px" onclick="…">Action verb</button>
</div>
```

Always require a confirm dialog (`confirm()` or a typed-confirmation modal for catastrophic actions like wipe-all).

### Session card + vitals chip (fitness pattern)

Cross-app shared widgets — paired with `session-render.js` and the `.session-card` / `.vitals-chip` / `.sleep-chip` / `.vitals-modal-grid` styles in `design-system.css`. See `session-render.js` for the global `SessionRender` API. Both the dashboard week grid and the calendar render through these helpers so they always look consistent. Don't fork them.

---

## 14. Accessibility floor

- Body text contrast ≥ 4.5:1 (Radix step 11/12 over step 1/2 passes)
- Focus visible on every interactive element (2px ring, never `outline: none` without replacement)
- Color is never the only signal — pair colored dots with text labels
- Tap targets ≥ 36×36px on mobile
- All form fields have a `<label>` (visible or `sr-only`)

---

## Appendix: token import (CSS)

Drop this into your app's stylesheet to inherit the system. Pull Radix from `@radix-ui/colors` or via CDN.

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

  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;

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
  --focus-ring:   var(--slate-8);
  --text:         var(--slate-12);
  --text-muted:   var(--slate-11);
  --text-faint:   var(--slate-10);
}

[data-theme="dark"] {
  /* Radix's *-dark.css already remaps the same var names */
}
```
