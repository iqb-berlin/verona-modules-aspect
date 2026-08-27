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
# Node follows what Angular asks for (^22.12.0 || >=24.0.0, see `engines` in package.json); 24 is
# the version development runs on, and therefore the one whose npm generation the lock file is
# maintained with.

# Passed in by the build job so the base image comes through the group's dependency proxy rather
# than from Docker Hub directly, where the shared runner IP shares one anonymous pull quota with
# every other project on it.
ARG BASE_IMAGE=node:24-bookworm

FROM ${BASE_IMAGE}

RUN apt update && apt install -y chromium curl jq \
 libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libnss3 libxss1 libasound2 libxtst6 xauth xvfb
