import { Injectable } from '@angular/core';
import { Unit } from 'common/models/unit';
import { VisibilityRuleTargetType } from 'common/models/visibility-rule';

/**
 * Which type of element an answer belongs to, looked up by the element's id.
 *
 * An answer carries id, value and status only, and the visibility rules of a section need the type to read
 * the value (#1718). The unit knows it, so the table is built once when a unit is loaded: every element,
 * the children of cloze texts, option tables and tables included, and every state variable as
 * `'state-variable'`.
 */
@Injectable({
  providedIn: 'root'
})
export class ElementTypeService {
  private types = new Map<string, VisibilityRuleTargetType>();

  /** Replaces the table with the one of the given unit. */
  setUnit(unit: Unit): void {
    this.types = new Map<string, VisibilityRuleTargetType>([
      ...unit.getAllElements().map((element): [string, VisibilityRuleTargetType] => [element.id, element.type]),
      ...unit.stateVariables
        .map((stateVariable): [string, VisibilityRuleTargetType] => [stateVariable.id, 'state-variable'])
    ]);
  }

  /** The type of the element with this id; `undefined` for an id the unit does not have. */
  getType(id: string): VisibilityRuleTargetType | undefined {
    return this.types.get(id);
  }
}
