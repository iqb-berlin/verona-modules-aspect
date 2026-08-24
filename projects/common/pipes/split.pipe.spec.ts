import { SplitPipe } from './split.pipe';

describe('SplitPipe', () => {
  let pipe: SplitPipe;

  beforeEach(() => {
    pipe = new SplitPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should split string by space by default', () => {
    expect(pipe.transform('H He Li')).toEqual(['H', 'He', 'Li']);
  });

  it('should handle extra spaces correctly', () => {
    expect(pipe.transform('H  He   Li')).toEqual(['H', 'He', 'Li']);
  });

  it('should split string by custom separator', () => {
    expect(pipe.transform('H,He,Li', ',')).toEqual(['H', 'He', 'Li']);
  });

  it('should return empty array for null or undefined input', () => {
    expect(pipe.transform(null)).toEqual([]);
    expect(pipe.transform(undefined)).toEqual([]);
    expect(pipe.transform('')).toEqual([]);
  });
});
