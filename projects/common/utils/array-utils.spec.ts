import { ArrayUtils } from './array-utils';

describe('ArrayUtils', () => {
  it('should move an item down', () => {
    const arr = ['a', 'b', 'c'];
    ArrayUtils.moveArrayItem('a', arr, 'down');
    expect(arr).toEqual(['b', 'a', 'c']);
  });

  it('should move an item up', () => {
    const arr = ['a', 'b', 'c'];
    ArrayUtils.moveArrayItem('b', arr, 'up');
    expect(arr).toEqual(['b', 'a', 'c']);
  });

  it('should not move the first item up', () => {
    const arr = ['a', 'b', 'c'];
    ArrayUtils.moveArrayItem('a', arr, 'up');
    expect(arr).toEqual(['a', 'b', 'c']);
  });

  it('should not move the last item down', () => {
    const arr = ['a', 'b', 'c'];
    ArrayUtils.moveArrayItem('c', arr, 'down');
    expect(arr).toEqual(['a', 'b', 'c']);
  });

  it('should ignore items not in the array', () => {
    const arr = ['a', 'b', 'c'];
    ArrayUtils.moveArrayItem('x', arr, 'up');
    expect(arr).toEqual(['a', 'b', 'c']);
  });
});
