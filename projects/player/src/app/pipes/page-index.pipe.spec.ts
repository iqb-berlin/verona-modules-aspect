import { Page } from 'common/models/page';
import { PageIndexPipe } from './page-index.pipe';

describe('PageIndexPipe', () => {
  let pipe: PageIndexPipe;
  let pages: Page[];

  beforeEach(() => {
    pipe = new PageIndexPipe();
    pages = [new Page(), new Page(), new Page()];
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform pages to the index of the given page', () => {
    expect(pipe.transform(pages, pages[0])).toBe(0);
    expect(pipe.transform(pages, pages[1])).toBe(1);
    expect(pipe.transform(pages, pages[2])).toBe(2);
  });

  it('should match the page by reference, not by equal content', () => {
    expect(pipe.transform(pages, new Page())).toBe(-1);
  });

  it('should transform pages to -1 without a page to find', () => {
    expect(pipe.transform(pages, null)).toBe(-1);
  });
});
