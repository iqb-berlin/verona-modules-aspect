import { MarkListPipe } from './mark-list.pipe';

describe('MarkListPipe', () => {
  let pipe: MarkListPipe;

  const asMarkList = (marks: { type: string }[] | null): Record<string, string> => (
    marks as unknown as Record<string, string>
  );

  beforeEach(() => {
    pipe = new MarkListPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should extract the type of every mark', () => {
    expect(pipe.transform(asMarkList([{ type: 'bold' }, { type: 'italic' }]))).toEqual(['bold', 'italic']);
  });

  it('should return an empty array for an empty mark list', () => {
    expect(pipe.transform(asMarkList([]))).toEqual([]);
  });

  it('should return an empty array for a missing mark list', () => {
    expect(pipe.transform(asMarkList(null))).toEqual([]);
  });
});
