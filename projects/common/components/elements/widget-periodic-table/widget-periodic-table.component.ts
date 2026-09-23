import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { WidgetPeriodicTableElement } from 'common/models/elements/widget-periodic-table';
import { WidgetPeriodicTableCall } from 'common/models/widget-interfaces';
import { ElementComponent } from 'common/directives/element-component.directive';

@Component({
  selector: 'aspect-widget-periodic-table',
  templateUrl: './widget-periodic-table.component.html',
  styleUrls: ['./widget-periodic-table.component.scss'],
  standalone: false
})
export class WidgetPeriodicTableComponent extends ElementComponent {
  @Input() elementModel!: WidgetPeriodicTableElement;
  @Output() widgetCallEvent = new EventEmitter<WidgetPeriodicTableCall>();
  WidgetPeriodicTableElement = WidgetPeriodicTableElement;

  emitWidgetCall(): void {
    const call: WidgetPeriodicTableCall = {
      parameters: {
        showInfoOrder: this.elementModel.showInfoOrder,
        showInfoName: this.elementModel.showInfoName,
        showInfoSymbol: this.elementModel.showInfoSymbol,
        showInfoENeg: this.elementModel.showInfoENeg,
        showInfoAMass: this.elementModel.showInfoAMass,
        showInfoLabels: this.elementModel.showInfoLabels,
        highlightBlocks: this.elementModel.highlightBlocks,
        closeOnSelection: this.elementModel.closeOnSelection,
        maxNumberOfSelections: this.elementModel.maxNumberOfSelections
      },
      sharedParameters: {
        ...(this.elementModel.fieldTextColor ? { textColor: this.elementModel.fieldTextColor } : {}),
        ...(this.elementModel.fieldBackgroundColor ?
          { backgroundColor: this.elementModel.fieldBackgroundColor } : {})
      }
    };
    this.widgetCallEvent.emit(call);
  }
}
