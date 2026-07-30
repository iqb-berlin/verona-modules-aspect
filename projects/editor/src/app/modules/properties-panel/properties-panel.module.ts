import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'common/shared.module';
import { MathEditorModule } from 'common/modules/math-editor/math-editor.module';
import { EditorSharedModule } from 'editor/modules/editor-shared/editor-shared.module';
import { MergedCheckboxComponent } from './components/merged-checkbox/merged-checkbox.component';
import {
  ActionParamStateVariableComponent
} from './components/model-properties-tab/action-param-state-variable/action-param-state-variable.component';
import {
  ActionPropertiesComponent
} from './components/model-properties-tab/action-properties/action-properties.component';
import {
  BorderPropertiesComponent
} from './components/model-properties-tab/border-properties/border-properties.component';
import {
  ButtonPropertiesComponent
} from './components/model-properties-tab/button-properties/button-properties.component';
import {
  CheckboxPropertiesComponent
} from './components/model-properties-tab/checkbox-properties/checkbox-properties.component';
import { DimensionFieldSetComponent } from './components/dimension-field-set/dimension-field-set.component';
import {
  DropListPropertiesComponent
} from './components/model-properties-tab/drop-list-properties/drop-list-properties.component';
import {
  EleSpecificPropsComponent
} from './components/model-properties-tab/ele-specific-props/ele-specific-props.component';
import {
  ElementModelPropertiesComponent
} from './components/model-properties-tab/element-model-properties/element-model-properties.component';
import {
  ElementPositionPropertiesComponent
} from './components/element-position-properties/element-position-properties.component';
import {
  ElementPropertiesPanelComponent
} from './components/element-properties-panel/element-properties-panel.component';
import {
  ElementStylePropertiesComponent
} from './components/element-style-properties/element-style-properties.component';
import {
  FirstColumnRatioPropertiesComponent
} from './components/model-properties-tab/first-column-ratio-properties/first-column-ratio-properties.component';
import { GeometryPropsComponent } from './components/model-properties-tab/geometry-props/geometry-props.component';
import { GetStateVariablePipe } from './pipes/get-state-variable.pipe';
import { GetValidDropListsPipe } from './pipes/get-valid-drop-lists.pipe';
import {
  HighlightPropertiesComponent
} from './components/model-properties-tab/highlight-properties/highlight-properties.component';
import { HotspotPropsComponent } from './components/model-properties-tab/hotspot-props/hotspot-props.component';
import {
  InputAssistancePropertiesComponent
} from './components/model-properties-tab/input-assistance-properties/input-assistance-properties.component';
import {
  InputElementPropertiesComponent
} from './components/model-properties-tab/input-element-properties/input-element-properties.component';
import { IsInputElementPipe } from './pipes/is-input-element.pipe';
import { LikertRowLabelPipe } from './pipes/likert-row-label.pipe';
import {
  MarkingPanelPropertiesComponent
} from './components/model-properties-tab/marking-panel-properties/marking-panel-properties.component';
import { MathFieldPropsComponent } from './components/model-properties-tab/math-field-props/math-field-props.component';
import {
  MathKeyboardPropertiesComponent
} from './components/model-properties-tab/math-keyboard-properties/math-keyboard-properties.component';
import {
  MathTablePropertiesComponent
} from './components/model-properties-tab/math-table-properties/math-table-properties.component';
import {
  MediaSourcePropertiesComponent
} from './components/model-properties-tab/media-source-properties/media-source-properties.component';
import {
  MultiLineTextPropertiesComponent
} from './components/model-properties-tab/multi-line-text-properties/multi-line-text-properties.component';
import {
  OptionsFieldSetComponent
} from './components/model-properties-tab/options-field-set/options-field-set.component';
import { PositionFieldSetComponent } from './components/position-field-set/position-field-set.component';
import {
  PresetValuePropertiesComponent
} from './components/model-properties-tab/preset-value-properties/preset-value-properties.component';
import {
  ScaleAndZoomPropertiesComponent
} from './components/model-properties-tab/scale-and-zoom-properties/scale-and-zoom-properties.component';
import { ScrollPageIndexPipe } from './pipes/scroll-page-index.pipe';
import {
  SelectPropertiesComponent
} from './components/model-properties-tab/select-properties/select-properties.component';
import {
  SliderPropertiesComponent
} from './components/model-properties-tab/slider-properties/slider-properties.component';
import {
  StickyHeaderPropertiesComponent
} from './components/model-properties-tab/sticky-header-properties/sticky-header-properties.component';
import {
  TablePropertiesComponent
} from './components/model-properties-tab/table-properties/table-properties.component';
import {
  TextFieldElementPropertiesComponent
} from './components/model-properties-tab/text-field-element-properties/text-field-element-properties.component';
import {
  TextPropsComponent
} from './components/model-properties-tab/text-properties-field-set/text-properties-field-set.component';
import {
  WidgetMoleculeEditorPropertiesComponent
  // eslint-disable-next-line max-len -- the longest component name in the deepest folder, one char over
} from './components/model-properties-tab/widget-molecule-editor-properties/widget-molecule-editor-properties.component';
import {
  WidgetPeriodicTablePropertiesComponent
} from './components/model-properties-tab/widget-periodic-table-properties/widget-periodic-table-properties.component';

