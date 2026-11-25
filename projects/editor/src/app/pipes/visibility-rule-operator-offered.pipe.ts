import { Pipe, PipeTransform } from '@angular/core';
import { VisibilityRuleAnswerKind, VisibilityRuleTargets } from 'editor/src/app/utils/visibility-rule-targets';

@Pipe({
  name: 'visibilityRuleOperatorOffered',
  standalone: false
})
export class VisibilityRuleOperatorOfferedPipe implements PipeTransform {
  /** Whether the operator suits the kind of answer; the dialog greys out the others (#1718). */
  transform(operator: string, kind: VisibilityRuleAnswerKind | undefined): boolean {
    return VisibilityRuleTargets.operatorsFor(kind).includes(operator);
  }
}
