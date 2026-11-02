import { MoveSectionUpAllowedPipe } from 'editor/src/app/pipes/move-section-up-allowed.pipe';

describe('MoveSectionUpAllowedPipe', () => {
  const pipe = new MoveSectionUpAllowedPipe();

  it('should allow moving a section up within its page', () => {
    expect(pipe.transform(1, 0, undefined)).toBe(true);
    expect(pipe.transform(2, 1, true)).toBe(true);
  });

  it('should not allow moving the first section of the first page up', () => {
    expect(pipe.transform(0, 0, undefined)).toBe(false);
  });

  it('should allow moving the first section of a page onto a regular page before it', () => {
    expect(pipe.transform(0, 1, false)).toBe(true);
  });

  /* It would stand beside every page and could not be moved back down (#1634). */
  it('should not allow moving the first section of a page onto a permanently visible page', () => {
    expect(pipe.transform(0, 1, true)).toBe(false);
  });
});
