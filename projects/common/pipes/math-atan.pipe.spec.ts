import { MathAtanPipe } from './math-atan.pipe';

describe('MathAtanPipe', () => {
  const pipe = new MathAtanPipe();

  /* The piped value is the adjacent side and the argument the opposite one: the hotspot image writes
     `item.height | mathAtan:item.width/2`. */
  it('should divide the opposite side by the adjacent one', () => {
    expect(pipe.transform(Math.sqrt(3), 1)).toBeCloseTo(Math.PI / 6);
  });
});
