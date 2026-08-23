import { MarkListPipe } from './mark-list.pipe';

describe('MarkListPipe', () => {
  let pipe: MarkListPipe;

  beforeEach(() => {
    pipe = new MarkListPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should extract the type of every mark', () => {
    expect(pipe.transform([{ type: 'bold' }, { type: 'italic' }])).toEqual(['bold', 'italic']);
  });

  it('should return an empty array for an empty mark list', () => {
    expect(pipe.transform([])).toEqual([]);
  });

  it('should return an empty array for a missing mark list', () => {
    expect(pipe.transform(undefined)).toEqual([]);
  });
});
