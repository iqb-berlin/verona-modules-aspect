# Frontend Rules

## 1) Do not move simple data bindings into component methods/getters

For simple UI conditions, do not bind to methods or getters from the component class.

- Avoid: `[prop]="someGetter"` or `[prop]="someMethod()"`
- Prefer: a direct, simple template expression

Rationale:
- avoids repeated execution during change detection
- keeps binding logic visible at the template usage site
- reduces hidden side effects in template evaluation

## 2) Use pipes for complex bindings

If a binding becomes too complex for a clear inline expression, move that logic into a pipe (prefer pure pipes).

- Avoid: long nested expressions or method chains in templates
- Prefer: `[prop]="value | someTransformation"`

Rationale:
- improves readability and maintainability
- enforces a clean separation between presentation and transformation logic
- makes transformation behavior easier to test


## 3) Omit NoopAnimationsModule in Unit Tests

The `NoopAnimationsModule` is considered deprecated for testing purposes in this project and should be omitted from `TestBed` configurations.

- Avoid: `imports: [NoopAnimationsModule]`
- Prefer: Simply omitting the module (Angular handles this automatically or via global configuration).

Rationale:
- reduces boilerplate in test files
- avoids dependency on deprecated animation modules
- simplifies test setup

## 4) Avoid parentheses around single arguments in arrow functions

When writing an arrow function with exactly one argument, omit the parentheses around the argument name to comply with ESLint's `arrow-parens` rule.

- Avoid: `(elementCode) => { ... }`
- Prefer: `elementCode => { ... }`

Rationale:
- Enforces consistency in arrow function style across all projects.
- Prevents build/linter failures due to styling rule violations.

## 5) Internationalization (i18n)

Every user-facing text MUST be managed through translation keys in the relevant
`assets/i18n/de.json` (and `en.json` where available), e.g. under
`projects/{common,editor,player}/…/assets/i18n/`. Hardcoded strings are not allowed.

- Prefer: the `translate` pipe in templates or `TranslateService` in components
- Avoid: literal display strings in templates/components

Rationale:
- keeps the app localizable
- avoids scattered, untranslatable strings that are hard to maintain

## 6) Subscription management

Use the `ngUnsubscribe` + `takeUntil` pattern for subscriptions in components.

- Define `private ngUnsubscribe = new Subject<void>();` as a class property
- Add `.pipe(takeUntil(this.ngUnsubscribe))` before `.subscribe()`
- Implement `OnDestroy` and tear down in `ngOnDestroy()`:
  ```typescript
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  ```

Rationale:
- prevents memory leaks and callbacks firing after destruction
- matches the pattern already used across the codebase

## 7) Prefer `fakeAsync`/`tick()` for asynchronous tests

Use `fakeAsync` and `tick()` instead of `async/await` with `setTimeout` or manual
`wait()` helpers when testing asynchronous logic.

```typescript
it('should handle async logic', fakeAsync(() => {
  component.doSomethingAsync();
  tick(200); // advance virtual time by 200ms
  fixture.detectChanges();
  expect(component.result).toBe(true);
}));
```

Rationale:
- gives synchronous-like control over virtual time; tests run faster
- avoids intermittent "Exceeded timeout" failures in CI
- removes non-deterministic `setTimeout`-based waiting

## 8) Use modern Angular control flow

Use the built-in control flow syntax (`@if`, `@for`, `@switch`) instead of the
structural directives `*ngIf`, `*ngFor`, `*ngSwitch`.

- Prefer: `@if (cond) { … }`
- Avoid: `*ngIf="cond"`

Rationale:
- more efficient and type-safe
- reduces reliance on `CommonModule`

Note: existing `*ngIf`/`*ngFor` usage may remain until touched; apply this to new
and modified templates.

## 9) CSS: target elements with explicit classes

Avoid element or attribute selectors (e.g. `button[mat-stroked-button]`, `mat-icon`)
in SCSS. Use descriptive classes instead (e.g. `.add-url-button`, `.button-icon`).

Rationale:
- explicit classes are resilient when Angular Material changes its internal tag or
  attribute structure

## 10) Type safety: avoid `any` in new code

For new and modified code, do NOT introduce the `any` type.

- Prefer: specific interfaces/DTOs, or structural typing (e.g. `{ id: number; name: string }`)
- Use `unknown` with type guards when the type is genuinely dynamic
- Never add `// @ts-ignore` or `// @ts-nocheck` — fix the types instead

