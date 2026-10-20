import { NavigationTargetRule } from 'common/utils/navigation-target-rule';
import { IsEnabledNavigationTargetPipe } from './is-enabled-navigation-target.pipe';

describe('IsEnabledNavigationTargetPipe', () => {
  let pipe: IsEnabledNavigationTargetPipe;

  beforeEach(() => {
    pipe = new IsEnabledNavigationTargetPipe();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should answer with the navigation target rule', () => {
    const isEnabled = vi.spyOn(NavigationTargetRule, 'isEnabled').mockReturnValue(false);

    expect(pipe.transform('unitNav', 'next', ['next'])).toBe(false);
    expect(isEnabled).toHaveBeenCalledWith('unitNav', 'next', ['next']);
  });

  it('should return false for a unitNav param that is not an enabled target', () => {
    expect(pipe.transform('unitNav', 'next', [])).toBe(false);
  });
});
