export abstract class Copy {
  static getCopy<T>(objectToCopy: T): T {
    if (Array.isArray(objectToCopy)) {
      return [...objectToCopy] as unknown as T;
    }
    if (objectToCopy instanceof Object) {
      return { ...objectToCopy } as T;
    }
    return objectToCopy;
  }
}
