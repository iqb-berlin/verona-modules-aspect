#!/bin/bash

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
cp projects/$1/src/index-prod.html dist/$1/index.html

# Insert version to metadata
sed -i -e 's/version-placeholder/'${2}'/g' dist/$1/index.html

# Create final file by merging intermediate files into index.html
node scripts/distpacker.js dist/$1 iqb-$1-aspect-$2.html

# Copy final file to dist root
mv dist/$1/iqb-$1-aspect-$2.html dist/
