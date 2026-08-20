import { UIElement } from 'common/models/elements/element';
import { IsCompoundChildPipe } from 'editor/src/app/pipes/is-compound-child.pipe';

describe('IsCompoundChildPipe', () => {
  const pipe = new IsCompoundChildPipe();
  const gap = { id: 'text-field_1' } as unknown as UIElement;
  const cloze = { id: 'cloze_1' } as unknown as UIElement;

  it('should report an element the set names', () => {
    expect(pipe.transform(gap, new Set([gap]))).toBe(true);
  });

  it('should report an element the set does not name', () => {
    expect(pipe.transform(cloze, new Set([gap]))).toBe(false);
  });

  /* By identity, like everything else about deleting since #1262: two elements can carry the same id
     and are still two elements. */
  it('should not report another element carrying the same id', () => {
    expect(pipe.transform({ id: 'text-field_1' } as unknown as UIElement, new Set([gap]))).toBe(false);
  });
});
