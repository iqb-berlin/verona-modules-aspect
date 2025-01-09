import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { MarkingPanelElement } from 'common/models/elements/text/marking-panel';
import { SharedModule } from 'common/shared.module';
import { MarkingPanelMarkingData } from 'common/models/marking-data';

@Component({
  selector: 'aspect-marking-panel',
  standalone: true,
  imports: [
    SharedModule
  ],
  template: `
    <aspect-text-marking-bar [elementModel]="elementModel"
                             [selectedColor]="selectedColor || 'none'"
                             [hasDeleteButton]="hasDeleteButton"
                             [showHint]="showHint"
                             (markingDataChanged)="markingPanelMarkingDataChanged.emit({ id: elementModel.id,
                                                                                         markingData: $event })">
    </aspect-text-marking-bar>
  `,
  styles: []
})
export class MarkingPanelComponent extends ElementComponent {
  @Input() elementModel!: MarkingPanelElement;
  @Input() selectedColor!: string | undefined;
  @Input() hasDeleteButton!: boolean;
  @Input() showHint!: boolean;
  @Output() markingPanelMarkingDataChanged: EventEmitter<MarkingPanelMarkingData> = new EventEmitter();
}
