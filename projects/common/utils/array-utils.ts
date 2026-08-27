export abstract class ArrayUtils {
  /**
   * Moves an item one position towards the front (`up`) or the back (`down`), in the array itself --
   * the caller's array is reordered, nothing is returned.
   *
   * Silently ignores nonsense reorders! Those are: an item the array does not contain, the first item
   * moving up, the last item moving down, and an array of one. The array is then left as it is, and
   * the caller cannot tell the two cases apart.
   */
  static moveArrayItem(item: unknown, array: unknown[], direction: 'up' | 'down'): void {
    const oldIndex = array.indexOf(item);
    if (oldIndex === -1) return;

    if ((array.length > 1) &&
      !(direction === 'down' && oldIndex + 1 === array.length) && // dont allow last element down
      !(direction === 'up' && oldIndex === 0)) { // dont allow first element up
      const newIndex = direction === 'up' ? oldIndex - 1 : oldIndex + 1;
      const elements = array.splice(oldIndex, 1);
      array.splice(newIndex, 0, elements[0]);
    }
  }
}
