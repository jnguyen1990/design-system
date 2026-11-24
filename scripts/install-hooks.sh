#!/bin/bash
# Point this clone's git hooks at the tracked .githooks/ (pre-push runs the
# unit tests and scripts/check.mjs) and install the dev tooling. Run once per
# clone: scripts/install-hooks.sh
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
git config core.hooksPath .githooks
if command -v /usr/local/bin/mise >/dev/null; then /usr/local/bin/mise exec node@22 -- npm install --no-fund --no-audit
else npm install --no-fund --no-audit; fi
echo "hooks: core.hooksPath=.githooks (pre-push → tests + kit check)"
