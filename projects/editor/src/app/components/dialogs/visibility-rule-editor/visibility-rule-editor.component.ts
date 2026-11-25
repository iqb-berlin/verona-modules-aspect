import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import {
  VisibilityRule, VisibilityRuleOperators, VisibilityRuleOperatorsWithoutValue
} from 'common/models/visibility-rule';
import { VisibilityRuleTarget, VisibilityRuleTargets } from 'editor/src/app/utils/visibility-rule-targets';

@Component({
  selector: 'aspect-visibility-rule-editor',
  templateUrl: './visibility-rule-editor.component.html',
  styleUrls: ['./visibility-rule-editor.component.scss'],
  standalone: false
})
export class VisibilityRuleEditorComponent {
  @Input() controlIds!: VisibilityRuleTarget[];
  @Input() visibilityRule!: VisibilityRule;

  @Output() visibilityRuleChange = new EventEmitter<VisibilityRule>();
  protected readonly VisibilityRuleOperators = VisibilityRuleOperators;

  /** A rule keeps its operator while it suits the new element. One that does not -- the list greys it out --
      gives way to the first operator the element is offered, which asks for no value (#1718). */
  selectTarget(id: string): void {
    this.visibilityRule.id = id;
    const operators = VisibilityRuleTargets.operatorsFor(VisibilityRuleTargets.kindOf(id, this.controlIds));
    if (!operators.includes(this.visibilityRule.operator)) {
      this.visibilityRule.operator = operators[0];
      this.visibilityRule.value = '';
    }
    this.visibilityRuleChange.emit(this.visibilityRule);
  }

  /** An operator that compares nothing leaves no value behind in the rule. */
  selectOperator(operator: string): void {
    this.visibilityRule.operator = operator;
    if (VisibilityRuleOperatorsWithoutValue.includes(operator)) this.visibilityRule.value = '';
    this.visibilityRuleChange.emit(this.visibilityRule);
  }
}
