import { UIElement } from 'common/models/elements/element';
import { AbstractIDService } from 'common/models/id-interfaces';
import { UIElementProperties, UIElementType } from 'common/models/ui-element-interfaces';

type ElementCreator = (
  element: { type: UIElementType } & Partial<UIElementProperties>,
  idService?: AbstractIDService
) => UIElement;

export abstract class ModelRegistry {
  static createElement: ElementCreator;
}
