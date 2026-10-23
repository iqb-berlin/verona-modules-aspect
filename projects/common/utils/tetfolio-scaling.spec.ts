import { TetfolioScaling } from './tetfolio-scaling';

describe('TetfolioScaling.scaleFor', () => {
  it('should shrink an experiment wider than the element to the element\'s width', () => {
    expect(TetfolioScaling.scaleFor(600, 1000)).toBe(0.6);
  });

  it('should not enlarge an experiment narrower than the element', () => {
    expect(TetfolioScaling.scaleFor(1200, 1000)).toBe(1);
  });

  it('should keep the scale of an experiment exactly as wide as the element', () => {
    expect(TetfolioScaling.scaleFor(1000, 1000)).toBe(1);
  });

  it('should shrink an experiment to fit however narrow the element is', () => {
    expect(TetfolioScaling.scaleFor(250, 1000)).toBe(0.25);
  });

  it('should not scale while the content width is not known', () => {
    expect(TetfolioScaling.scaleFor(600, 0)).toBe(1);
  });

  it('should not scale while the available width is not known', () => {
    expect(TetfolioScaling.scaleFor(0, 1000)).toBe(1);
  });
});
