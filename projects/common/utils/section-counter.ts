/**
 * The running number a section shows when a page numbers its sections automatically.
 *
 * The count is static, so it spans every section component of the running application -- that is what
 * lets sections on different pages continue one sequence. Whoever rebuilds the numbering has to
 * `reset()` first, or the sections carry on counting from the run before: `UnitService.updateSectionCounter`
 * does it in the editor, `UnitComponent.updateSectionNumbering` and the player-config change in the
 * player. The print view is the exception -- `PrintSectionComponent` takes numbers without resetting
 * anywhere, so it continues from wherever the counter happens to stand.
 */
export class SectionCounter {
  private static counter: number = 0;

  /** The next number, counting from 1 after a `reset()`. */
  static getNext(): number {
    SectionCounter.counter += 1;
    return SectionCounter.counter;
  }

  /** Starts the sequence over, so the next `getNext()` returns 1 again. */
  static reset(): void {
    SectionCounter.counter = 0;
  }
}
