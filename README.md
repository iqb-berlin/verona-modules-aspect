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
| [`docs/unit_definition_changelog.txt`](docs/unit_definition_changelog.txt) | How the stored unit definition changed, per version |
| [`docs/version-history.md`](docs/version-history.md) | Which unit definition version a released editor or player writes |
| [`docs/release-notes-*.md`](docs/) | Release notes for common, editor and player |

## Requirements

- **Node 22 or 24.** The pipeline image (`scripts/Dockerfile`) runs Node 22, the
  documentation workflow Node 24, and development happens on either. The repository declares
  neither an `engines` field nor an `.nvmrc`, so nothing enforces this.
- **Chromium for Playwright**, because the unit tests run in browser mode:
  `npx playwright install chromium`.

Install with the lock file, which reproduces the exact dependency set:

```bash
npm ci
```

To change a dependency, edit `package.json` and apply the delta on top of the existing lock
file with npm 10 rather than regenerating it — different npm generations resolve and
deduplicate differently, and a lock file written by one has been rejected by `npm ci` in the
pipeline before:

```bash
npx npm@10 install
npx npm@9 ci --dry-run && npx npm@10 ci --dry-run && npm ci --dry-run   # all three must pass
npm ci                                                                  # --dry-run empties node_modules
```

## npm commands

### Develop

| Command | What it does |
| --- | --- |
| `npm run start-editor-local` | Serves the editor on http://localhost:4201 with rebuild on change |
| `npm run start-player-local` | Serves the player on http://localhost:4202 with rebuild on change |

Both serve a development harness around the module, not a host system. A unit is loaded into
the module through the Verona API.

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
| `npm run e2e` | Opens the Cypress UI for the 48 end-to-end specs in `e2e/tests/` |
| `npm run e2e-headless` | Runs the same specs headless, as the pipeline does |

**The end-to-end tests do not run as part of `npm test`.** They need both dev servers up:
start `start-editor-local` and `start-player-local`, wait until both answer — the pipeline
uses `scripts/wait-for-dev-server.sh` for that — then run `e2e-headless`.

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
issue → branch → pull request → green pipeline → review → merge into develop → release from master
```

1. **Branch off `develop`.** Name it `feature/<issue>-<topic>` or `bugfix/<issue>-<topic>`.
   `develop` is the integration branch and the default branch; `master` only ever receives
   releases.
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
7. **Release from `master`**, with the version numbers in `package.json` and the release
   notes under `docs/`.

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
