import { VariableInfoOrigin } from 'editor/src/app/utils/variable-info-origins';
import { VariableInfoIssue } from 'editor/src/app/utils/variable-info-validator';

/** A variable of the unit that breaks the Verona contract, where it comes from, and why (#1129). */
export interface VariableInfoFinding {
  origin: VariableInfoOrigin;
  issues: VariableInfoIssue[];
  /**
   * Whether it holds back the variable list, which is the case wherever the alias is concerned. Ids were editable
   * until editor 2.6.0, so stored units may carry ids that break the contract. Replacing one costs the variable's
   * codings in the studio (#1508), so it is offered but never forced: such findings are reported without holding the
   * list back.
   */
  holdsBackList: boolean;
}