Rationale:
- `any` disables type checking and hides bugs
- applies to new code; pre-existing `any`/`$any()` usage is out of scope here but
  should be reduced opportunistically when touched

## 11) Unit tests check behaviour that can be wrong

A unit test checks behaviour that can be wrong: a decision (a branch, a calculation, a mapping), an
error path, or a bug that has already happened. It is written from what a caller can observe — what
is returned, emitted or rendered, what reaches the host or another service — not from the lines of
the implementation. What the code only copies from its own source, such as a fixed list, is no
behaviour of its own.

- A change to business logic comes with a test that fails without the change: a unit test, or an
  end-to-end test under `e2e/` where only the running editor or player shows the change. A fixed
  bug gets a test that names its issue (`#1357`).
- A new class with behaviour of its own (component, directive, pipe, service, a class in `utils/`
  or `classes/`) gets a `.spec.ts` that tests that behaviour; where nothing could be wrong, there
  is no spec. A new component always gets its spec, as it gets its `.scss` (§12); without
  behaviour of its own, `it('should create')` is its only test.

Like §12, this applies to new and changed code: it is no demand to add specs where there are none.

Of the building blocks, `ng generate` writes a spec for a component only (`skipTests` in
`angular.json`); for the others the spec is written once there is behaviour to test, so that no
generated existence test is left standing beside it. The component's generated `should create` goes
as soon as the component has a test of its own. ESLint rejects such a test beside other running
tests of its `describe` — titled `should create`, `should create the component`,
`should create an instance`, `should be created`, `create an instance` or `should be defined`, and
checking nothing but `toBeTruthy` or `toBeDefined` (`no-restricted-syntax` for
`projects/**/*.spec.ts` in `eslint.config.mjs`).
`npm run generate-migration` writes the step's spec with the test of its target version.

Not this:

- a test that only checks that the instance exists (`should create`, `should be created`,
  `create an instance`) beside other tests of the same file — each of them creates it anyway
- a test without an assertion. The skipped `baseline regeneration` block in
  `properties-panel.characterization.spec.ts` is not one: it is the tool that writes the panel's
  baseline, run by hand
- a test that restates the implementation: a method replaced by a spy, called and found called; a
  property set and read back; a method of one line that hands its own arguments to a service,
  checked for handing them on
- constants and framework wiring: a list the test copies from the source, dialog data that was
  injected and is read back as it came, that an injected service is defined
- the same call with the same assertions in a second test — also as one block per element type
  when the code does not tell the types apart

Still this, although it can look like constants or wiring:

- the defaults and their identity (§14) and the copies at the properties panel's junction (§15):
  `model-normalizer.spec.ts`, `element.spec.ts`, `property-group-interfaces.spec.ts`,
  `copy-plain-data.spec.ts`, and the tests in `element.service.spec.ts` that every selected
  element gets its own copy
