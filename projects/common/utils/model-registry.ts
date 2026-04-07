import { UIElement } from 'common/models/elements/element';
import { AbstractIDService, UIElementProperties, UIElementType } from 'common/interfaces';

export type ElementCreator = (
  element: { type: UIElementType } & Partial<UIElementProperties>,
  idService?: AbstractIDService
) => UIElement;

export abstract class ModelRegistry {
  static createElement: ElementCreator;
}
