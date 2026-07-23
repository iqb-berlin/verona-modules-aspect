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
  // Preserve the arity so runners relying on fn.length keep working.
  Object.defineProperty(wrapped, 'length', { value: fn.length });
  return wrapped;
};

type ItFunction = ((name: string, fn?: TestFunction, timeout?: number) => unknown) &
Record<string, unknown>;

const patchTestFunction = (original: ItFunction): ItFunction => {
  const patched = ((name: string, fn?: TestFunction, timeout?: number) => (
    original(name, fn ? wrapTestInProxyZone(fn) : fn, timeout)
  )) as ItFunction;
  // Keep modifiers (only/skip/todo/…) available, albeit without zone wrapping;
  // the project's specs exclusively use plain `it(...)`/`test(...)` calls.
  Object.keys(original).forEach(key => {
    patched[key] = original[key];
  });
  return patched;
};

const globalScope = globalThis as unknown as Record<string, unknown>;
['it', 'test'].forEach(name => {
  const original = globalScope[name];
  if (typeof original === 'function') {
    globalScope[name] = patchTestFunction(original as ItFunction);
  }
});
