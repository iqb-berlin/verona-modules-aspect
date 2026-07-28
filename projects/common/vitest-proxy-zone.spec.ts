/**
 * Guards `projects/vitest-proxy-zone.setup.ts`, which replaces the global `it`/`test` so that
 * every test body runs inside a zone.js ProxyZone.
 *
 * Two regressions are covered:
 * - Vitest's modifiers must survive the patch. They are non-enumerable getters, so a patch that
 *   copies properties with `Object.keys` leaves `it.skip` and friends `undefined`. That fails at
 *   file scope, which drops the whole spec file from the run while the test count still looks
 *   green — so a missing modifier is easy to miss without this check.
 * - Bodies reaching the runner through a modifier must be zone-wrapped too, otherwise
 *   `fakeAsync` throws "Expected to be running in 'ProxyZone', but it was not found."
 *
 * `it.only` and `it.todo` are checked for availability only: calling them would restrict or
 * change the run. `it.fails` is unusable as a check here — it passes on any error, including the
 * missing-ProxyZone error it is supposed to catch.
 */
import { fakeAsync, tick } from '@angular/core/testing';

describe('vitest ProxyZone setup', () => {
  const modifiers = ['skip', 'only', 'todo', 'fails', 'concurrent', 'sequential', 'each', 'for'];

  it('should keep every Vitest modifier available on it and test', () => {
    const globals = { it, test } as unknown as Record<string, Record<string, unknown>>;

    Object.entries(globals).forEach(([name, global]) => {
      modifiers.forEach(modifier => {
        expect(typeof global[modifier], `${name}.${modifier}`).toBe('function');
      });
    });
  });

  it('should run a plain test body inside a ProxyZone', fakeAsync(() => {
    let elapsed = false;
    setTimeout(() => { elapsed = true; }, 100);

    tick(100);

    expect(elapsed).toBe(true);
  }));

  it.each([1, 2])('should run an it.each body inside a ProxyZone (case %s)', fakeAsync(() => {
    let elapsed = false;
    setTimeout(() => { elapsed = true; }, 100);

    tick(100);

    expect(elapsed).toBe(true);
  }));

  // The wrapper must forward its arguments, otherwise a body relying on Vitest's test context
  // or on the value supplied by `it.each` would silently receive nothing.
  it('should forward the Vitest test context to the body', context => {
    expect(context).toBeDefined();
    expect(context.task.name).toContain('forward the Vitest test context');
  });

  it.each(['alpha', 'beta'])('should forward the it.each value to the body (%s)', value => {
    expect(['alpha', 'beta']).toContain(value);
  });
});