- that a dialog which can be cancelled edits a copy of what it was handed (#1270): the data is read
  back, but the test is about it not being the same object
- the properties panel's characterization net, and the tests for what its baseline cannot see —
  the options a select offers, as in `action-properties.component.spec.ts`, and CSS
- what the `AppModule` of editor and player provides, in their `app.module.spec.ts`: only the
  end-to-end tests would see it missing otherwise, and they do not run in `npm test`
- the target version of a migration step: it decides which units the step reaches and in which order
  the steps run (§14, and the class comment on `MigrationManager`)
- a method that passes something on but adds to it first — the selected elements, its own
  section — tested for what it adds
- the seam tests of §17: one for each direction in which the caller decides, as §17 describes
  them for `file.service.spec.ts`

A comment above a test that says why it stays holds for as long as it is true. In doubt, the test
stays.

Coverage shows what no test reaches; whether that needs a test, this section decides. A test
written only to reach a line is the test it excludes.

Rationale:
- a test that restates the code doubles the cost of every change to it and catches nothing. Until
  #1628 this section demanded a spec for every new class and a test for every new or changed public
  member, and #1114 named a creation test plus tests for the public API as the minimum when specs
  were added afterwards. The result was 258 tests that only checked that an instance exists, beside
  tests that created it anyway, and blocks repeated for element types the code does not tell apart
- studio-lite limited its tests in the same way (studio-lite#1939). This section follows it except
  where aspect differs — no backend, the exceptions above, a seam test for each direction rather
  than one for each seam

## 12) Component, pipe and directive file structure

This is not consistently implemented across the codebase yet, but all **new** building
blocks MUST follow this layout (the `player` project is the reference).

New components MUST be split into four files in their own directory:

- `[name].component.ts` (logic/class)
- `[name].component.html` (template)
- `[name].component.scss` (styles — SCSS is preferred over CSS)
- `[name].component.spec.ts` (unit tests)

The `.scss` and the `.spec.ts` exist even when there is nothing to style or to test: the
stylesheet stays empty, and the spec holds `it('should create')` alone (§11).

Place building blocks in the conventional folder of the respective project/module:

- components → a `components/[name]/` directory
- pipes → a `pipes/` directory
- directives → a `directives/` directory
- and likewise for other kinds (services, guards, …)

Rationale:
- clean separation of concerns and a predictable, consistent project structure
- keeps templates, styles, logic and tests easy to locate and maintain

## 13) Use `standalone: false`

This project is NgModule-based. Components, pipes and directives MUST be declared with
`standalone: false` and registered in the `declarations` of their `NgModule` — do NOT
create standalone building blocks (even though `standalone: true` is the Angular
default).

- Prefer: `@Component({ standalone: false, … })` + declaration in the owning module
- Avoid: standalone components/pipes/directives with their own `imports`

Rationale:
- keeps the whole codebase on one consistent module architecture
- matches the existing convention across the project

## 14) Changing the unit definition: normalizer or migration step?

Stored unit definitions are brought up to the current model on every load. Which mechanism a
change belongs to depends on what the change does — the long version is the class comment on
`MigrationManager`.

- **A new property with a default** → nothing to write. `ModelNormalizer` fills every missing
  property from `ELEMENT_DEFAULTS` on load, independently of the unit's version. Raise
  `unit_definition_version` and note it in `docs/unit_definition_changelog.txt`, but do not add
  a migration step.
- **Existing values have to be transformed** (rename, changed unit, restructured group) → a
  migration step via `npm run generate-migration <from> <to>`, which registers it in `MigrationManager`.
- **Wrong values have to be repaired** → mind the reach: a step only touches units **older** than
  its `toVersion`, so data written by the version being migrated to is out of its reach. Either
  migrate to a newer version, or handle it in `ModelNormalizer` — and only if the data is worth a
  case that then runs on every load of every unit, forever.

**What goes into `docs/unit_definition_changelog.txt`:** which element gains, loses or changes which
property, one line per change, grouped under the version — nothing else. It is read to see at a glance
how the stored definition differs between two versions. Not the reason for the change, not what it
fixed, not what the inspector shows, not what an earlier release did: that belongs in the ticket, in
the PR text and, where a reader of the code needs it, in a comment next to the code. A change that
leaves the stored definition as it is has no entry at all. Under 4.12.0 this rule was lost — eleven
prose blocks, each announcing "no version raise, no new property" in its own headline, grew the section
to 190 lines while 17 of them said what the file is for.

Defaults in `ELEMENT_DEFAULTS` are what the normalizer writes into units, so their types must match
what the model declares. Since #1177 the table is typed against the element property interfaces
(`FlatDefaults` in `element-registry.ts`): a default with the wrong type or an unknown key is a
compile error, and reading a default the table does not define is one too. The compiler checks
types, not values — a plausible-but-wrong value (100 where 135 was meant) still compiles, so cover
new or changed default VALUES with a spec, as `model-normalizer.spec.ts` does for the flat
properties and `element.spec.ts` for the styling group. Historical context:
as an untyped `Record<string, unknown>`, a string default for a `boolean` property travelled into
stored units unnoticed for months (#1139).

An OBJECT-valued default needs one thing more, and no type enforces it: what reaches an element has
to be the element's own object, never the table's. The table is module state, so a shared object
means every element of that type — and the default itself — move together on the first in-place
write. Whatever hands the value out has to copy it; `PropertyGroupGenerators.generatePositionProps`
does this for the margins (#1184), and `ModelNormalizer` clones each object default it fills in. The
identity sweep in `model-normalizer.spec.ts` fails with the offending path if a new default or a new
generator misses it.

The `styling` group is the one group the normalizer does **not** touch (#1187). Which keys an
element has is decided by the group its own class builds, and the stored group is merged into that
one — keys only, no list anywhere: `PropertyGroupGenerators.mergeStyling` keeps exactly the keys
the class put there, filling the rest from the stored unit. So a new styling property on an element
is three edits in the element's own file:

- declare it in the `styling` type of its `…Properties` interface,
- give the class field its value from `ELEMENT_DEFAULTS` — the compiler demands this as soon as the
  interface declares it, which is what makes the whitelist self-maintaining,
- if it is outside `BasicStyles`/`BorderStyles`, add it to `OtherStyles` too. The editor's write
  path is keyed on `keyof Stylings`, so a key outside it would be a value the panel displays and
  can never change; `ElementStylingIsWritable` in `element-registry.ts` fails to compile and names
  the key.

Nothing else has to know about it. What this replaced — a rebuild in `ModelNormalizer` deciding the
same question from four hand-kept lists — dropped stored values for keys no list named (#1177,
#1185) and handed six font keys to three elements whose styling declares none (#1187).

Rationale:
- most model changes need no migration step at all; writing one anyway adds code that must be
  maintained and can silently miss the units it was written for
- the reach of a step is not obvious from its version numbers and has been misjudged twice

## 15) Values leaving the properties panel for the unit

The merged view the properties panel reads must share no plain data with the selected elements, and a
write that hands one value to a selection must give every element its own copy. Both go through
`copyPlainData` (`projects/editor/src/app/utils/`), applied in `createCombinedProperties` and per
element in the write paths that distribute one value: `ElementService.updateElementsProperty` for the
element's own properties, `updateElementsPositionProperty` for the position group, whose four margins
are the only object-valued members of any group (#1193). It decides by prototype:

- plain objects and arrays are copied recursively — they are what the panel edits and what a write
  distributes,
- anything with a prototype of its own stays as it is: element models belong to the unit, and a copy
  would carry their IDs a second time; the `idService` on a merged element would lose its methods.

- Avoid: copying single fields after the merge (`combinedProperties.rows = [...rows]`)
- Prefer: the one copy at each of the places above

Rationale:
- the panel edits some of what it reads in place — removing, moving and editing an option all work on
  the array they read — so a shared view changes an element before any write path sees it
- `UIElement.setProperty` splices the value's entries into every selected element, so one value
  reaches them all as the same objects (#1188). The same guarantee existed until `2e9be6e9` (2022)
  replaced `element[property] = Copy.getCopy(value)` with `element.setProperty(property, value)`; it
  went unnoticed for years because no test held it

This is about that one junction, not a general rule about copying. Three neighbours it is easy to
confuse it with:

- **Object defaults** are §14: whoever hands one out copies it, and the identity sweep in
  `model-normalizer.spec.ts` guards that.
- **Duplicating** an element does the opposite for models: `cloneForBlueprint` turns child models into
  blueprints, so the copy gets IDs of its own. Keeping models by reference there was #1179.
- **A dialog that can be cancelled** works on a copy and applies it on save (#1270). That is about
  when a change reaches the unit, not about who owns which object.

What it does not solve: models are handed on as they are, so a control that edits one has to copy
before it mutates, the way the label dialogs do.

## 16) Explanations at a declaration are written as `/** */`

An explanation that belongs to a class, method, property, type or constant is written as a JSDoc
block, with two asterisks. The documentation at
[iqb-berlin.github.io/verona-modules-aspect](https://iqb-berlin.github.io/verona-modules-aspect/) is
built from those; `//` and a `/* */` block with one asterisk are dropped.

- Prefer: `/** Why this property is held rather than rebuilt. */` above the declaration
- Avoid: the same sentence as `//` or `/* */` above the same declaration

Inside a body nothing changes: a comment that explains a statement, a branch or an order stays `//`
or `/* */`, and belongs to the line it stands over, not to the symbol above it.

Three kinds stay as they are even at a declaration, because JSDoc would misrepresent them:

- **Directives.** `// eslint-disable-next-line` stays a line comment directly above what it applies
  to, and a block directive keeps its single asterisk — ESLint only honours `/* eslint-disable */`,
  never `/** eslint-disable */` (#1359 broke one that way and put it back).
- **A heading over a group of members**, which would claim to describe only the first of them.
- **A `TODO`**, which is not a description of the symbol.

Rationale:
- until #1359 there were 142 declarations carrying a block comment with one asterisk and 12 with a
  line comment: 565 lines of finished explanation that the documentation did not show. Making them
  visible raised the coverage Compodoc reports from 7.8% to 11.9% without a word being written
- the number is not the point and there is no `--coverageTest` gate: a gate would produce
  `@param element the element`, and the ticket says so at length. What the rule is for is simpler —
  an explanation nobody can find is the same as one that was never written

## 17) Work that is not the class's own job gets a class of its own

A service, a component, a directive does the work its name promises. A body that answers a different
question — an algorithm, a format, a set of domain rules — becomes a class of its own beside it and
is called by name. What stays behind is the seam: the few lines that decide when the other one is
asked and what is done with its answer.

- Avoid: `FileService` computing a resampling kernel because the file it loads happens to be a picture
- Prefer: `ImageResampler` in `common/utils/`, asked by `FileService.drawScaled` (#1434)

Three questions decide it, and any one of them is enough:

- **Does the body need the class it stands in?** No `this`, no injected dependency, no field of the
  class, no template and no host element — then it already is a separate unit, only an unnamed one.
- **Can you say what it does without naming its host's job?** "Makes a picture smaller" says nothing
  about loading and saving files.
- **Do private members exist only to serve one public method?** They are that unit's insides, and
  they are only private to the wrong class.

This is not "one method per class": a helper of a few lines that reads the state around it stays
where it is. What the rule is aimed at is the body that grew until it needs explaining.

Where the new unit goes — §12 for the file layout, §11 for whether it gets a spec and what that
tests:

- computation without DI and without state → `utils/`, a class with static methods
  (`ImageResampler`, `DropLogic`, `SectionCounter`)
- needs injection, or holds state the app shares → `services/`
- a value computed for a template → a pipe (§2)

For components and directives the same cut runs one step further in. A component keeps what touches
its template, its inputs and its outputs; a directive keeps what touches its host element. Parsing,
validating, converting, measuring, deciding a rule — each is a class the component asks, and the
component holds the answer for the template to read.

That cut alone does not make a component small, because what is usually too big about one is its
view, and a helper class cannot take view work. Which of the four ways applies is decided by what is
too much, and they are meant to be used in this order:

1. **Foreign work → a class of its own**, as above. Do this one first: what is left afterwards is
   often already the component it should be, and the other three are then answering a question that
   no longer exists.
2. **Too much view → a child component.** The plainest case is the body of a `@for`. What a loop
   renders per entry already is one thing with a name; its data already arrives as one value per
   pass, which are its inputs, and its event already has to travel upwards, which is its output — so
   the boundary is drawn before anyone looks for it. `KeyboardKeyComponent` and `KeypadKeyComponent`
   in `player/modules/key-input/components/` are one key each, and the keypad's key then stands ten
   times in its layout with only three of them inside a loop: the return key, the arrow block and the
   operator grid all reach for the component the loop body became. Neither key holds any state —
   inputs and one output are the whole class — so state is not what makes the cut worth making.
   The other case is a template that branches over many kinds: the properties panel, one component
   per property group under `properties-panel/components/element-model-properties/`, instead of one
   template that knows every group.
   What does not qualify is length alone. A loop body of one element with two bindings stays where it
   is, and a child that holds nothing but a stretch of markup, with nothing crossing the boundary but
   the parent's own fields, spreads one view over two places without separating anything. A child is
   not free: §12 (four files) and §13 (declared in the owning module) apply.
3. **Behaviour at the host element → an applied directive**, with a selector, in `directives/`:
   `AutoHeightDirective`, `DraggableDirective`, `InViewDetectionDirective`,
   `InputBackgroundColorDirective`. The mark is that it hangs on an element rather than on the data
   flow, and that a second element should be able to have it by writing an attribute — without
   touching that element's class, which is exactly what a base class would demand.
4. **A shared role → an abstract base class**, and only for "is a", never merely to share code.
   Inheritance ties what it shares to the hierarchy, so it earns its place where several components
   owe the rest of the application the same contract: `ElementComponent`, `FormElementComponent`,
   `TextInputComponent`, `ElementGroupDirective`. Everything the base holds must be something every
   subclass needs — the moment a member is there for some of them, it belongs in a class or a
   directive one of them uses. Angular requires a decorator on an inherited base, which is why these
   are written `@Directive()` **without a selector** and live in `directives/` (10 of the 28 there);
   that makes them base classes in a directive's clothing, not directives, and they get no selector.

The four are not alternatives, and `player/src/app/components/elements/` is what they look like
together. `ElementGroupSelectionComponent` holds only the frame — the element's dimensions and its
`data-element-id` — and picks a group component from the element's type: ten named groups and a base
group for the types no group claims. Its `groups` table is the single place where a type is assigned
to a group. Each group component then holds what
its own group needs of the player and nothing of what the others need: a form and the value it
reports, a media element with its hint timer, the dynamic creation of an element component that has
no group of its own. What all of them need lives in a base — and in three steps rather than one,
which is that condition on inheritance doing its work: `ElementGroupDirective` (22 lines: the two
inputs and registering at the `UnitStateService`), `ElementFormGroupDirective` above it (the form and
its validation, 107), `TextInputGroupDirective` above that (keyboard, keypad, key restriction, 452).
Every group component inherits exactly the step it needs — the media player and the base group the
lowest, the input group the middle one, the text input group the top. Rolled into one base, every
group would carry the keyboard. A base asks for its services as an abstract member
(`abstract unitStateService: UnitStateService`) and the subclass injects them, which keeps the base
free of a constructor and says in the base itself what it depends on.

Test the seam, not just the new class. `FileService` keeps two tests that bind it to the resampler —
`vi.spyOn(ImageResampler, 'scaleDown')`, used when the picture shrinks, untouched when it is merely
re-encoded — because a class tested to bits still says nothing about whether its caller reaches for
it.

Rationale:
- as long as the arithmetic sat inside `scaleImage`, the only way at it was through an image, a
  canvas and whatever the test browser does with them. Five tests written that way stayed green
  under the mutation "always `drawImage`", because headless Chromium happens to scale well enough
  on its own (#1434). Moved out, the same question is numbers in, numbers out
- the two jobs age at different speeds: the kernel was rewritten twice while nothing about loading a
  file changed, and each rewrite re-read a service it had no business in
- the name is the review. "The image compression in the file service" is a phrase nobody wants to
  defend, and something that cannot be named where it stands rarely belongs there
- the four ways are listed because the first one is the reflex and answers the rarer half of the
  cases. A component is usually too big in its view, and a helper class leaves that untouched; the
  order above puts the cheap, reversible move first and inheritance — the one that cannot be undone
  in a single file — last
- the seam is testable in the view as well: a key has a spec of its own, and the keyboard's spec is
  then about which keys it hands out and what it does with the one that was pressed. Left inline,
  every question about a single key has to be asked through the whole keyboard

# Workflow Rules

Branches, releases, the pipeline and the board columns are described in the README under *How work
flows through this repository*. Read it before creating a branch, opening a pull request or moving a
card on the board. The sections below begin with the two steps before any of that, the plan and the
review, then repeat the two points most easily got wrong and add what the README leaves open.

## 18) Before the work: a plan

Every ticket starts with a plan, agreed with the person you are working for before anything is
changed — a small ticket as well, whose plan is then three lines. Work out the plan in Claude Code's
plan mode (Shift+Tab), which edits nothing until the plan is approved. The plan states decisions, not
a list of options:

- **what is asked for**, checked against the architecture: the editor authors a unit, the player
  plays it, the host (Studio, the test center) stores and delivers it. A finding that belongs to the
  host is not work for this repository
- **the cause, with evidence** — reproduced or measured, not assumed
- **whether the fix is reachable**: who calls the code, and whether something later overwrites what
  it does
- **the scope**, and what is left out and becomes an issue of its own
- **the tests**, including whether an end-to-end test of its own is possible — that decides the
  column after the merge (§21)
- **the places at risk**: a change to the unit definition (normalizer or migration step, §14), e2e
  selectors, what both applications share in `projects/common`

The plan goes into the conversation, not into the ticket; the ticket gets the result. Approving the
plan is what moves the card to *In Bearbeitung*. A plan that ends in a question, or in not building
it, moves no card.

Rationale:
- a misunderstanding caught in a plan costs one message; caught in review it costs a pull request
  and a pipeline run
- a session does not know what earlier sessions decided or rejected. Without a plan, the first time a
  person sees what it is about to do is the finished pull request

## 19) Before the commit: a review

Finish the change and verify it (tests, lint, typecheck), but do not commit it yet. Run
`/code-review` on it first; only then commit, push and open the pull request.

- `/code-review` without a target reviews the uncommitted diff (`git diff HEAD`). Once the change is
  committed that diff is empty and the review finds nothing; then name the scope explicitly
  (`/code-review origin/develop..HEAD`, or the pull request number).
- After the review, check `git status`. Review agents can leave files of their own in the working
  tree; they do not belong in the commit.

Rationale:
- a review before the pull request can still turn the change around — a regression, or a fix that
  compiles, passes every suite and does nothing. After the pull request every such round costs a
  pipeline run

## 20) Commit messages and pull requests

Commit messages:
- The subject line names the change in the imperative, at most 72 characters, with the issue as
  `(#1357)`.
- The body says only what the diff cannot: why the change was needed, a decision the code does not
  make obvious, a change in behaviour someone will look for later. As a guide, no more than five
  lines; more only for a behaviour change that needs it.
- Leave out how the change came about (drafts, review rounds, what was tried first, where it sits in
  a series), test results (they belong in the pull request) and a retelling of the diff. Why the
  code is built the way it is belongs in a code comment, where it survives the next refactoring.

Pull requests:
- Never write `Closes #…`, `Fixes #…` or `Resolves #…` in a commit message or pull request text.
  Reference the issue as `(#1357)`: GitHub would close the ticket on merge, and the board would move
  it past *zu testen* and *Zu Veröffentlichen*.
- Force-push only with `--force-with-lease`, never with `--force`, which silently overwrites whatever
  someone else pushed to the branch in the meantime.
- A pull request stays within the goal of its issue. What turns up on the way and belongs elsewhere —
  in review as well — becomes an issue of its own, not a commit on the branch.

Rationale:
- a commit message is read in `git log` and `git blame`, months later, by someone asking why the
  code is the way it is; every further paragraph makes that answer harder to find
- every extra topic lengthens the review, and every further round costs a pipeline run of about half
  an hour

## 21) Tickets and board 13

A ticket goes on the board of its own repository, even when it comes out of work on another one:
verona-modules-aspect on [board 13](https://github.com/orgs/iqb-berlin/projects/13), studio-lite on
[board 18](https://github.com/orgs/iqb-berlin/projects/18). Board 13 adds a new issue of this
repository by itself and puts it in *Neue Tickets* — check that it arrived rather than adding it a
second time. *Priority* and *Aufwand* stay empty; the team estimates them.

The columns in the order of the work:

- *In Bearbeitung* once the plan is approved (§18), and only while working towards a pull request.
  The column tells colleagues that something is being built; looking into a ticket, or an analysis
  that ends in a question, is not that yet.
- After the merge the test decides. With an end-to-end test of its own the change goes to
  *Zu Veröffentlichen*, without one to *zu testen*, where someone else builds the test. "Of its own"
  means a test that checks exactly this change and would fail without it; an existing spec that keeps
  passing does not count.
- No end-to-end test of its own either when it would catch nothing new: unit tests fail without the
  change, and a named existing spec exercises exactly the changed path. The change goes to
  *Zu Veröffentlichen*; say in the pull request which tests these are.
- A change nobody can see or trigger in the editor or the player (dead code removed, comments,
  tooling), and one no end-to-end test can observe, go to *Zu Veröffentlichen* straight away. Say in
  the pull request why — in *zu testen* someone would try to build a test that cannot work.
- *Review* means released and awaiting validation by the reporters, not code-reviewed. A ticket stays
  open through all of these columns; do not close it by hand.
- *Icebox* means "never again", not "small" or "later". When in doubt, *Product Backlog*.

In the ticket itself:

- In a ticket written by someone else, leave their text as it is and keep exactly **one** comment
  headed "Stand", edited whenever something new is known. In a ticket of your own the description is
  the current state: edit it rather than append to it.
- Keep comments short: the result, its consequence, one reference (a file, a commit, a pull
  request). Approaches that were dropped stay out of the ticket.
- A question goes to the person you are working for, not into the ticket.

Rationale:
- a ticket is read for where things stand, not as a log of how anyone got there
- a question in a ticket makes work for everyone who reads it and is outdated the next day
