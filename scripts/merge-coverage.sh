#!/bin/bash

# Builds one coverage report over all five test projects, above the five they each wrote.
#
# Why a merge at all: `projects/common` is exercised by every project, so no single report says
# how well it is covered - the common run only shows what the common specs reach. Merged, a line
# counts as covered when any of the five runs reached it, which is the number a reader is after,
# and it comes out far above every single one of the five.
#
# The five stay next to it, one level down under coverage/by-project/, because the merged report
# cannot say which suite covered what. Moved here rather than written there: the html writer names
# its folders after the source folders, so the merged report at coverage/ writes coverage/common/
# and coverage/editor/ itself and would overwrite the project reports; and `subdir` in angular.json
# takes a name, not a path -- a "by-project/editor" there ends up as coverage/editor/ anyway.
#
# Usage: merge-coverage.sh   (after the five `ng test … --coverage` runs, see npm run test:coverage)

set -euo pipefail

projects=(common editor player editorModules playerModules)
by_project="coverage/by-project"
merge_dir="coverage/.merge"

rm -rf "${merge_dir}" "${by_project}"
mkdir -p "${merge_dir}" "${by_project}"

for project in "${projects[@]}"; do
  report="coverage/${project}/coverage-final.json"
  if [ ! -f "${report}" ]; then
    echo "No coverage report for ${project} at ${report} - run npm run test:coverage first." >&2
    exit 1
  fi
  cp "${report}" "${merge_dir}/${project}.json"
  # The html writer applies the subdir a second time inside the one the reporter already made, so
  # the report of a project sits at coverage/<project>/<project>/. Only that part is kept; what is
  # left next to it is the json this loop has just copied.
  mv "coverage/${project}/${project}" "${by_project}/${project}"
  rm -rf "coverage/${project}"
done

# nyc reads every json in --temp-dir and adds them up.
npx nyc report \
  --temp-dir "${merge_dir}" \
  --report-dir coverage \
  --reporter html \
  --reporter text-summary

rm -rf "${merge_dir}"
