---
name: joes-apps-design
description: Use this skill to generate well-branded interfaces and assets for Joe's Personal Apps (Base, Budgeter, Fitness, and future self-hosted personal apps), either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping. The aesthetic is Linear-meets-Things-3 — sharp, precise, technical, with breathing room.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. Link `colors_and_type.css` then `components.css` from each HTML page. Reach for semantic tokens (`var(--text)`, `var(--panel)`, `var(--border)`) — not raw Radix scales — so light/dark parity is automatic.

If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

Key rules to internalize:
- Lowercase UI labels where clarity allows (`new entry`, `today`); sentence case for buttons (`Add transaction`).
- Geist Mono for **all** numbers, IDs, timestamps, kbd hints — with `tabular-nums`.
- No emoji. Anywhere. Categorical Radix colors do the work emoji might otherwise do.
- Chrome stays neutral (slate). Per-app accent appears only in logo, favicon, empty-state tint, onboarding.
- Cards are flat (no shadow). Shadows reserved for floating elements (popover, dropdown, modal).
- Hover = next slate step (panel→panel-hover). Never opacity, never lift, never scale.
- Density floor: 36px controls, 36–40px rows. Spacious, not cramped.
- Empty states: one line of copy, no illustration. Errors: name what's wrong, not what to do.
- Animation is minimal: `120ms`/`160ms`/`200ms`, ease-out only.

Folder layout:
- `README.md` — full brand + content + visual + iconography spec
- `colors_and_type.css` — Radix imports, type/spacing/radius/motion vars, semantic tokens, base element styles
- `components.css` — buttons, inputs, cards, badges, kbd, sidebar items, tables, modals
- `preview/` — Design System tab cards
- `assets/` — app logos
- `ui_kits/{base,budgeter,fitness}/index.html` — reconciled static-HTML kits using the live `design-system.css` from CDN, modeled on real Rails ERB pages

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
