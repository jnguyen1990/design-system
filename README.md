# Design System

Shared CSS design system for Joe Nguyen's self-hosted web applications. Provides consistent theming, component styles, and responsive layout across all apps.

## Usage

Include via CDN in your HTML:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/jnguyen1990/design-system@8f783f6/design-system.css">
```

## Apps Using This System

- **Hub** — hub.joenguyen.ca
- **Budgeter** — budgeter.joenguyen.ca
- **Fitness** — fitness.joenguyen.ca

## Features

- Light/dark theme toggle via `data-theme` attribute
- CSS custom properties for colors, spacing, typography
- Responsive sidebar layout with mobile menu
- Component classes: `.card`, `.btn`, `.form-control`, `.table`, `.modal`, `.badge`, `.stat-card`
- Mobile-first breakpoints (768px, 1024px)
