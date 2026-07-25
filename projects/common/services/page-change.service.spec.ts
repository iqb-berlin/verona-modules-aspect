import { PageChangeService } from './page-change.service';

describe('PageChangeService', () => {
  let service: PageChangeService;

  beforeEach(() => {
    service = new PageChangeService();
  });

  it('should notify subscribers about a page change', () => {
    let notificationCount = 0;
    service.pageChanged.subscribe(() => { notificationCount += 1; });
    service.pageChanged.emit();
    expect(notificationCount).toBe(1);
  });

  it('should notify multiple subscribers', () => {
    const notifiedSubscribers: string[] = [];
    service.pageChanged.subscribe(() => notifiedSubscribers.push('first'));
    service.pageChanged.subscribe(() => notifiedSubscribers.push('second'));
    service.pageChanged.emit();
    expect(notifiedSubscribers).toEqual(['first', 'second']);
  });
});
