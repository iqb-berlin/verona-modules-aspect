import { NavigationTargetRule } from './navigation-target-rule';

describe('NavigationTargetRule', () => {
  it('should allow everything while no enabled navigation targets are given', () => {
    expect(NavigationTargetRule.isEnabled('unitNav', 'next', undefined)).toBe(true);
    expect(NavigationTargetRule.isEnabled('unitNav', 'previous', undefined)).toBe(true);
  });

  it('should allow a unitNav param that is an enabled target', () => {
    expect(NavigationTargetRule.isEnabled('unitNav', 'next', ['previous', 'next'])).toBe(true);
  });

  it('should forbid a unitNav param that is not an enabled target', () => {
    expect(NavigationTargetRule.isEnabled('unitNav', 'end', ['previous', 'next'])).toBe(false);
    expect(NavigationTargetRule.isEnabled('unitNav', 'next', ['previous'])).toBe(false);
    expect(NavigationTargetRule.isEnabled('unitNav', 'next', [])).toBe(false);
  });

  it('should allow actions other than unitNav', () => {
    expect(NavigationTargetRule.isEnabled('pageNav', 2, [])).toBe(true);
    expect(NavigationTargetRule.isEnabled(null, null, [])).toBe(true);
  });
});
