#!/bin/bash

# Waits until an Angular dev server answers, then warms up its main bundle.
#
# Replaces a plain "until curl; do sleep 5; done" loop in the CI e2e job, which had two
# problems: it never gave up (a dev server that came up but stopped answering blocked the
# job until the pipeline timeout), and it declared the server ready as soon as index.html
# was served. The dev server answers index.html before it has served main.js, so the first
# cy.visit() could still run into Cypress' 30s responseTimeout and fail the run with
# ESOCKETTIMEDOUT.
#
# Usage: wait-for-dev-server.sh <url> <name> [timeout_seconds]

set -euo pipefail

url="$1"
name="$2"
timeout_seconds="${3:-300}"

deadline=$((SECONDS + timeout_seconds))

echo "Waiting for ${name} at ${url} (timeout ${timeout_seconds}s)..."
until curl -sSf --max-time 10 "${url}" > /dev/null 2>&1; do
  if [ "${SECONDS}" -ge "${deadline}" ]; then
    echo "${name} did not answer within ${timeout_seconds}s - see the server log artifact." >&2
    exit 1
  fi
  sleep 5
done

echo "${name} answered after ${SECONDS}s, warming up main bundle..."
if curl -sSf --max-time 120 "${url}/main.js" > /dev/null 2>&1; then
  echo "${name} ready after ${SECONDS}s!"
else
  # Not fatal: the run may still succeed, but the first cy.visit() then pays for the
  # compile and the log tells us so if it times out instead.
  echo "Warning: ${name} did not serve main.js (request failed or timed out) - continuing anyway." >&2
fi
