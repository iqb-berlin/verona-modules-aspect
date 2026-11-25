import { Component } from '@angular/core';
import { VisibilityRuleOperators, VisibilityRuleOperatorsWithoutValue } from 'common/models/visibility-rule';
import { VisibilityRuleAnswerKind, VisibilityRuleTargets } from 'editor/src/app/utils/visibility-rule-targets';

const KINDS: VisibilityRuleAnswerKind[] = [
  'text', 'mathField', 'textAreaMath', 'mathTable', 'option', 'checkbox', 'slider', 'dropList', 'hotspot', 'media',
  'image', 'marking', 'changedOnly', 'stateVariable'
];

/** One row of the help: a kind of answer and the comparing operators it is offered. */
interface HelpRow {
  kind: VisibilityRuleAnswerKind;
  canBeAnswered: boolean;
  comparing: string[];
  comparesAll: boolean;
}

/**
 * What a visibility rule compares with, element by element, and three examples (#1718). The comparing
 * operators of each row are taken from `VisibilityRuleTargets`, so the help cannot offer what the dialog
 * greys out.
 */
@Component({
  selector: 'aspect-visibility-rules-help',
  templateUrl: './visibility-rules-help.component.html',
  styleUrls: ['./visibility-rules-help.component.scss'],
  standalone: false
})
export class VisibilityRulesHelpComponent {
  readonly rows: HelpRow[] = KINDS.map(kind => {
    const operators = VisibilityRuleTargets.operatorsFor(kind);
    const comparing = operators.filter(operator => !VisibilityRuleOperatorsWithoutValue.includes(operator));
    return {
      kind,
      canBeAnswered: operators.includes('answered'),
      comparing,
      comparesAll: comparing.length === VisibilityRuleOperators.length - VisibilityRuleOperatorsWithoutValue.length
    };
  });
}
