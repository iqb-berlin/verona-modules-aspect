import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { WidgetCalcElement } from 'common/models/elements/widget-calc/widget-calc';
import { WidgetCalcCall } from 'common/interfaces';
import { ElementComponent } from '../../directives/element-component.directive';

@Component({
  selector: 'aspect-widget-calc',
  templateUrl: './widget-calc.component.html',
  styleUrls: ['./widget-calc.component.scss'],
  standalone: false
})
export class WidgetCalcComponent extends ElementComponent {
  @Input() elementModel!: WidgetCalcElement;
  @Output() widgetCallEvent = new EventEmitter<WidgetCalcCall>();

  emitWidgetCall(): void {
    const parameters: WidgetCalcCall = {
      mode: this.elementModel.mode,
      journalLines: this.elementModel.journalLines
    };
    this.widgetCallEvent.emit(parameters);
  }
}
