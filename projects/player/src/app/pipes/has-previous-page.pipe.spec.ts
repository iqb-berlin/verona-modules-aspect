import { IsVisibleIndex } from 'player/src/app/models/is-visible-index.interface';
import { HasPreviousPagePipe } from './has-previous-page.pipe';

describe('HasPreviousPagePipe', () => {
  let pipe: HasPreviousPagePipe;
  let pages: IsVisibleIndex[];

  beforeEach(() => {
    pipe = new HasPreviousPagePipe();
    pages = [
      { index: 0, isVisible: true },
      { index: 1, isVisible: false },
      { index: 2, isVisible: true }
    ];
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should report a preceding visible page', () => {
    expect(pipe.transform(2, pages)).toBe(true);
  });

  it('should skip hidden pages when looking for a preceding page', () => {
    expect(HasPreviousPagePipe.getPreviousPageIndex(2, pages)).toBe(0);
  });

  it('should return the nearest preceding visible page', () => {
    const allVisible: IsVisibleIndex[] = [
      { index: 0, isVisible: true },
      { index: 1, isVisible: true },
      { index: 2, isVisible: true }
    ];

    expect(HasPreviousPagePipe.getPreviousPageIndex(2, allVisible)).toBe(1);
  });

  it('should report no preceding page for the first visible page', () => {
    expect(pipe.transform(0, pages)).toBe(false);
    expect(HasPreviousPagePipe.getPreviousPageIndex(0, pages)).toBeNull();
  });

  it('should find the preceding page in an unsorted page list', () => {
    const unsortedPages: IsVisibleIndex[] = [
      { index: 2, isVisible: true },
      { index: 0, isVisible: true },
      { index: 1, isVisible: true }
    ];

    expect(HasPreviousPagePipe.getPreviousPageIndex(2, unsortedPages)).toBe(1);
  });

  it('should report no preceding page without a page list', () => {
    expect(pipe.transform(1, undefined as unknown as IsVisibleIndex[])).toBe(false);
  });
});
