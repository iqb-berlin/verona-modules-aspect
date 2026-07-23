import { TableGridRowsPipe } from './table-grid-rows.pipe';

describe('TableGridRowsPipe', () => {
  const pipe = new TableGridRowsPipe();
  const gridRowSizes = [{ value: 1, unit: 'fr' }, { value: 50, unit: 'px' }];

  it('should return the plain row sizes without header rows', () => {
    expect(pipe.transform(gridRowSizes, 0)).toBe('1fr 50px');
  });

  it('should prepend an auto track for each header row', () => {
    expect(pipe.transform(gridRowSizes, 1)).toBe('auto 1fr 50px');
    expect(pipe.transform(gridRowSizes, 2)).toBe('auto auto 1fr 50px');
  });

  it('should handle empty row sizes', () => {
    expect(pipe.transform([], 1)).toBe('auto');
  });
});
