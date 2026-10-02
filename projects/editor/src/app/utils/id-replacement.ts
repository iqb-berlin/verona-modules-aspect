import { UIElement } from 'common/models/elements/element';
import { StateVariable } from 'common/models/state-variable';
import { VariableAlias } from 'common/utils/variable-alias';
import { VariableInfoFinding } from 'editor/src/app/models/variable-info-finding';

/** An object whose own id can be replaced: an element or a state variable. */
export type IdReplacementTarget = { element: UIElement; stateVariable?: never } |
{ stateVariable: StateVariable; element?: never };

/**
 * Which finding replacing an id clears, and whether an id still needs replacing (#1508). Ids were editable until
 * editor 2.6.0, so stored units can carry ids that break the Verona contract; a new id is the only way out, and it
 * costs the variable's codings in the studio, which is why it is offered rather than done.
 */
export abstract class IdReplacement {
  /**
   * The object whose own id the finding is about, if replacing that id clears it. A GeoGebra variable is cleared by
   * replacing its element's id only when the fault lies there; a fault in the GeoGebra name has to be fixed in
   * GeoGebra.
   */
  static targetOf(finding: VariableInfoFinding): IdReplacementTarget | null {
    const idIssues = finding.issues.filter(issue => issue.part === 'id');
    if (idIssues.length === 0) return null;
    const { stateVariable, location } = finding.origin;
    if (stateVariable) return { stateVariable };
    if (!location) return null;
    const { element } = location;
    const isOwnIdFaulty = VariableAlias.check(element.id) !== null ||
      idIssues.some(issue => issue.code === 'DUPLICATE_ID' && issue.value === element.id);
    return isOwnIdFaulty ? { element } : null;
  }

  /**
   * Whether an id still breaks the contract among the ids that remain. Asked right before each replacement, so that
   * of two ids that differ only in letter case only one is replaced, and only one variable loses its codings.
   */
  static needsReplacement(id: string, otherIDs: string[]): boolean {
    const comparable = VariableAlias.toComparable(id);
    return VariableAlias.check(id) !== null ||
      otherIDs.some(otherID => VariableAlias.toComparable(otherID) === comparable);
  }
}
