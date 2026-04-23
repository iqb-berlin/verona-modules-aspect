export class SectionCounter {
  private static counter: number = 0;

  static getNext(): number {
    SectionCounter.counter += 1;
    return SectionCounter.counter;
  }

  static reset(): void {
    SectionCounter.counter = 0;
  }
}
