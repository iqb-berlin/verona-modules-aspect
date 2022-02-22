export abstract class ArrayUtils {
  /* Silently ignores nonsense reorders! */
  static moveArrayItem(item: unknown, array: unknown[], direction: 'up' | 'down'): void {
    const oldIndex = array.indexOf(item);

    if ((array.length > 1) &&
      !(direction === 'down' && oldIndex + 1 === array.length) && // dont allow last element down
      !(direction === 'up' && oldIndex === 0)) { // dont allow first element up
      const newIndex = direction === 'up' ? oldIndex - 1 : oldIndex + 1;
      const elements = array.splice(oldIndex, 1);
      array.splice(newIndex, 0, elements[0]);
    }
  }
}
