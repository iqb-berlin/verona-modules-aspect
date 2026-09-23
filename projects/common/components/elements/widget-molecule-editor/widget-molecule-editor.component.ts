import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { WidgetMoleculeEditorElement } from 'common/models/elements/widget-molecule-editor';
import { WidgetMoleculeEditorCall } from 'common/models/widget-interfaces';
import { ElementComponent } from 'common/directives/element-component.directive';

@Component({
  selector: 'aspect-widget-molecule-editor',
  templateUrl: './widget-molecule-editor.component.html',
  styleUrls: ['./widget-molecule-editor.component.scss'],
  standalone: false
})
export class WidgetMoleculeEditorComponent extends ElementComponent {
  @Input() elementModel!: WidgetMoleculeEditorElement;
  @Output() widgetCallEvent = new EventEmitter<WidgetMoleculeEditorCall>();
  WidgetMoleculeEditorElement = WidgetMoleculeEditorElement;

  emitWidgetCall(): void {
    const call: WidgetMoleculeEditorCall = {
      parameters: {
        showInfoName: this.elementModel.showInfoName,
        showInfoOrder: this.elementModel.showInfoOrder,
        highlightBlocks: this.elementModel.highlightBlocks
      },
      sharedParameters: {
        bondingType: this.elementModel.bondingType
      }
    };
    this.widgetCallEvent.emit(call);
  }
}
