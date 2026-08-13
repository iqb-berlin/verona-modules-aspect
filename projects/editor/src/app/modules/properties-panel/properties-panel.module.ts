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
} from './components/element-model-properties/action-param-state-variable/action-param-state-variable.component';
import {
  ActionPropertiesComponent
} from './components/element-model-properties/action-properties/action-properties.component';
import {
  BorderPropertiesComponent
} from './components/element-model-properties/border-properties/border-properties.component';
import {
  ButtonPropertiesComponent
} from './components/element-model-properties/button-properties/button-properties.component';
import {
  CheckboxPropertiesComponent
} from './components/element-model-properties/checkbox-properties/checkbox-properties.component';
import {
  ClozePropertiesComponent
} from './components/element-model-properties/cloze-properties/cloze-properties.component';
import { DimensionFieldSetComponent } from './components/dimension-field-set/dimension-field-set.component';
import {
  DropListPropertiesComponent
} from './components/element-model-properties/drop-list-properties/drop-list-properties.component';
import {
  EleSpecificPropsComponent
} from './components/element-model-properties/ele-specific-props/ele-specific-props.component';
import {
  UIElementPropertiesComponent
} from './components/element-model-properties/ui-element-properties/ui-element-properties.component';
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
} from './components/element-model-properties/first-column-ratio-properties/first-column-ratio-properties.component';
import { GeometryPropsComponent } from './components/element-model-properties/geometry-props/geometry-props.component';
import { GetStateVariablePipe } from './pipes/get-state-variable.pipe';
import { GetValidDropListsPipe } from './pipes/get-valid-drop-lists.pipe';
import {
  HighlightPropertiesComponent
} from './components/element-model-properties/highlight-properties/highlight-properties.component';
import { HotspotPropsComponent } from './components/element-model-properties/hotspot-props/hotspot-props.component';
import {
  InputAssistancePropertiesComponent
} from './components/element-model-properties/input-assistance-properties/input-assistance-properties.component';
import {
  InputElementPropertiesComponent
} from './components/element-model-properties/input-element-properties/input-element-properties.component';
import { LikertRowLabelPipe } from './pipes/likert-row-label.pipe';
import { LimitEnabledStatePipe } from './pipes/limit-enabled-state.pipe';
import {
  MarkingPanelPropertiesComponent
} from './components/element-model-properties/marking-panel-properties/marking-panel-properties.component';
import {
  MathFieldPropsComponent
} from './components/element-model-properties/math-field-props/math-field-props.component';
import {
  MathKeyboardPropertiesComponent
} from './components/element-model-properties/math-keyboard-properties/math-keyboard-properties.component';
import {
  MathTablePropertiesComponent
} from './components/element-model-properties/math-table-properties/math-table-properties.component';
import {
  MediaSourcePropertiesComponent
} from './components/element-model-properties/media-source-properties/media-source-properties.component';
import {
  MultiLineTextPropertiesComponent
} from './components/element-model-properties/multi-line-text-properties/multi-line-text-properties.component';
import {
  OptionsFieldSetComponent
} from './components/element-model-properties/options-field-set/options-field-set.component';
import { PositionFieldSetComponent } from './components/position-field-set/position-field-set.component';
import { PresetOptionTextPipe } from './pipes/preset-option-text.pipe';
import {
  PresetValuePropertiesComponent
} from './components/element-model-properties/preset-value-properties/preset-value-properties.component';
import {
  ImagePropertiesComponent
} from './components/element-model-properties/image-properties/image-properties.component';
import { PropertyDivergesPipe } from './pipes/property-diverges.pipe';
import { HasAnyPropertyPipe } from './pipes/has-any-property.pipe';
import { ScrollPageIndexPipe } from './pipes/scroll-page-index.pipe';
import {
  SelectPropertiesComponent
} from './components/element-model-properties/select-properties/select-properties.component';
import {
  SliderPropertiesComponent
} from './components/element-model-properties/slider-properties/slider-properties.component';
import {
  StandardDimensionPropertiesComponent
  // eslint-disable-next-line max-len -- longest component name in the deepest folder, two chars over
} from './components/element-model-properties/standard-dimension-properties/standard-dimension-properties.component';
import {
  StickyHeaderPropertiesComponent
} from './components/element-model-properties/sticky-header-properties/sticky-header-properties.component';
import {
  TablePropertiesComponent
} from './components/element-model-properties/table-properties/table-properties.component';
import {
  TextFieldElementPropertiesComponent
} from './components/element-model-properties/text-field-element-properties/text-field-element-properties.component';
import {
  TextPropsComponent
} from './components/element-model-properties/text-properties-field-set/text-properties-field-set.component';
import {
  WidgetMoleculeEditorPropertiesComponent
  // eslint-disable-next-line max-len -- the longest component name in the deepest folder, one char over
} from './components/element-model-properties/widget-molecule-editor-properties/widget-molecule-editor-properties.component';
import {
  WidgetPeriodicTablePropertiesComponent
  // eslint-disable-next-line max-len -- deepest folder plus longest component name, three chars over
} from './components/element-model-properties/widget-periodic-table-properties/widget-periodic-table-properties.component';

/**
 * The element properties panel of the editor — the inspector beside the unit view.
 *
 * Only ElementPropertiesPanelComponent is exported. The other 37 components are internal to
 * this module on purpose: the panel's structure can then be reworked without checking the rest of
 * the editor for usages. The seven pipes are used by this module's templates only.
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
    ClozePropertiesComponent,
    DimensionFieldSetComponent,
    DropListPropertiesComponent,
    EleSpecificPropsComponent,
    ElementPositionPropertiesComponent,
    ElementPropertiesPanelComponent,
    ElementStylePropertiesComponent,
    FirstColumnRatioPropertiesComponent,
    GeometryPropsComponent,
    HighlightPropertiesComponent,
    HotspotPropsComponent,
    ImagePropertiesComponent,
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
    SelectPropertiesComponent,
    SliderPropertiesComponent,
    StandardDimensionPropertiesComponent,
    StickyHeaderPropertiesComponent,
    TablePropertiesComponent,
    TextFieldElementPropertiesComponent,
    TextPropsComponent,
    UIElementPropertiesComponent,
    WidgetMoleculeEditorPropertiesComponent,
    WidgetPeriodicTablePropertiesComponent,
    GetStateVariablePipe,
    GetValidDropListsPipe,
    LikertRowLabelPipe,
    LimitEnabledStatePipe,
    PresetOptionTextPipe,
    PropertyDivergesPipe,
    HasAnyPropertyPipe,
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
