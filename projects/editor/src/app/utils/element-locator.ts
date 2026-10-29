import { Unit } from 'common/models/unit';
import { UIElement } from 'common/models/elements/element';
import { VariableInfoLocation } from 'editor/src/app/utils/variable-info-origins';

/**
 * Finds where an element sits in the unit, so that a list naming it can take the author there (#1520). A compound
 * child -- a cloze gap, a table cell -- is found as well; what can be selected for it is its parent, the element the
 * section places.
 */
export abstract class ElementLocator {
  /** The place of the element, or null if the unit does not hold it (any more). */
  static locate(unit: Unit, element: UIElement): VariableInfoLocation | null {
    for (let pageIndex = 0; pageIndex < unit.pages.length; pageIndex += 1) {
      const { sections } = unit.pages[pageIndex];
      for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
        const navigationElement = sections[sectionIndex].elements
          .find(placed => placed === element || placed.getChildElements().includes(element));
        if (navigationElement) {
          return {
            pageIndex, sectionIndex, element, navigationElement
          };
        }
      }
    }
    return null;
  }
}
