import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UIElementValue } from 'common/models/ui-element-interfaces';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel/element-properties-panel.component';

@Component({
  selector: 'aspect-widget-molecule-editor-properties',
  standalone: false,
  templateUrl: './widget-molecule-editor-properties.component.html'
})
export class WidgetMoleculeEditorPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: UIElementValue, isInputValid?: boolean | null }>();
}
