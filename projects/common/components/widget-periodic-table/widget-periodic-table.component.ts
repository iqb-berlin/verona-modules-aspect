import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { WidgetPeriodicTableElement } from 'common/models/elements/widgets/widget-periodic-table';
import { WidgetPeriodicTableCall } from 'common/interfaces';
import { ElementComponent } from '../../directives/element-component.directive';

@Component({
  selector: 'aspect-widget-periodic-table',
  templateUrl: './widget-periodic-table.component.html',
  styleUrls: ['./widget-periodic-table.component.scss'],
  standalone: false
})
export class WidgetPeriodicTableComponent extends ElementComponent {
  @Input() elementModel!: WidgetPeriodicTableElement;
  @Output() widgetCallEvent = new EventEmitter<WidgetPeriodicTableCall>();

  emitWidgetCall(): void {
    const parameters: WidgetPeriodicTableCall = {
      showInfoOrder: this.elementModel.showInfoOrder,
      showInfoENeg: this.elementModel.showInfoENeg,
      showInfoAMass: this.elementModel.showInfoAMass,
      closeOnSelection: this.elementModel.closeOnSelection,
      maxNumberOfSelections: this.elementModel.maxNumberOfSelections
    };
    this.widgetCallEvent.emit(parameters);
  }
}
