import { IsVisibleIndex } from 'player/src/app/models/is-visible-index.interface';
import { IsValidPagePipe } from './is-valid-page.pipe';

describe('IsValidPagePipe', () => {
  let pipe: IsValidPagePipe;
  let pages: IsVisibleIndex[];

  beforeEach(() => {
    pipe = new IsValidPagePipe();
    pages = [
      { index: 0, isVisible: true },
      { index: 1, isVisible: false },
      { index: 2, isVisible: true }
    ];
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should accept a visible page index', () => {
    expect(pipe.transform(0, pages)).toBe(true);
    expect(pipe.transform(2, pages)).toBe(true);
  });

  it('should reject a hidden page index', () => {
    expect(pipe.transform(1, pages)).toBe(false);
  });

  it('should reject an unknown page index', () => {
    expect(pipe.transform(3, pages)).toBe(false);
  });

  it('should reject any index without a page list', () => {
    expect(pipe.transform(0, undefined as unknown as IsVisibleIndex[])).toBe(false);
  });
});
