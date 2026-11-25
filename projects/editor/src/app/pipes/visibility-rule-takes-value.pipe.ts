import { Pipe, PipeTransform } from '@angular/core';
import { VisibilityRuleOperatorsWithoutValue } from 'common/models/visibility-rule';

@Pipe({
  name: 'visibilityRuleTakesValue',
  standalone: false
})
export class VisibilityRuleTakesValuePipe implements PipeTransform {
  /** Whether a rule with this operator compares with a value, and so needs the value field. */
  transform(operator: string): boolean {
    return !VisibilityRuleOperatorsWithoutValue.includes(operator);
  }
}
