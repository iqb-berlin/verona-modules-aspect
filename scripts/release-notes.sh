#!/bin/bash
# Prints the release notes for one version, in the form the GitHub release carries them: the three
# `docs/release-notes-*.md` sections for that version, each under its file's own heading, with the
# ticket links taken out.
#
# The links stay in the files, where they say which entry belongs to which ticket. In the published
# text they are noise, and no release before 3.0.1 had them - so they are removed here rather than
# in the files (decided 2026-09-02).
#
#   scripts/release-notes.sh 3.0.1 > notes.md
#   gh release create "editor/$V+player/$V" --notes-file notes.md --verify-tag dist/iqb-*-aspect-$V.html
set -eu

if [ $# -lt 1 ]; then
    echo "Pass the version, e.g. $(basename "$0") 3.0.1" >&2
    exit 1
fi

VERSION=$1
ROOT=$(cd "$(dirname "$0")/.." && pwd)

# The common notes carry both module names in their heading, the other two only the number.
section() {
    local file=$1 heading=$2
    awk -v heading="$heading" '
        NR <= 2 { print; next }                 # the file title and its ==== rule
        $0 == heading { inside = 1 }
        inside && /^## / && $0 != heading { exit }
        inside { print }
    ' "$ROOT/docs/$file"
}

# " ([#1234](url))" and " ([#1234](url), [#5678](url))" at the end of an entry.
strip_links() {
    perl -pe 's/ \(\[#\d+\]\([^)]*\)(?:, \[#\d+\]\([^)]*\))*\)//g'
}

# A version whose heading is nowhere to be found would otherwise print the three file titles and
# nothing else - which reads like a release with no changes rather than like the typo it is.
for pair in "release-notes-common.md:## editor/$VERSION+player/$VERSION" \
            "release-notes-editor.md:## $VERSION" \
            "release-notes-player.md:## $VERSION"; do
    if ! grep -qxF "${pair#*:}" "$ROOT/docs/${pair%%:*}"; then
        echo "ERROR: no section '${pair#*:}' in docs/${pair%%:*}" >&2
        exit 1
    fi
done

# Each section already ends with the blank line that stood before the next heading, so the parts
# need no separator of their own.
{
    section release-notes-common.md "## editor/$VERSION+player/$VERSION"
    section release-notes-editor.md "## $VERSION"
    section release-notes-player.md "## $VERSION"
} | strip_links

# An empty run means the version has no section anywhere - a typo in the argument, most likely.
