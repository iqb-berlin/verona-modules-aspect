/**
 * Restores every spy after every test, in all five test projects (#1684).
 *
 * The unit-test builder runs the spec files of a project with `isolate: false`, in one browser
 * context. A spy that one spec sets with `vi.spyOn` on a static method or on `window` and does not
 * restore stays in place for every spec that runs after it, and a later `vi.spyOn` on the same
 * method gets that spy back, with its calls. That turned the toolbar spec red once the order of the
 * files changed: the GeoGebra dialog's spy on `FileService.loadFile` counted a call into it (#1679).
 *
 * Registered here rather than in each spec, so that a spec can no longer forget it. Vitest runs
 * `afterEach` hooks in reverse order, so a spec's own `afterEach` still sees its spies.
 */
afterEach(() => {
  vi.restoreAllMocks();
});
