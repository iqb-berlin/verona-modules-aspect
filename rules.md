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

## 11) Unit tests for new code

- New Angular classes (Components, Pipes, Services, Guards, Directives) MUST ship with
  a corresponding `.spec.ts` and meaningful unit tests.
- Changes to existing business logic MUST update the corresponding tests to cover the
  new behavior and guard against regressions.
- Adding or changing a public method/property MUST be covered by tests.

Rationale:
- protects behavior as the codebase evolves
- applies to new/changed code, not as a retroactive requirement for untested files

## 12) Component, pipe and directive file structure

This is not consistently implemented across the codebase yet, but all **new** building
blocks MUST follow this layout (the `player` project is the reference).

New components MUST be split into four files in their own directory:

- `[name].component.ts` (logic/class)
- `[name].component.html` (template)
- `[name].component.scss` (styles — SCSS is preferred over CSS)
- `[name].component.spec.ts` (unit tests)

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
  migration step via `npm run generate-migration <from> <to>`, registered in `MigrationManager`.
- **Wrong values have to be repaired** → mind the reach: a step only touches units **older** than
  its `toVersion`, so data written by the version being migrated to is out of its reach. Either
  migrate to a newer version, or handle it in `ModelNormalizer` — and only if the data is worth a
  case that then runs on every load of every unit, forever.

Defaults in `ELEMENT_DEFAULTS` are what the normalizer writes into units, so their types must match
what the model declares. Since #1177 the table is typed against the element property interfaces
(`FlatDefaults` in `element-registry.ts`): a default with the wrong type or an unknown key is a
compile error, and reading a default the table does not define is one too. The compiler checks
types, not values — a plausible-but-wrong value (100 where 135 was meant) still compiles, so cover
new or changed default VALUES with a spec, as `model-normalizer.spec.ts` does. Historical context:
as an untyped `Record<string, unknown>`, a string default for a `boolean` property travelled into
stored units unnoticed for months (#1139).

A styling property outside `BasicStyles`/`BorderStyles` (an element declaring
`styling: BasicStyles & { lineHeight: number }`) has to be listed in `EXTRA_STYLING_KEYS` AND to
exist in `OtherStyles`: `ModelNormalizer` rebuilds the styling group from scratch and carries over
exactly the listed keys, while the editor's write path is keyed on `keyof Stylings`. Since #1185
both are checked against the element interfaces, so forgetting either fails to compile, naming the
key. Being listed is necessary but NOT sufficient: the carry-over is additionally gated on the
element's own `ELEMENT_DEFAULTS` entry holding that key, and no type checks this half — give a new
extra styling key a default on every element whose interface declares it, or stored values are
still dropped on load.

Rationale:
- most model changes need no migration step at all; writing one anyway adds code that must be
  maintained and can silently miss the units it was written for
- the reach of a step is not obvious from its version numbers and has been misjudged twice

