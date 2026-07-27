import { Page } from 'common/models/page';
import { AlwaysVisiblePagePipe } from './always-visible-page.pipe';

describe('AlwaysVisiblePagePipe', () => {
  let pipe: AlwaysVisiblePagePipe;

  const createPage = (alwaysVisible: boolean): Page => {
    const page = new Page();
    page.alwaysVisible = alwaysVisible;
    return page;
  };

  beforeEach(() => {
    pipe = new AlwaysVisiblePagePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform an array of pages to the always visible page of the array', () => {
    const alwaysVisiblePage = createPage(true);

    expect(pipe.transform([createPage(false), createPage(false), alwaysVisiblePage])).toBe(alwaysVisiblePage);
  });

  it('should return the first always visible page when there are several', () => {
    const firstAlwaysVisiblePage = createPage(true);

    expect(pipe.transform([firstAlwaysVisiblePage, createPage(true)])).toBe(firstAlwaysVisiblePage);
  });

  it('should transform an array of pages without any always visible page to null', () => {
    expect(pipe.transform([createPage(false), createPage(false)])).toBeNull();
  });

  it('should transform an empty array to null', () => {
    expect(pipe.transform([])).toBeNull();
  });
});
