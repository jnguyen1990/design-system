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

## 13. Accessibility floor

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
