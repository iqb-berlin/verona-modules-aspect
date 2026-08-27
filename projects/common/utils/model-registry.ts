import { UIElement } from 'common/models/elements/element';
import { AbstractIDService } from 'common/models/id-interfaces';
import { UIElementDraft } from 'common/models/ui-element-interfaces';

/** The same draft `ElementFactory.createElement` takes, so a caller reaching the factory from here --
   the rich text editor extensions, a cloze child, a table cell -- can name a single group member and
   leave the rest of the group to the element instead of completing it with a generator (#1193). */
type ElementCreator = (
  element: UIElementDraft,
  idService?: AbstractIDService
) => UIElement;

export abstract class ModelRegistry {
  static createElement: ElementCreator;
}
