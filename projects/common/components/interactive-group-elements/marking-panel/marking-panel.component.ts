import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { MarkingPanelElement } from 'common/models/elements/interactive-group-elements/marking-panel';
import { MarkingPanelMarkingData } from 'common/models/marking-data';

@Component({
  selector: 'aspect-marking-panel',
  templateUrl: './marking-panel.component.html',
  standalone: false
})
export class MarkingPanelComponent extends ElementComponent {
  @Input() elementModel!: MarkingPanelElement;
  @Input() selectedColor!: string | undefined;
  @Input() markingMode!: 'selection' | 'word' | 'range';
  @Input() showHint!: boolean;
  @Output() markingPanelMarkingDataChanged: EventEmitter<MarkingPanelMarkingData> = new EventEmitter();
}
