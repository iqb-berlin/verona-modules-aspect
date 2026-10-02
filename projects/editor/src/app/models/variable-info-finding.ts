import { VariableInfoOrigin } from 'editor/src/app/utils/variable-info-origins';
import { VariableInfoIssue } from 'editor/src/app/utils/variable-info-validator';

/** A variable of the unit that breaks the Verona contract, where it comes from, and why (#1129). */
export interface VariableInfoFinding {
  origin: VariableInfoOrigin;
  issues: VariableInfoIssue[];
  /**
   * Whether the author can fix it in the editor, which is the case wherever the alias is concerned. The id is not
   * editable since editor 2.6.0, while units saved before that may carry ids that break the contract: those are
   * reported, but do not hold back the variable list, which they would otherwise do forever (#1508).
   */
  isCorrectable: boolean;
}
