import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { VisibilityRule } from 'common/models/visibility-rule';

@Component({
  selector: 'aspect-visibility-rule-editor',
  templateUrl: './visibility-rule-editor.component.html'
})
export class VisibilityRuleEditorComponent {
  @Input() controlIds!: string[];
  @Input() visibilityRule!: VisibilityRule;

  @Output() visibilityRuleChange = new EventEmitter<VisibilityRule>();
  protected readonly VisibilityRule = VisibilityRule;
}
