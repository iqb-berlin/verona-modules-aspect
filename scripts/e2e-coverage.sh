#!/bin/bash

# Runs the e2e suite against the instrumented builds, so that it leaves a coverage report behind.
#
# The ordinary dev servers (`npm run start-editor-local`) carry no counters: `@cypress/code-coverage`
# then finds no `window.__coverage__`, warns that the application was not instrumented and writes an
# empty report. The `serve-coverage` targets add the counters through webpack.coverage.config.js;
# their build is slower and unoptimised, which is why they are not what the pipeline's e2e job uses.
#
# Where the report lands is decided by .nycrc.json (coverage/by-project/e2e/), which is where
# merge-coverage.sh looks for it. Run this before `npm run test:coverage`, whose merge picks it up.
#
# The two servers are started here and taken down again on the way out, whether the suite passed or
# not; their output goes to editor.log and player.log, as it does in the pipeline.
#
# Usage: e2e-coverage.sh

set -euo pipefail

editor_pid=""
player_pid=""

# The children first, then the process this script holds: `npx` hands the work to a child `ng`,
# which keeps the port when only the npx process is killed -- the next run then dies with "Port 4201
# is already in use". Killed by pid rather than by name, so that a serve-coverage someone else
# started in another terminal survives.
cleanup() {
  for pid in "${editor_pid}" "${player_pid}"; do
    [ -n "${pid}" ] || continue
    pkill -P "${pid}" 2> /dev/null || true
    kill "${pid}" 2> /dev/null || true
  done
}
trap cleanup EXIT

# A port that is already taken is the quiet version of this failing: the server below then dies in
# the background, where `set -e` does not reach, the wait below is answered by whatever holds the
# port, and the run goes through green against an application without counters.
for port in 4201 4202; do
  if curl -sSf --max-time 5 "http://localhost:${port}" > /dev/null 2>&1; then
    echo "Something already answers on port ${port} - stop it first, this script needs both ports." >&2
    exit 1
  fi
done

# Without this the runs add up: the plugin reads an existing out.json when it loads and, headless,
# resets nothing. A line covered last week would still count as covered, and the number could never
# fall. The report of the previous run goes too, so that what is left always belongs to this one.
rm -rf .nyc_output coverage/by-project/e2e

npx ng run editor:serve-coverage > editor.log 2>&1 &
editor_pid=$!
npx ng run player:serve-coverage > player.log 2>&1 &
player_pid=$!

./scripts/wait-for-dev-server.sh http://localhost:4201 Editor
./scripts/wait-for-dev-server.sh http://localhost:4202 Player

# The one thing the whole run depends on, and the one thing nothing else notices: without the
# counters Cypress collects an empty coverage and still reports every spec as passed.
for port in 4201 4202; do
  bundle="$(mktemp)"
  curl -sSf --max-time 300 "http://localhost:${port}/main.js" -o "${bundle}"
  if ! grep -q "__coverage__" "${bundle}"; then
    rm -f "${bundle}"
    echo "The bundle on port ${port} carries no coverage counters - is that really serve-coverage?" >&2
    exit 1
  fi
  rm -f "${bundle}"
done

npm run e2e-headless
