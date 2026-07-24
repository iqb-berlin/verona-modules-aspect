import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { NgIf } from '@angular/common';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel/element-properties-panel.component';
import { UIElementValue } from 'common/models/ui-element-interfaces';
import {
  MathTablePropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/math-table-properties/math-table-properties.component';
import {
  ButtonPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/button-properties/button-properties.component';
import {
  DropListPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/drop-list-properties/drop-list-properties.component';
import {
  BorderPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/border-properties/border-properties.component';
import {
  GeometryPropsComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/geometry-props/geometry-props.component';
import {
  HotspotPropsComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/hotspot-props/hotspot-props.component';
import {
  SliderPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/slider-properties/slider-properties.component';
import {
  TextPropsComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/text-properties-field-set/text-properties-field-set.component';
import {
  TablePropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/table-properties/table-properties.component';
import {
  MarkingPanelPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/marking-panel-properties/marking-panel-properties.component';
import {
  WidgetPeriodicTablePropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/widget-periodic-table-properties/widget-periodic-table-properties.component';
import {
  MathFieldPropsComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/math-field-props/math-field-props.component';
import {
  WidgetMoleculeEditorPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/widget-molecule-editor-properties/widget-molecule-editor-properties.component';

@Component({
  selector: 'aspect-ele-specific-props',
  imports: [
    NgIf,
    MathFieldPropsComponent,
    BorderPropertiesComponent,
    MathTablePropertiesComponent,
    ButtonPropertiesComponent,
    DropListPropertiesComponent,
    BorderPropertiesComponent,
    GeometryPropsComponent,
    HotspotPropsComponent,
    SliderPropertiesComponent,
    TextPropsComponent,
    TablePropertiesComponent,
    MarkingPanelPropertiesComponent,
    WidgetPeriodicTablePropertiesComponent,
    WidgetMoleculeEditorPropertiesComponent
  ],
  templateUrl: './ele-specific-props.component.html'
})
export class EleSpecificPropsComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: UIElementValue, isInputValid?: boolean | null }>();
}
