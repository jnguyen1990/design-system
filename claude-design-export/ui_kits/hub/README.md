# Hub — UI kit

The neutral launcher. Cross-app inbox, command palette, app grid.

## Accent
`slate` (system default — neutral chrome only).

## Components
- `Sidebar` (shared) — Things 3-style item list with categorical dots
- `PageHeader` (shared) — title + actions
- `CommandPalette` (shared) — ⌘K modal
- `HubAppGrid` — interactive cards launching each personal app
- `HubInbox` — flat list of cross-app notifications, single-row per item
- `HubQuickEntry` — single-line text input for fast capture

## Screens demonstrated
- Today (sidebar selected: today) — quick entry + apps grid + inbox

## Interactions
- ⌘K opens the command palette
- Clicking an app card "launches" it (no-op in this mock)
- Quick entry: typing + ↵ prepends to the inbox
- Sidebar items toggle selection state

## Caveats
- This is a greenfield mock — no codebase or Figma was provided. UI matches the brand spec exactly but isn't reconciled against any real Hub implementation.
