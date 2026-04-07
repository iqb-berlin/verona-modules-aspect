export abstract class Copy {
  static getCopy(objectToCopy: any): any {
    if (objectToCopy instanceof Array) {
      return [...objectToCopy];
    }
    if (objectToCopy instanceof Object) {
      return { ...objectToCopy };
    }
    return objectToCopy;
  }
}
