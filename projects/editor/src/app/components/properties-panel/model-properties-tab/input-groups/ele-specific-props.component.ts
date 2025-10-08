import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { NgIf } from '@angular/common';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel.component';
import {
  MathFieldPropsComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/input-groups/ele-specific/math-field-props.component';
import {
  MathTablePropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/input-groups/ele-specific/math-table-properties.component';
import {
  ButtonPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/input-groups/ele-specific/button-properties.component';
import {
  DropListPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/input-groups/ele-specific/drop-list-properties.component';
import {
  BorderPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/input-groups/ele-specific/border-properties.component';
import {
  GeometryPropsComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/input-groups/ele-specific/geometry-props.component';
import {
  HotspotPropsComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/input-groups/ele-specific/hotspot-props.component';
import {
  SliderPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/input-groups/ele-specific/slider-properties.component';
import {
  TextPropsComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/input-groups/ele-specific/text-properties-field-set.component';
import {
  TablePropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/input-groups/ele-specific/table-properties.component';
import {
  MarkingPanelPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/input-groups/ele-specific/marking-panel-properties.component';
import { UIElementValue } from 'common/interfaces';

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
        MarkingPanelPropertiesComponent
    ],
    template: `
    <aspect-math-field-props *ngIf="combinedProperties.type === 'math-field'"
                             [combinedProperties]="combinedProperties"
                             (updateModel)="updateModel.emit($event)">
    </aspect-math-field-props>

    <aspect-border-properties *ngIf="combinedProperties.type === 'frame'"
                              [combinedProperties]="combinedProperties"
                              (updateModel)="updateModel.emit($event)">
    </aspect-border-properties>

    <aspect-math-table-properties *ngIf="combinedProperties.type === 'math-table'"
                                  [combinedProperties]="combinedProperties"
                                  (updateModel)="updateModel.emit($event)">
    </aspect-math-table-properties>

    <aspect-button-properties *ngIf="combinedProperties.type === 'button'"
                              [combinedProperties]="combinedProperties"
                              (updateModel)="updateModel.emit($event)">
    </aspect-button-properties>

    <aspect-drop-list-properties [combinedProperties]="combinedProperties"
                                 (updateModel)="updateModel.emit($event)">
    </aspect-drop-list-properties>

    <aspect-geometry-props *ngIf="combinedProperties.type === 'geometry'"
                           [combinedProperties]="combinedProperties"
                           (updateModel)="updateModel.emit($event)">
    </aspect-geometry-props>

    <aspect-hotspot-props *ngIf="combinedProperties.type === 'hotspot-image'"
                              [combinedProperties]="combinedProperties"
                              (updateModel)="updateModel.emit($event)">
    </aspect-hotspot-props>

    <aspect-slider-properties [combinedProperties]="combinedProperties"
                              (updateModel)="updateModel.emit($event)">
    </aspect-slider-properties>

    <aspect-text-props *ngIf="combinedProperties.text !== undefined"
                       [combinedProperties]="combinedProperties"
                       (updateModel)="updateModel.emit($event)">
    </aspect-text-props>

    <aspect-marking-panel-properties [combinedProperties]="combinedProperties"
                                      (updateModel)="updateModel.emit($event)">
    </aspect-marking-panel-properties>

    <aspect-table-properties *ngIf="combinedProperties.type === 'table'"
                             [combinedProperties]="combinedProperties"
                             (updateModel)="updateModel.emit($event)"></aspect-table-properties>
  `
})
export class EleSpecificPropsComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: UIElementValue, isInputValid?: boolean | null }>();
}
