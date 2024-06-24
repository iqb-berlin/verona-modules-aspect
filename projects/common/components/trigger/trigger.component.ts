import { ElementComponent } from 'common/directives/element-component.directive';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TriggerElement, TriggerActionEvent } from 'common/models/elements/trigger/trigger';

@Component({
  selector: 'aspect-trigger',
  template: `
    <div>
      <div *ngIf="project === 'editor'"
            class="hidden-trigger">
      </div>
    </div>
  `,
  styles: [`
    .hidden-trigger {
      height: 20px;
      background-image: linear-gradient(
        135deg, #fff 45%, #999 45%, #999 50%, #fff 50%, #fff 95%, #999 95%, #999 100%
      );
      background-size: 10px 10px;
      border: 1px solid #999;
    }
  `]
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
