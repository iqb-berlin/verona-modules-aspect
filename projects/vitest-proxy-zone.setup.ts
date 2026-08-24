/**
 * Runs every Vitest test body inside a zone.js ProxyZone.
 *
 * With Karma/Jasmine this wiring was done by the Jasmine patch contained in
 * 'zone.js/testing'; an equivalent patch for Vitest does not exist. Without a
 * ProxyZone, Angular's `fakeAsync`/`tick` and `waitForAsync` throw
 * "Expected to be running in 'ProxyZone', but it was not found."
 *
 * 'zone.js' and 'zone.js/testing' are loaded beforehand via the polyfills of
 * the build target referenced by the '@angular/build:unit-test' builder.
 *
 * The patch keeps Vitest's modifiers intact and zone-wraps the bodies reaching them, so
 * `it.skip`, `it.only` and `it.each` work with `fakeAsync`/`tick`. See
 * `projects/common/vitest-proxy-zone.spec.ts`. `describe` is deliberately not patched —
 * it does not take a test body.
 */

type TestFunction = (...args: unknown[]) => unknown;

interface ProxyZoneSpecClass {
  new (): unknown;
}

interface ZoneStatic {
  ProxyZoneSpec: ProxyZoneSpecClass;
  root: {
    fork(spec: unknown): {
      run<T>(fn: TestFunction, thisArg?: unknown, args?: unknown[]): T;
    };
  };
}

const zoneStatic = (globalThis as { Zone?: ZoneStatic }).Zone;

if (!zoneStatic || !zoneStatic.ProxyZoneSpec) {
  throw new Error(
    'vitest-proxy-zone.setup: zone.js/testing is not loaded. ' +
    'Ensure the build target polyfills include "zone.js".'
  );
}

const wrapTestInProxyZone = (fn: TestFunction): TestFunction => {
  const wrapped = function wrappedInProxyZone(this: unknown, ...args: unknown[]): unknown {
    const proxyZone = zoneStatic.root.fork(new zoneStatic.ProxyZoneSpec());
    return proxyZone.run(fn, this, args);
  };
  // Preserve the arity: Vitest passes the test context only to bodies that declare a parameter.
  Object.defineProperty(wrapped, 'length', { value: fn.length });
  return wrapped;
};

/**
 * A test declaration is `(name, body, timeout?)`. Every other call shape on the same chain —
 * `each(table)`, `for(table)`, `extend(fixtures)`, `skipIf(condition)` — must pass through
 * unchanged; those return the function that then receives the body.
 */
const isTestDeclaration = (args: unknown[]): boolean => (
  typeof args[0] === 'string' && typeof args[1] === 'function'
);

/**
 * Function-valued members that must be forwarded as they are. `fn` is Vitest's underlying
 * implementation and is compared by identity internally; the rest are Function.prototype
 * members that callers may legitimately want unwrapped.
 */
const PASS_THROUGH = new Set(['fn', 'bind', 'call', 'apply', 'constructor', 'toString']);

/**
 * Wraps a chainable test function so that every body reaching it runs in a ProxyZone —
 * plain `it(…)` as well as bodies passed through a modifier such as `it.only(…)` or
 * `it.each(table)(…)`.
 *
 * A Proxy is used instead of copying properties onto a replacement function: Vitest defines
 * `skip`, `only`, `todo`, `fails`, `concurrent` and `sequential` as non-enumerable getters, so
 * `Object.keys` does not report them and copying leaves them `undefined`. That turned
 * `it.skip(…)` into a `TypeError` at file scope, which drops the whole spec file from the run
 * while the test count still looks green.
 */
const wrapChainable = (target: TestFunction): TestFunction => new Proxy(target, {
  apply(chainable: TestFunction, thisArg: unknown, args: unknown[]): unknown {
    const result = Reflect.apply(
      chainable,
      thisArg,
      isTestDeclaration(args) ?
        [args[0], wrapTestInProxyZone(args[1] as TestFunction), ...args.slice(2)] :
        args
    );
    // `it.each(table)` and friends return the function that receives the body.
    return typeof result === 'function' ? wrapChainable(result as TestFunction) : result;
  },
  get(chainable: TestFunction, property: string | symbol): unknown {
    const value = Reflect.get(chainable, property);
    if (typeof value !== 'function' || typeof property === 'symbol' ||
      PASS_THROUGH.has(property)) {
      return value;
    }
    return wrapChainable(value as TestFunction);
  }
});

const globalScope = globalThis as unknown as Record<string, unknown>;
['it', 'test'].forEach(name => {
  const original = globalScope[name];
  if (typeof original === 'function') {
    globalScope[name] = wrapChainable(original as TestFunction);
  }
});
