#!/bin/bash

# Builds one coverage report over every suite this repository has, above the reports they each wrote.
#
# Why a merge at all: `projects/common` is exercised by every project, so no single report says
# how well it is covered - the common run only shows what the common specs reach. Merged, a line
# counts as covered when any run reached it, which is the number a reader is after, and it comes
# out far above every single one of the parts.
#
# The parts stay next to it, one level down under coverage/by-project/, because the merged report
# cannot say which suite covered what. Moved here rather than written there: the html writer names
# its folders after the source folders, so the merged report at coverage/ writes coverage/common/
# and coverage/editor/ itself and would overwrite the project reports; and `subdir` in angular.json
# takes a name, not a path -- a "by-project/editor" there ends up as coverage/editor/ anyway.
#
# The e2e run is optional and comes from elsewhere: Cypress collects it against the instrumented
# builds (`ng run editor:serve-coverage`), and @cypress/code-coverage writes the report itself, to
# the place .nycrc.json names. Whoever runs only the unit tests gets the merge over those five, and
# the merged report then says so by not listing an e2e part.
#
# Usage: merge-coverage.sh   (after the five `ng test … --coverage` runs, see npm run test:coverage)

set -euo pipefail

projects=(common editor player editorModules playerModules)
by_project="coverage/by-project"
merge_dir="coverage/.merge"
e2e_report="${by_project}/e2e/coverage-final.json"

rm -rf "${merge_dir}"
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
  rm -rf "${by_project}/${project}"
  mv "coverage/${project}/${project}" "${by_project}/${project}"
  rm -rf "coverage/${project}"
done

if [ -f "${e2e_report}" ]; then
  cp "${e2e_report}" "${merge_dir}/e2e.json"
  # With its date, because this report is not from this run: whoever last ran e2e-coverage.sh left
  # it there, and it stays until the next one. A report from last week merges in just as quietly.
  echo "Merging the e2e run of $(date -r "${e2e_report}" '+%Y-%m-%d %H:%M') in as well."
else
  echo "No e2e report at ${e2e_report} - merging the unit runs only." >&2
fi

# nyc reads every json in --temp-dir and adds them up.
npx nyc report \
  --temp-dir "${merge_dir}" \
  --report-dir coverage \
  --reporter html \
  --reporter text-summary

rm -rf "${merge_dir}"
