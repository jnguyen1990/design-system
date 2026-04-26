# Fitness — UI kit

Workout log. Sessions, lifts, sets.

## Accent
`orange` (logo, today's session, progress chips). Chrome stays neutral.

## Components
- `Stat` — small metric card (volume, streak, sessions)
- `SessionCard` — pre-defined workout template, click to start
- `LiftRow` — single lift with set chips (filled green when complete)
- Plus shared: `Sidebar`, `PageHeader`, `CommandPalette`

## Screens demonstrated
- Today (active session in progress + sessions list + week stats)

## Patterns
- Set chips use `green-3` background + `green-6` border when done; neutral `panel` when pending — matches the brand spec's "categorical color = chips, never surface" rule.
- Lift weights and reps always Geist Mono / tabular-nums.
- Empty state for "no workouts logged" would be a single line: `0 workouts logged.`

## Caveats
Greenfield mock. Lift schemes and weights are illustrative. No real-time set timer wired up.
