/**
 * Guards `projects/vitest-restore-mocks.setup.ts`: a spy set in one test is gone in the next (#1684).
 * The second test relies on running after the first, which is the order Vitest runs a file in.
 */
describe('vitest restore-mocks setup (#1684)', () => {
  const clock = { now: (): number => 1 };

  it('lets a test replace a method with a spy', () => {
    vi.spyOn(clock, 'now').mockReturnValue(2);

    expect(clock.now()).toBe(2);
  });

  it('hands the next test the original method again', () => {
    expect(vi.isMockFunction(clock.now)).toBe(false);
    expect(clock.now()).toBe(1);
  });
});
