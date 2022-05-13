import { ScrollPagesPipe } from './scroll-pages.pipe';
import { Page } from 'common/interfaces/unit';

describe('ScrollPagesPipe', () => {

  const page: Page = {
    hasMaxWidth: false,
    maxWidth: 0,
    margin: 0,
    backgroundColor: 'white',
    alwaysVisible: false,
    alwaysVisiblePagePosition: 'left',
    alwaysVisibleAspectRatio: 50,
    sections: []
  };

  const pipe = new ScrollPagesPipe();

  it('should transform 3 pages to 2 scroll pages', () => {
    const pages = [page, page, { ...page, alwaysVisible: true }];
    expect(pipe.transform(pages).length).toBe(2);
  });

  it('should transform 2 pages to 2 scroll pages', () => {
    const pages = [page, page];
    expect(pipe.transform(pages).length).toBe(2);
  });

});
