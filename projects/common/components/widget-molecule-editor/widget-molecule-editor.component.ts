import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { WidgetMoleculeEditorElement } from 'common/models/elements/widget-molecule-editor/widget-molecule-editor';
import { WidgetMoleculeEditorCall } from 'common/interfaces';
import { ElementComponent } from '../../directives/element-component.directive';

@Component({
  selector: 'aspect-widget-molecule-editor',
  templateUrl: './widget-molecule-editor.component.html',
  styleUrls: ['./widget-molecule-editor.component.scss'],
  standalone: false
})
export class WidgetMoleculeEditorComponent extends ElementComponent {
  @Input() elementModel!: WidgetMoleculeEditorElement;
  @Output() widgetCallEvent = new EventEmitter<WidgetMoleculeEditorCall>();

  emitWidgetCall(): void {
    const parameters: WidgetMoleculeEditorCall = {
      bondingType: this.elementModel.bondingType
    };
    this.widgetCallEvent.emit(parameters);
  }
}
