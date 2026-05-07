# Frontend Template Rules

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
