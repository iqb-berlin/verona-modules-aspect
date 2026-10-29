import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { Unit } from 'common/models/unit';
import { UIElement } from 'common/models/elements/element';
import { DropListElement } from 'common/models/elements/drop-list';
import { LikertElement } from 'common/models/elements/likert';
import { GeometryElement } from 'common/models/elements/geometry';
import { StateVariable } from 'common/models/state-variable';

/** The property a variable's identifiers come from, where the author would have to change them. */
export type VariableInfoProperty = 'alias' | 'trackedVariables' | 'trackedExpectedVariables';

/** Where an element-bound variable sits in the unit. */
export interface VariableInfoLocation {
  pageIndex: number;
  sectionIndex: number;
  /** The element the variable belongs to -- a cloze child or a likert row as well. */
  element: UIElement;
  /** The element the section places, which is what can be selected: the parent for a compound child. */
  navigationElement: UIElement;
}

/** A variable of the unit together with where it comes from. */
export interface VariableInfoOrigin {
  info: VariableInfo;
  /** Set for element-bound variables. */
  location?: VariableInfoLocation;
  /** Set for state variables, which belong to the unit rather than to a page. */
  stateVariable?: StateVariable;
  property: VariableInfoProperty;
  /** The part of the identifier that comes from content rather than from the element: a GeoGebra object name. */
  subValue?: string;
}

/**
 * Pairs every variable the unit reports with the place it comes from, so that a problem with one of them can be
 * shown where the author has to fix it. `Unit.getVariableInfos()` answers only what is reported, flat and without
 * origin; this walks the same elements in the same order and asks them the same way, so the variables it returns
 * are exactly those (#1129).
 */
export abstract class VariableInfoOrigins {
  static collect(unit: Unit): VariableInfoOrigin[] {
    const dropLists = unit.getAllElements('drop-list') as DropListElement[];
    return [
      ...unit.stateVariables.map(stateVariable => ({
        info: stateVariable.getVariableInfo(), stateVariable, property: 'alias' as const
      })),
      ...unit.pages.flatMap((page, pageIndex) => page.sections
        .flatMap((section, sectionIndex) => section.elements
          .flatMap(navigationElement => [navigationElement, ...navigationElement.getChildElements()]
            .flatMap(element => VariableInfoOrigins.getVariableInfos(element, dropLists)
              .map(info => VariableInfoOrigins.describe(info, {
                pageIndex, sectionIndex, element, navigationElement
              }))))))
    ];
  }

  /** As `Section.getVariableInfos` asks an element. */
  private static getVariableInfos(element: UIElement, dropLists: DropListElement[]): VariableInfo[] {
    return element.type === 'drop-list' ?
      (element as DropListElement).getVariableInfos(dropLists) :
      element.getVariableInfos();
  }

  /** Two element types report variables under identifiers other than their own. */
  private static describe(info: VariableInfo, location: VariableInfoLocation): VariableInfoOrigin {
    const { element } = location;
    if (info.id !== element.id && element instanceof LikertElement) {
      const row = element.rows.find(likertRow => likertRow.id === info.id);
      if (row) return { info, location: { ...location, element: row }, property: 'alias' };
    }
    if (info.id !== element.id && element instanceof GeometryElement) {
      const name = element.getAllCleanedTrackedVariables()
        .map(variable => variable.id)
        .find(variableName => element.getGeometryVariableId(variableName) === info.id);
      if (name !== undefined) {
        const isSelectable = element.trackedVariables.some(variable => variable.id === name);
        return {
          info,
          location,
          property: isSelectable ? 'trackedVariables' : 'trackedExpectedVariables',
          subValue: name
        };
      }
    }
    return { info, location, property: 'alias' };
  }
}
