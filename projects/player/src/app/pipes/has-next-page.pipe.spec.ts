import { IsVisibleIndex } from 'player/src/app/models/is-visible-index.interface';
import { HasNextPagePipe } from './has-next-page.pipe';

describe('HasNextPagePipe', () => {
  let pipe: HasNextPagePipe;
  let pages: IsVisibleIndex[];

  beforeEach(() => {
    pipe = new HasNextPagePipe();
    pages = [
      { index: 0, isVisible: true },
      { index: 1, isVisible: false },
      { index: 2, isVisible: true }
    ];
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should report a following visible page', () => {
    expect(pipe.transform(0, pages)).toBe(true);
  });

  it('should skip hidden pages when looking for a following page', () => {
    expect(pipe.transform(1, pages)).toBe(true);
    expect(HasNextPagePipe.getNextPageIndex(0, pages)).toBe(2);
  });

  it('should report no following page for the last visible page', () => {
    expect(pipe.transform(2, pages)).toBe(false);
    expect(HasNextPagePipe.getNextPageIndex(2, pages)).toBeNull();
  });

  it('should report no following page when all following pages are hidden', () => {
    expect(pipe.transform(0, [{ index: 0, isVisible: true }, { index: 1, isVisible: false }])).toBe(false);
  });

  it('should find the nearest following page in an unsorted page list', () => {
    const unsortedPages: IsVisibleIndex[] = [
      { index: 2, isVisible: true },
      { index: 0, isVisible: true },
      { index: 1, isVisible: true }
    ];

    expect(HasNextPagePipe.getNextPageIndex(0, unsortedPages)).toBe(1);
    expect(pipe.transform(0, unsortedPages)).toBe(true);
  });

  it('should leave the page list it is given untouched', () => {
    const unsortedPages: IsVisibleIndex[] = [
      { index: 2, isVisible: true },
      { index: 0, isVisible: true },
      { index: 1, isVisible: true }
    ];

    pipe.transform(0, unsortedPages);

    expect(unsortedPages.map(page => page.index)).toEqual([2, 0, 1]);
  });

  it('should report no following page without a page list', () => {
    expect(pipe.transform(0, undefined as unknown as IsVisibleIndex[])).toBe(false);
  });
});
