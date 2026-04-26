# Slides — Sample deck

Sample slide deck demonstrating the brand language at 1920×1080. Open `index.html`.

## Slide types
1. **Cover** — large display type, logo, eyebrow date
2. **Agenda** — numbered list, mono numerals, generous row height
3. **Big stat** — three-up tabular-nums numbers with suffixes
4. **App grid** — 2×2 cards with logo + accent + one-line description
5. **Big quote** — slate-12 inverted slide for a brand pillar
6. **Comparison** — do/don't side-by-side using `red-2` and `green-2` tinted cards

## Design rules in play
- All numerals (slide counters, stats, dates) in Geist Mono with `tabular-nums`.
- Eyebrows are lowercase mono (`agenda`, `by the numbers`) with a single accent dot.
- Body text size 24–32px on slides; display 96–144px.
- One inverted slide max per deck; never gradient backgrounds.
- Footer bar with mono slide counter + section label, separated by a 1px border-top.

## Usage
The shell is `deck-stage.js` (auto-scales to viewport, ←/→ to nav, P to print to PDF). Each slide is a direct-child `<section>`.
