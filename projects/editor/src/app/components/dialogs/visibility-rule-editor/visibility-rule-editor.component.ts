import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { VisibilityRule, VisibilityRuleOperators } from 'common/models/visibility-rule';

@Component({
    selector: 'aspect-visibility-rule-editor',
    templateUrl: './visibility-rule-editor.component.html',
    standalone: false
})
export class VisibilityRuleEditorComponent {
  @Input() controlIds!: { id: string, alias: string }[];
  @Input() visibilityRule!: VisibilityRule;

  @Output() visibilityRuleChange = new EventEmitter<VisibilityRule>();
  protected readonly VisibilityRuleOperators = VisibilityRuleOperators;
}
