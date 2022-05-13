import { Page } from 'common/interfaces/unit';
import { AlwaysVisiblePagePipe } from './always-visible-page.pipe';

describe('AlwaysVisiblePagePipe', () => {

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

  const pipe = new AlwaysVisiblePagePipe();

  it('should transform an array of pages to the always visible page of the array', () => {
    const pages = [page, page, { ...page, alwaysVisible: true }];
    expect(pipe.transform(pages)).toEqual({ ...page, alwaysVisible: true });
  });

  it('should transform an array of pages without any always visible page to null', () => {
    const pages = [page, page];
    expect(pipe.transform(pages)).toBe(null);
  });

});