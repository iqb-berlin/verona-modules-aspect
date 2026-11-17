import { MathDegreesPipe } from './math-degrees.pipe';

describe('MathDegreesPipe', () => {
  const pipe = new MathDegreesPipe();

  it('should convert radians to degrees', () => {
    expect(pipe.transform(Math.PI)).toBeCloseTo(180);
    expect(pipe.transform(Math.PI / 4)).toBeCloseTo(45);
  });
});
