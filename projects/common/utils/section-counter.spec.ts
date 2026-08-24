import { SectionCounter } from './section-counter';

describe('SectionCounter', () => {
  beforeEach(() => {
    SectionCounter.reset();
  });

  it('should increment the counter', () => {
    expect(SectionCounter.getNext()).toBe(1);
    expect(SectionCounter.getNext()).toBe(2);
  });

  it('should reset the counter', () => {
    SectionCounter.getNext();
    SectionCounter.getNext();
    SectionCounter.reset();
    expect(SectionCounter.getNext()).toBe(1);
  });
});
