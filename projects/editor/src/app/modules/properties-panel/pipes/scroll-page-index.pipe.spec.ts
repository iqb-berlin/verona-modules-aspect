import { EditorPage } from 'editor/src/app/models/editor-page';
import { ScrollPageIndexPipe } from 'editor/src/app/components/properties-panel/pipes/scroll-page-index.pipe';

describe('ScrollPageIndexPipe', () => {
  const pipe = new ScrollPageIndexPipe();

  const createPage = (alwaysVisible: boolean): EditorPage => ({ alwaysVisible } as EditorPage);

  it('should return the index unchanged when no page is always visible', () => {
    const pages = [createPage(false), createPage(false)];
    expect(pipe.transform(pages, 1)).toBe(1);
  });

  it('should reduce the index by one when an always visible page exists', () => {
    const pages = [createPage(true), createPage(false), createPage(false)];
    expect(pipe.transform(pages, 2)).toBe(1);
  });

  it('should return the index unchanged for an empty page list', () => {
    expect(pipe.transform([], 0)).toBe(0);
  });
});
