#!/bin/bash
set -eu

if [ $# -lt 2 ]; then
    echo 'Not enough parameters! Pass editor/player and the version.'
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
sed -i -e "s/model-range-placeholder/>=${MIN_VERSION} <=${MAX_VERSION}/g" "$INDEX"

# Verify the substitutions above produced well-formed values, asserting the shape the
# result MUST have. Every failure mode here is silent otherwise: sed exits 0 when it
# matches nothing, and an empty MIN_VERSION/MAX_VERSION substitutes just as quietly.
# That is how a wrong "model" value reached develop (#1208, #1211).
# Has to run before distpacker.js below, which inlines the packed JS and CSS — those
# carry their own "placeholder" occurrences from Angular Material.
assert_metadata() {
  # $1 = regex the field must match, $2 = field name for the error message
  if ! grep -Eq "$1" "$INDEX"; then
    echo "ERROR: metadata field \"$2\" in $INDEX was not substituted correctly:" >&2
    grep -E '"(model|version)":' "$INDEX" >&2
    exit 1
  fi
}

assert_metadata '"version": "[0-9]+\.[0-9]+\.[0-9]+[^"]*"' version
assert_metadata '"model": "aspect@>=[0-9]+\.[0-9]+ <=[0-9]+\.[0-9]+"' model

# Create final file by merging intermediate files into index.html
node scripts/distpacker.js dist/$1 iqb-$1-aspect-$2.html

# Copy final file to dist root
mv dist/$1/iqb-$1-aspect-$2.html dist/
