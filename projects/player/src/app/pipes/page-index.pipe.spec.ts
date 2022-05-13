import { Page } from 'common/interfaces/unit';
import { PageIndexPipe } from './page-index.pipe';

describe('PageIndexPipe', () => {

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

  const page2: Page = {
    hasMaxWidth: false,
    maxWidth: 0,
    margin: 0,
    backgroundColor: 'white',
    alwaysVisible: false,
    alwaysVisiblePagePosition: 'left',
    alwaysVisibleAspectRatio: 50,
    sections: []
  };

  const pipe = new PageIndexPipe();

  it('should transform pages to the index of given page (0)', () => {
    const pages = [page, page2, { ...page2, alwaysVisible: true }];
    expect(pipe.transform(pages, page)).toEqual(0);
  });

  it('should transform pages to the index of given page (not 1)', () => {
    const pages = [page, page2, { ...page2, alwaysVisible: true }];
    expect(pipe.transform(pages, page)).not.toEqual(1);
  });

  it('should transform pages to the index of given page2 (1)', () => {
    const pages = [page, page2, { ...page2, alwaysVisible: true }];
    expect(pipe.transform(pages, page2)).toEqual(1);
  });

  it('should transform pages to the index of unknown page (-1)', () => {
    const pages = [page, { ...page2, alwaysVisible: true }];
    expect(pipe.transform(pages, page2)).toEqual(-1);
  });

  it('should transform pages to the index of unknown page (-1)', () => {
    const pages = [page, { ...page2, alwaysVisible: true }];
    expect(pipe.transform(pages, { ...page2, alwaysVisible: true })).toEqual(-1);
  });

});
