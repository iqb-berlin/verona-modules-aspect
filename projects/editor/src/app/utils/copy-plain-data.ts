/**
 * Deep copy of everything plain in a value, keeping what is not.
 *
 * Plain objects and arrays are what the properties panel edits and what a write hands to several
 * elements at once, so both need their own. Anything with a prototype of its own is kept as it is:
 * element models (a likert row, a cloze child) belong to the unit and may not be duplicated -- a copy
 * would carry their IDs a second time -- and the `idService` on a merged element is a service whose
 * methods a copy would lose.
 */
export function copyPlainData<T>(value: T): T {
  if (Array.isArray(value)) return value.map(entry => copyPlainData(entry)) as unknown as T;
  if (value === null || typeof value !== 'object') return value;
  if (Object.getPrototypeOf(value) !== Object.prototype) return value;
  const copy: Record<string, unknown> = {};
  Object.entries(value as Record<string, unknown>)
    .forEach(([key, entry]) => { copy[key] = copyPlainData(entry); });
  return copy as T;
}
