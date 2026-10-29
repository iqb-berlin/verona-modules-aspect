import { NonBreakingSpaceVisibilityService } from './non-breaking-space-visibility.service';

describe('NonBreakingSpaceVisibilityService', () => {
  it('should start switched off', () => {
    expect(new NonBreakingSpaceVisibilityService().visible.value).toBe(false);
  });

  it('should switch on and off again', () => {
    const service = new NonBreakingSpaceVisibilityService();

    service.toggle();
    expect(service.visible.value).toBe(true);

    service.toggle();
    expect(service.visible.value).toBe(false);
  });
});
