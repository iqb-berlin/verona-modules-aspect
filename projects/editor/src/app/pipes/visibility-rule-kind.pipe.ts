import { Pipe, PipeTransform } from '@angular/core';
import {
  VisibilityRuleAnswerKind, VisibilityRuleTarget, VisibilityRuleTargets
} from 'editor/src/app/utils/visibility-rule-targets';

@Pipe({
  name: 'visibilityRuleKind',
  standalone: false
})
export class VisibilityRuleKindPipe implements PipeTransform {
  /** The kind of answer of the element a rule refers to, by its id; `undefined` for an unknown one. */
  transform(id: string, targets: VisibilityRuleTarget[]): VisibilityRuleAnswerKind | undefined {
    return VisibilityRuleTargets.kindOf(id, targets);
  }
}
