# Budgeter — UI kit

Personal finance ledger. Transaction list + accounts + budgets.

## Accent
`green` (used in logo, sidebar dots for income, primary surfaces of empty states).
**Chrome stays neutral** — buttons, modals, table chrome are slate-only. The brand spec is strict on this.

## Components
- `AccountsBar` — top row of account balance cards
- `TxTable` — sortable transaction table with categorical chip per row
- `BudgetRow` — category budget with progress bar (turns red when over)
- Plus shared: `Sidebar`, `PageHeader`, `CommandPalette`, modal "New transaction" form

## Screens demonstrated
- Recent activity (default landing)
- New transaction modal (⌘N)
- Command palette (⌘K)

## Categorical mapping
| Color | Category |
|---|---|
| green | groceries, income |
| red | housing |
| purple | subscriptions |
| amber | transport |
| orange | dining |

## Caveats
Greenfield mock — no codebase or Figma was provided. Numeric values are illustrative. Currency formatting is US-only.
