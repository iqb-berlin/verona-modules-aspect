# Image the CI jobs run in. Built and pushed by the `build-test-image` job in .gitlab-ci.yml,
# into this project's own GitLab registry - so a change here reaches the pipeline with the commit
# that makes it, and nobody needs an account of their own for it.
#
# Until #1364 this was pushed to Docker Hub by hand, five times since 2022 and each time by the
# one person holding the organisation account, under the tag `latest`: which Node a pipeline had
# run on was then a property of whatever had last been pushed, not of the commit.
#
# The tag in .gitlab-ci.yml carries the hash of THIS FILE, so a change here needs the tag changed
# with it - the build job compares the two and fails if they drift apart. Print the tag with:
#
#   echo "node24-$(sha256sum scripts/Dockerfile | cut -c1-12)"
#
# To try a change before pushing it, build it and run the checks over a clean copy of the tree
# (`git archive`, so neither node_modules nor root-owned build output lands in the working tree):
#
#   docker build -f scripts/Dockerfile -t aspect-test:probe scripts/
#   mkdir /tmp/probe && git archive HEAD | tar -x -C /tmp/probe
#   docker run --rm -v /tmp/probe:/app -w /app aspect-test:probe \
#     bash -lc 'npm ci && npx playwright install chromium && npm run lint && npm test'
#
# The base image names a Node PATCH version, and that is what pins the npm the pipeline runs -
# every Node 24 patch brings another one, from 11.6.1 in 24.11.0 to 11.19.0 in 24.20.0. Two npm
# builds do not accept each other's lock file: 11.19.0 answers a file written by 11.6.2 with
# `Missing: @emnapi/core@1.11.3 from lock file`, and 11.6.2 answers one written by 11.19.0 with
# `Missing: readdirp@5.1.1`. A floating tag therefore turns the pipeline red on a day nobody
# committed anything - which is what it did while #1448 was open. `.nvmrc` names the same version,
# so development writes the file CI reads.
#
# The npm here announces a gate it does not yet close: `npm ci` names six packages whose install
# scripts are "not yet covered by allowScripts" and runs them anyway, and `npm install-scripts ls`
# offers `approve` and `deny` without either being required. Whoever bumps into an npm that closes
# it decides which of the six may run - only Cypress needs its script, which is where its binary
# comes from; after `npm ci --ignore-scripts` the other five load and work from their prebuilt
# packages, and Cypress alone is missing (#1452).
#
# Bumping it is one commit: this line, BASE_IMAGE in .gitlab-ci.yml, `.nvmrc`, `engines` in
# package.json, and the lock file rewritten with the npm the new version ships.

# Passed in by the build job so the base image comes through the group's dependency proxy rather
# than from Docker Hub directly, where the shared runner IP shares one anonymous pull quota with
# every other project on it.
ARG BASE_IMAGE=node:24.20.0-bookworm

FROM ${BASE_IMAGE}

RUN apt update && apt install -y chromium curl jq \
 libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libnss3 libxss1 libasound2 libxtst6 xauth xvfb
