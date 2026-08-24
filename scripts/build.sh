#!/bin/bash
set -eu

if [ $# -lt 2 ]; then
    echo 'Not enough parameters! Pass editor/player and the version.'
    exit 1
fi

# The version is spliced into a sed replacement below, where &, / and \ are special.
# "3.0.0&x" would substitute the match back in and yield a silently wrong version.
if ! [[ $2 =~ ^[0-9]+\.[0-9]+\.[0-9]+[0-9A-Za-z.-]*$ ]]; then
    echo "ERROR: '$2' is not a plain version string (expected e.g. 3.0.0 or 3.0.0-beta.2)" >&2
    exit 1
fi

# Clear Angular cache, since it made problems in the past
rm -rf .angular/cache

# Build Angular project
ng build --project $1 --output-hashing=none

# Pack JS and CSS; results in player.js and player.css (or editor)
node node_modules/iqb-dev-components/src/js_css_packer.js dist $1 dist/$1

# Use prepared HTML that references the intermediate build artifacts above
INDEX="dist/$1/index.html"
cp projects/$1/src/index-prod.html "$INDEX"

# Insert version to metadata
sed -i -e 's/version-placeholder/'${2}'/g' "$INDEX"

# Insert supported unit definition version range (major.minor) into the metadata "model" field:
# from the minimum processable version up to the current (maximum) version.
MIN_VERSION=$(node -p "require('./package.json').config.unit_definition_min_version.split('.').slice(0,2).join('.')")
MAX_VERSION=$(node -p "require('./package.json').config.unit_definition_version.split('.').slice(0,2).join('.')")

# A reversed range is well-formed but matches no unit definition at all, so no
# assertion on the substituted text can catch it — compare the bounds themselves.
if [ "$(printf '%s\n%s\n' "$MIN_VERSION" "$MAX_VERSION" | sort -V | head -n 1)" != "$MIN_VERSION" ]; then
    echo "ERROR: unit definition range is empty: >=$MIN_VERSION <=$MAX_VERSION" >&2
    exit 1
fi

MODEL_RANGE=">=${MIN_VERSION} <=${MAX_VERSION}"
sed -i -e "s/model-range-placeholder/${MODEL_RANGE}/g" "$INDEX"

# Verify the substitutions above landed. Every failure mode here is silent otherwise:
# sed exits 0 when it matches nothing, and empty bounds substitute just as quietly.
# That is how a wrong "model" value reached develop (#1208, #1211).
# Both expected values are known here, so compare against them literally rather than
# against a shape — a shape accepts anything that merely looks right.
# Has to run before distpacker.js below, which inlines the packed JS and CSS: those
# carry their own "version"/"placeholder" occurrences and would mask a broken block.
assert_metadata() {
  local expected=$1 field=$2
  if ! grep -Fq "$expected" "$INDEX"; then
    echo "ERROR: metadata field \"$field\" in $INDEX is not [$expected]:" >&2
    grep -E '"(model|version)":' "$INDEX" >&2
    exit 1
  fi
}

assert_metadata "\"version\": \"$2\"" version
assert_metadata "\"model\": \"aspect-unit-definition@${MODEL_RANGE}\"" model

# Create final file by merging intermediate files into index.html
node scripts/distpacker.js dist/$1 iqb-$1-aspect-$2.html

# Copy final file to dist root
mv dist/$1/iqb-$1-aspect-$2.html dist/
