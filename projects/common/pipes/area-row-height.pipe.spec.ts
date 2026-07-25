import { AreaRowHeightPipe } from './area-row-height.pipe';

describe('AreaRowHeightPipe', () => {
  let pipe: AreaRowHeightPipe;

  beforeEach(() => {
    pipe = new AreaRowHeightPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should calculate the height for a single row', () => {
    // fontSize 20 -> content 24 -> container 36 -> math element 54
    expect(pipe.transform(1, 20, 100)).toBe(54);
  });

  it('should scale the height with the number of rows', () => {
    expect(pipe.transform(3, 20, 100)).toBe(162);
  });

  it('should scale the height with the line height percentage', () => {
    expect(pipe.transform(1, 20, 150)).toBe(81);
  });

  it('should return 0 for zero rows', () => {
    expect(pipe.transform(0, 20, 100)).toBe(0);
  });
});
