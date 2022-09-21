#!/bin/bash

wget https://download.geogebra.org/package/geogebra-math-apps-bundle

unzip -o geogebra-math-apps-bundle -d projects/common/assets/GeoGebra

rm projects/common/assets/GeoGebra/README.txt
rm geogebra-math-apps-bundle
