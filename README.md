# Verona Modules Aspect

**API documentation: [iqb-berlin.github.io/verona-modules-aspect](https://iqb-berlin.github.io/verona-modules-aspect/)**

Editor and player for Aspect units. Both applications share one code base and are built and
run separately. They are meant to be used in
[IQB-Studio](https://github.com/iqb-berlin/studio-lite) and
[IQB-Testcenter](https://github.com/iqb-berlin/testcenter-setup), and both conform to the
Verona API definitions: [Editor API](https://verona-interfaces.github.io/editor/),
[Player API](https://verona-interfaces.github.io/player/).

A build produces a **single HTML file** per module that carries the whole application —
that file is what a host system embeds.

## Documentation

| Where | What |
| --- | --- |
| [iqb-berlin.github.io/verona-modules-aspect](https://iqb-berlin.github.io/verona-modules-aspect/) | API documentation of everything under `projects/`, rebuilt from `develop` on every merge |
| [`rules.md`](rules.md) | Binding conventions for this repository. Read before the first change |
| [`docs/version-history.md`](docs/version-history.md) | Which unit definition version a released editor or player writes |

### Test coverage

Published alongside the API documentation and rebuilt from `develop` on every merge. One page per
suite, and one over all of them — down to the single line of every file. The e2e part is the one
that can lag: its run is allowed to fail, and a merged page then carries the e2e report of an
earlier run, or none at all.

| Page | Whose coverage |
| --- | --- |
| [`coverage/`](https://iqb-berlin.github.io/verona-modules-aspect/coverage/) | **All suites at once**, unit tests and the e2e run together |
| [`coverage/by-project/common/`](https://iqb-berlin.github.io/verona-modules-aspect/coverage/by-project/common/) | The unit tests of `projects/common` |
| [`coverage/by-project/editor/`](https://iqb-berlin.github.io/verona-modules-aspect/coverage/by-project/editor/) | The unit tests of the editor application |
| [`coverage/by-project/player/`](https://iqb-berlin.github.io/verona-modules-aspect/coverage/by-project/player/) | The unit tests of the player application |
| [`coverage/by-project/editorModules/`](https://iqb-berlin.github.io/verona-modules-aspect/coverage/by-project/editorModules/) | The unit tests of `projects/editor/modules` |
| [`coverage/by-project/playerModules/`](https://iqb-berlin.github.io/verona-modules-aspect/coverage/by-project/playerModules/) | The unit tests of `projects/player/modules` |
| [`coverage/by-project/e2e/`](https://iqb-berlin.github.io/verona-modules-aspect/coverage/by-project/e2e/) | The Cypress suite |

**Why the parts are kept.** The merged page counts a line as covered as soon as any run reached it,
and it cannot say which one — that is what makes it the number for `projects/common`, which every
project uses and no single suite covers on its own. But reached is not the same as tested: a unit
test makes a claim about the code it covers, while an e2e run walks past a great deal of code
without claiming anything about it. Whoever reads a number to decide whether something still needs a
test should read the part, not the sum.

Locally, `npm run test:coverage` writes the five unit reports and merges them; `npm run e2e-coverage`
writes the e2e report first, and a merge run after it takes that in as well.

## Requirements

- **Node 24**, as named in `.nvmrc`, and the version the pipeline image
  (`scripts/Dockerfile`) and the documentation workflow run as well. The `engines` field
  accepts `^22.12.0 || >=24.0.0`, which is the range every package in the tree with a Node
  lower bound asks for; without `engine-strict` it is an advisory, not a gate.
- **Chromium for Playwright**, because the unit tests run in browser mode:
  `npx playwright install chromium`.

Install with the lock file, which reproduces the exact dependency set:

```bash
npm ci
```

To change a dependency, edit `package.json` and apply the delta on top of the existing lock
file rather than regenerating it — different npm generations resolve and deduplicate
differently, and a lock file written by one has been rejected by `npm ci` in the pipeline
before. The pipeline now runs the same npm as development, so that is the one to write with;
npm 10 stays in the check because `engines` still allows it:

```bash
npm install
npx npm@10 ci --dry-run && npm ci --dry-run   # both must pass
npm ci                                        # --dry-run empties node_modules
```

## Getting started

With the dependencies installed, the shortest way to something on screen:

```bash
npm run start-editor-local   # http://localhost:4211
npm run start-player-local   # http://localhost:4212
```

Opened directly in a browser, both run **standalone** — they recognise that by
`window === window.parent` — and bring a control of their own, because no host system is there to
hand them a unit through the Verona API:

- **Editor:** a toolbar with *Unit laden* and *Unit speichern*, both working on a file on your disk.
- **Player:** a menu behind the three-dot button, with a field for the start page and one load entry
  per paging mode — *Blätter*, *Buttons*, *Scroll*, *Snap* — next to *Druck* and *Druck mit Ids*.

**The paging mode is chosen when the unit is loaded.** That is the setting to reach for when
reproducing something a mode carries: #1383 was a bug that showed in the snap mode and nowhere else.
Once a unit is loaded, the same menu switches the mode at runtime, releases the navigation targets,
reloads the unit including the state it holds, and jumps to a page.

The standalone mode is not a convenience at the edge. `saveUnit` in `e2e/support/commands.ts` clicks
the editor's *Unit speichern*, and 47 of the 51 spec files build their unit that way; 44 of them go
on to hand that file to the player with `loadUnit`, which posts it in through the Verona API. The
four that use neither never leave the editor.

Where to reach when you want to change something:

- `projects/common` — element models, migration, and the components both applications render
- `projects/editor`, `projects/player` — what only one of them has, application and feature modules

And before the first commit: [`rules.md`](rules.md). It is binding here, and its §12 to §14 answer
most of what a first change runs into.

## npm commands

### Develop

| Command | What it does |
| --- | --- |
| `npm run start-editor-local` | Serves the editor on http://localhost:4211 with rebuild on change |
| `npm run start-player-local` | Serves the player on http://localhost:4212 with rebuild on change |
| `npm run start-editor-e2e` | The same on http://localhost:4201, the address Cypress drives |
| `npm run start-player-e2e` | The same on http://localhost:4202, the address Cypress drives |

Both serve a development harness around the module, not a host system — how a unit gets in there is
what [Getting started](#getting-started) describes.

Why two pairs: Cypress carries 4201 and 4202 in its commands, and so do the instrumented builds
of `npm run e2e-coverage`. With the local pair on ports of its own, a server you started by hand
and a test run cannot take the port from each other (#1423).

### Test

| Command | What it does |
| --- | --- |
| `npm test` | All unit tests: the five Vitest projects below, in this order |
| `npm run test:common` | `projects/common` — element models, migration, normalizer |
| `npm run test:player-modules` | `projects/player/modules` |
| `npm run test:editor` | `projects/editor/src` — editor application |
| `npm run test:editor-modules` | `projects/editor/modules` |
| `npm run test:player` | `projects/player/src` — player application |
| `npm run lint` | ESLint over `projects/`, `e2e/` and the root configs |
| `npm run e2e` | Opens the Cypress UI for the 51 end-to-end specs in `e2e/tests/` |
| `npm run e2e-headless` | Runs the same specs headless, as the pipeline does |

**The end-to-end tests do not run as part of `npm test`.** They need both dev servers up on the
addresses Cypress drives: start `start-editor-e2e` and `start-player-e2e`, wait until both answer
— the pipeline uses `scripts/wait-for-dev-server.sh` for that — then run `e2e-headless`. For the
coverage of that run, `npm run e2e-coverage` does all of it against the instrumented builds.

### Build

| Command | What it does |
| --- | --- |
| `npm run build-editor` | Builds `dist/iqb-editor-aspect-<version>.html` |
| `npm run build-player` | Builds `dist/iqb-player-aspect-<version>.html` |

The version comes from `config.editor_version` / `config.player_version` in `package.json`.
`scripts/build.sh` also writes the supported unit definition range into the module metadata,
from `config.unit_definition_min_version` to `config.unit_definition_version`, and fails the
build if either substitution did not land.

### Documentation and coverage

| Command | What it does |
| --- | --- |
| `npm run docs` | Builds the Compodoc documentation into `dist/docs` (~9 s). Open `dist/docs/index.html` to read the state of your working tree; the published state of `develop` is at the link at the top |
| `npm run serve-editor-coverage` | Serves the editor instrumented for coverage collection |
| `npm run serve-player-coverage` | Serves the player instrumented for coverage collection |

### Change the unit definition

| Command | What it does |
| --- | --- |
| `npm run generate-migration <from> <to>` | Scaffolds a migration step and its spec |

Whether a change needs a migration step at all is decided by `rules.md` §14 — a new property
with a default needs none, because the normalizer fills it in on load. Every change to the
stored definition gets a line in `docs/unit_definition_changelog.txt`.

## Repository layout

```
projects/common     element models, migration, shared components — used by both applications
projects/editor     editor application (src) and its feature modules (modules)
projects/player     player application (src) and its feature modules (modules)
e2e/tests           Cypress end-to-end specs
scripts             build, deploy and generator scripts
docs                changelogs, release notes, version history
example_data        unit definitions the e2e tests load, and useful by hand
test-data           fixtures the unit tests load
```

`rules.md` §12 and §13 describe how a new component, pipe or directive is laid out and why
everything here is `standalone: false`.

## How work flows through this repository

```
issue → branch → pull request → green pipeline → review → merge into develop → release to master
```

### Branches

This repository follows the
[Git Flow](https://nvie.com/posts/a-successful-git-branching-model/) branching model.

```
develop      all active development; the default branch and what pull requests target
master       the state of the most recent release; the release tags sit here
feature/…    branched off develop, merged back into develop after review
hotfix/…     branched off master for a fix that cannot wait for a release,
             merged into master and into develop
```

A branch name carries the issue it belongs to: `feature/1357-topic`.

**A release** is `develop` merged into `master` and tagged there, one tag for both modules —
`editor/3.0.0+player/3.0.0`. What the release needs goes into `develop` before that merge: the two
version numbers in `package.json` (`config.player_version` and `config.editor_version` — the
version stands nowhere else) and the entries in `docs/release-notes-*.md`.

**A hotfix** is branched off `master`, merged into `master` once it is verified, and merged into
`develop` as well — merged, not cherry-picked, so the fix stays one commit in the history instead
of two that later have to be told apart.

### From issue to merge

1. **Branch off `develop`**, named as above.
2. **Reference the issue in the commit subject**, e.g. `(#1357)`. Do **not** write
   `Closes #1357` in the pull request: it closes the ticket on merge and skips the board
   column the team works from. Referencing is fine, keywords are not.
3. **Open a pull request against `develop`.** A branch without an open pull request gets no
   pipeline at all — that is deliberate, see the comment in `.gitlab-ci.yml`.
4. **The pipeline runs on GitLab**, mirrored from GitHub, with three jobs in two stages:
   `lint` (type-aware ESLint), `test-unit` (`npm test`) and `test-e2e` (both dev servers plus
   headless Cypress). **The module build is not part of it** — the `build` stage holds no job
   and the `deploy` job is commented out, so a change that breaks `build-editor` or
   `build-player` passes green and only shows up at release time. The single GitHub Actions
   workflow builds the documentation and nothing else, which is why the Actions tab looks
   almost empty.
5. **Rebase when `develop` moves.** Branch protection requires an up-to-date branch, so once
   something else is merged, rebase onto `origin/develop` and force-push with
   `--force-with-lease`. A pipeline result belongs to a commit, not to a pull request: after
   a rebase the previous green run no longer counts.
6. **Merge as a merge commit** once the required status check is green.
7. **Release** by merging `develop` into `master`, as described above.

Tickets live on [project board 13](https://github.com/orgs/iqb-berlin/projects/13). A card
moves to *In Bearbeitung* when work starts and to *zu testen* once the fix is merged into
`develop`; a change that ships with its own end-to-end test goes to *Zu Veröffentlichen*
instead. *Review* means released and awaiting validation, not code-reviewed — a ticket stays
open until then and is closed in *Done & closed*.

## Supported browsers

Last Chrome version, last Firefox version and Firefox ESR, last two major versions of Edge,
Safari and iOS.

This is the support commitment, not a build configuration: the repository has no
`browserslist` entry, so Angular targets its own defaults.
