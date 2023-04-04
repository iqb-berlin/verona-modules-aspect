#!/bin/bash

if [ $# -lt 2 ]; then
    echo 'Not enough parameters! Pass editor/player and the version.'
    exit 1
fi

node node_modules/iqb-dev-components/src/js_css_packer.js dist $1 dist
cp projects/$1/src/html_wrapper/index.html dist/index.html
sed -i -e 's/version-placeholder/'${2}'/g' dist/index.html
node scripts/distpacker.js dist iqb-$1-aspect-$2.html $1
cp dist/iqb-$1-aspect-$2.html dist/iqb-$1-aspect-nightly.html
sed -i -e 's/'${2}'/9.9.9-rc/g' dist/iqb-$1-aspect-nightly.html
