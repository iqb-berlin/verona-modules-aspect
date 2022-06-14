import { UIElement, UIElementType } from 'common/models/elements/element';

export abstract class UnitUtils { // TODO delete this. replce by unit method
  static findUIElements(value: any | unknown[], type?: UIElementType): UIElement[] {
    const elements: UIElement[] = [];
    if (value && typeof value === 'object') {
      if (type ? value.type === type : value instanceof UIElement) {
        elements.push(value);
      }
      if (Array.isArray(value)) {
        value.forEach((arrayItem: unknown) => {
          elements.push(...UnitUtils.findUIElements(arrayItem, type));
        });
      } else {
        Object.keys(value).forEach((key: string) => {
          elements.push(...UnitUtils.findUIElements(value[key], type));
        });
      }
    }
    return elements;
  }
}
