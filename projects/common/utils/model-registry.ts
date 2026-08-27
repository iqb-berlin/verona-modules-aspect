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

/**
 * The factory, reachable without importing it: `ElementFactory` assigns itself into this slot at the
 * bottom of its own file.
 *
 * For the element models that build children -- `ClozeElement`, `TableElement` -- the slot is the only
 * way there at all: the factory imports both of them, so importing it back would close a cycle. The
 * rich text editor extensions use it too.
 */
export abstract class ModelRegistry {
  /** Set once, when `element-factory.ts` is loaded. Reading it before that yields undefined. */
  static createElement: ElementCreator;
}