/**
 * The element properties panel of the editor — the inspector beside the unit view.
 *
 * Only ElementPropertiesPanelComponent is exported. The other 35 components are internal to
 * this module on purpose: the panel's structure can then be reworked without checking the rest of
 * the editor for usages. The five pipes are used by this module's templates only.
 *
 * This module deliberately lives under src/app rather than under editor/modules/. It is not a
 * self-contained unit — its components reach for the editor's root-provided services
 * (UnitService, SelectionService, ElementService, DialogService and three more) in around 50
 * places. Under editor/modules/ it would claim the independence that the player modules actually
 * have, all of which import nothing from src/app. What this module provides is encapsulation, not
 * independence. Precedent for an NgModule inside src/app: player's page-label.module.ts.
 *
 * Leaf controls that other feature areas need too live in EditorSharedModule.
 */
@NgModule({
  declarations: [
    MergedCheckboxComponent,
    ActionParamStateVariableComponent,
    ActionPropertiesComponent,
    BorderPropertiesComponent,
    ButtonPropertiesComponent,
    CheckboxPropertiesComponent,
    DimensionFieldSetComponent,
    DropListPropertiesComponent,
    EleSpecificPropsComponent,
    ElementModelPropertiesComponent,
    ElementPositionPropertiesComponent,
    ElementPropertiesPanelComponent,
    ElementStylePropertiesComponent,
    FirstColumnRatioPropertiesComponent,
    GeometryPropsComponent,
    HighlightPropertiesComponent,
    HotspotPropsComponent,
    InputAssistancePropertiesComponent,
    InputElementPropertiesComponent,
    MarkingPanelPropertiesComponent,
    MathFieldPropsComponent,
    MathKeyboardPropertiesComponent,
    MathTablePropertiesComponent,
    MediaSourcePropertiesComponent,
    MultiLineTextPropertiesComponent,
    OptionsFieldSetComponent,
    PositionFieldSetComponent,
    PresetValuePropertiesComponent,
    ScaleAndZoomPropertiesComponent,
    SelectPropertiesComponent,
    SliderPropertiesComponent,
    StickyHeaderPropertiesComponent,
    TablePropertiesComponent,
    TextFieldElementPropertiesComponent,
    TextPropsComponent,
    WidgetMoleculeEditorPropertiesComponent,
    WidgetPeriodicTablePropertiesComponent,
    GetStateVariablePipe,
    GetValidDropListsPipe,
    IsInputElementPipe,
    LikertRowLabelPipe,
    ScrollPageIndexPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatSelectModule,
    MatSliderModule,
    MatTabsModule,
    MatTooltipModule,
    TranslateModule,
    SharedModule,
    MathEditorModule,
    EditorSharedModule
  ],
  exports: [
    ElementPropertiesPanelComponent
  ]
})
export class PropertiesPanelModule { }
