import { ElementComponent } from 'common/directives/element-component.directive';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TriggerElement, TriggerActionEvent } from 'common/models/elements/action-group-elements/trigger';

@Component({
  selector: 'aspect-trigger',
  templateUrl: './trigger.component.html',
  styleUrls: ['./trigger.component.scss'],
  standalone: false
})

export class TriggerComponent extends ElementComponent {
  @Input() elementModel!: TriggerElement;
  @Output() triggerActionEvent = new EventEmitter<TriggerActionEvent>();

  emitEvent(): void {
    if ((this.elementModel.action && this.elementModel.actionParam) ||
      this.elementModel.action === 'removeHighlights') {
      this.triggerActionEvent
        .emit({
          action: this.elementModel.action,
          param: this.elementModel.actionParam
        });
    }
  }
}
