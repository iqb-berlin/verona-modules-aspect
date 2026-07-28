import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UIElementValue } from 'common/models/ui-element-interfaces';
import { WidgetMoleculeEditorProperties } from 'common/models/elements/widget-group-elements/widget-molecule-editor';
import { Merged } from 'editor/src/app/components/properties-panel/models/merged-properties';

@Component({
  selector: 'aspect-widget-molecule-editor-properties',
  standalone: false,
  templateUrl: './widget-molecule-editor-properties.component.html'
})
export class WidgetMoleculeEditorPropertiesComponent {
  @Input() combinedProperties!: Merged<WidgetMoleculeEditorProperties>;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: UIElementValue, isInputValid?: boolean | null }>();
}
