import { IsEnabledNavigationTargetPipe } from './is-enabled-navigation-target.pipe';

describe('IsEnabledNavigationTargetPipe', () => {
  let pipe: IsEnabledNavigationTargetPipe;

  beforeEach(() => {
    pipe = new IsEnabledNavigationTargetPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return true when no enabled navigation targets are given', () => {
    expect(pipe.transform('unitNav', 'next', undefined)).toBe(true);
  });

  it('should return true for a unitNav param that is an enabled target', () => {
    expect(pipe.transform('unitNav', 'next', ['previous', 'next'])).toBe(true);
  });

  it('should return false for a unitNav param that is not an enabled target', () => {
    expect(pipe.transform('unitNav', 'end', ['previous', 'next'])).toBe(false);
    expect(pipe.transform('unitNav', 'next', [])).toBe(false);
  });

  it('should return true for actions other than unitNav', () => {
    expect(pipe.transform('pageNav', 2, [])).toBe(true);
    expect(pipe.transform(null, null, [])).toBe(true);
  });
});
