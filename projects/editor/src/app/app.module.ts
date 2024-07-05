import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { createCustomElement } from '@angular/elements';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NgxTiptapModule } from 'ngx-tiptap';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { APIService, SharedModule } from 'common/shared.module';
import { SectionInsertDialogComponent } from 'editor/src/app/components/dialogs/section-insert-dialog.component';
import { VeronaAPIService } from 'editor/src/app/services/verona-api.service';
import { MatRadioModule } from '@angular/material/radio';
import { HotspotEditDialogComponent } from 'editor/src/app/components/dialogs/hotspot-edit-dialog.component';
import { MathEditorModule } from 'common/math-editor.module';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
  StateVariablesDialogComponent
} from 'editor/src/app/components/dialogs/state-variables-dialog/state-variables-dialog.component';
import {
  VisibilityRuleEditorComponent
} from 'editor/src/app/components/dialogs/visibility-rules-dialog/visibility-rule-editor.component';
import {
  ShowStateVariablesButtonComponent
} from 'editor/src/app/components/new-ui-element-panel/show-state-variables-button.component';
import {
  TextFieldElementPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/input-groups/text-field-element-properties.component';
import {
  ScaleAndZoomPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/input-groups/scale-and-zoom-properties.component';
import {
  StateVariableEditorComponent
} from 'editor/src/app/components/dialogs/state-variables-dialog/state-variable-editor.component';
import { ActionParamStateVariableComponent } from
  'editor/src/app/components/properties-panel/model-properties-tab/input-groups/action-param-state-variable.component';
import {
  VisibilityRulesDialogComponent
} from 'editor/src/app/components/dialogs/visibility-rules-dialog/visibility-rules-dialog.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { InputAssistancePropertiesComponent } from
  'editor/src/app/components/properties-panel/model-properties-tab/input-groups/input-assistance-properties.component';
import {
  TooltipPropertiesDialogComponent
} from 'editor/src/app/components/dialogs/tooltip-properties-dialog.component';
import {
  ActionPropertiesComponent, GetAnchorIdsPipe, GetStateVariableIdsPipe, GetStateVariablePipe, ScrollPageIndexPipe
} from 'editor/src/app/components/properties-panel/model-properties-tab/input-groups/action-properties.component';
import { AppComponent } from './app.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { UiElementToolboxComponent } from
  './components/new-ui-element-panel/ui-element-toolbox.component';
import { UnitViewComponent } from './components/unit-view/unit-view.component';
import { CanvasComponent } from 'editor/src/app/components/unit-view/page/canvas.component';
import { StaticCanvasOverlayComponent } from
  'editor/src/app/components/unit-view/element-overlay/static-canvas-overlay.component';
import { DynamicCanvasOverlayComponent } from
  'editor/src/app/components/unit-view/element-overlay/dynamic-canvas-overlay.component';
import { EditorTranslateLoader } from './editor-translate-loader';
import {
  SectionMenuComponent
} from 'editor/src/app/components/unit-view/page/section-menu.component';
import { SectionStaticComponent } from 'editor/src/app/components/unit-view/section/section-static.component';
import { SectionDynamicComponent } from 'editor/src/app/components/unit-view/section/section-dynamic.component';
import { RichTextEditorComponent } from './text-editor/rich-text-editor.component';
import { DeleteConfirmationDialogComponent } from './components/dialogs/delete-confirmation-dialog.component';
import { TextEditDialogComponent } from './components/dialogs/text-edit-dialog.component';
import { TextEditMultilineDialogComponent } from './components/dialogs/text-edit-multiline-dialog.component';
import {
  GetValidAudioVideoIDsPipe,
  PlayerEditDialogComponent
} from './components/dialogs/player-edit-dialog.component';
import { LikertRowEditDialogComponent } from './components/dialogs/likert-row-edit-dialog.component';
import { RichTextEditDialogComponent } from './components/dialogs/rich-text-edit-dialog.component';
import { DropListOptionEditDialogComponent } from './components/dialogs/drop-list-option-edit-dialog.component';

import { ToggleButtonNodeviewComponent } from './text-editor/angular-node-views/toggle-button-nodeview.component';
import { TextFieldNodeviewComponent } from './text-editor/angular-node-views/text-field-nodeview.component';
import { DropListNodeviewComponent } from './text-editor/angular-node-views/drop-list-nodeview.component';
import { ButtonNodeviewComponent } from './text-editor/angular-node-views/button-nodeview.component';
import { PositionFieldSetComponent } from
  './components/properties-panel/position-properties-tab/input-groups/position-field-set.component';
import { DimensionFieldSetComponent } from
  './components/properties-panel/position-properties-tab/input-groups/dimension-field-set.component';
import { ElementPropertiesPanelComponent }
  from './components/properties-panel/element-properties-panel.component';
import { ElementPositionPropertiesComponent } from
  './components/properties-panel/position-properties-tab/element-position-properties.component';
import { ElementStylePropertiesComponent } from
  './components/properties-panel/style-properties-tab/element-style-properties.component';
import { ElementModelPropertiesComponent, IsInputElementPipe } from
  './components/properties-panel/model-properties-tab/element-model-properties.component';
import { OptionsFieldSetComponent } from
  './components/properties-panel/model-properties-tab/input-groups/options-field-set.component';
import { SelectPropertiesComponent } from
  './components/properties-panel/model-properties-tab/input-groups/select-properties.component';
import { InputElementPropertiesComponent } from
  './components/properties-panel/model-properties-tab/input-groups/input-element-properties.component';
import { PresetValuePropertiesComponent } from
  './components/properties-panel/model-properties-tab/input-groups/preset-value-properties.component';
import { LikertRowLabelPipe } from './components/properties-panel/likert-row-label.pipe';
import { LabelEditDialogComponent } from './components/dialogs/label-edit-dialog.component';
import { GeogebraAppDefinitionDialogComponent } from './components/dialogs/geogebra-app-definition-dialog.component';
import { SizeInputPanelComponent } from './components/util/size-input-panel.component';
import { ComboButtonComponent } from './components/util/combo-button.component';
import { DeleteReferenceDialogComponent } from './components/dialogs/delete-reference-dialog.component';
import { SanitizationDialogComponent } from './components/dialogs/sanitization-dialog.component';
import { CheckboxNodeviewComponent } from './text-editor/angular-node-views/checkbox-nodeview.component';
import { OptionListPanelComponent } from 'editor/src/app/components/properties-panel/option-list-panel.component';
import {
  EleSpecificPropsComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/input-groups/ele-specific-props.component';
import { PageMenu } from 'editor/src/app/components/unit-view/page-menu.component';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions } from '@angular/material/tooltip';
import { ReferenceListComponent } from 'editor/src/app/components/reference-list.component';
import { ElementListComponent } from 'editor/src/app/components/element-list.component';
import { MeasurePipe } from 'common/pipes/measure.pipe';
import { SectionComponent } from 'editor/src/app/components/unit-view/section/section.component';
import { RadioWizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/radio.dialog.component';
import { TextWizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/text.dialog.component';
import { LikertWizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/likert.dialog.component';
import { InputWizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/input.dialog.component';

/** Custom options the configure the tooltip's default show/hide delays. */
export const myCustomTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 400,
  hideDelay: 0,
  touchendHideDelay: 0,
  position: 'above'
};

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    UiElementToolboxComponent,
    UnitViewComponent,
    CanvasComponent,
    ElementPropertiesPanelComponent,
    RichTextEditorComponent,
    ToggleButtonNodeviewComponent,
    TextFieldNodeviewComponent,
    CheckboxNodeviewComponent,
    DropListNodeviewComponent,
    ButtonNodeviewComponent,
    ElementStylePropertiesComponent,
    ElementPositionPropertiesComponent,
    DeleteConfirmationDialogComponent,
    TextEditDialogComponent,
    TextEditMultilineDialogComponent,
    PlayerEditDialogComponent,
    LikertRowEditDialogComponent,
    RichTextEditDialogComponent,
    HotspotEditDialogComponent,
    ElementModelPropertiesComponent,
    DropListOptionEditDialogComponent,
    PositionFieldSetComponent,
    DimensionFieldSetComponent,
    OptionsFieldSetComponent,
    ActionPropertiesComponent,
    TextFieldElementPropertiesComponent,
    ScaleAndZoomPropertiesComponent,
    SectionInsertDialogComponent,
    SelectPropertiesComponent,
    InputElementPropertiesComponent,
    PresetValuePropertiesComponent,
    LikertRowLabelPipe,
    LabelEditDialogComponent,
    GeogebraAppDefinitionDialogComponent,
    GetAnchorIdsPipe,
    GetStateVariablePipe,
    ScrollPageIndexPipe,
    ComboButtonComponent,
    DeleteReferenceDialogComponent,
    VisibilityRuleEditorComponent,
    StateVariablesDialogComponent,
    ShowStateVariablesButtonComponent,
    StateVariableEditorComponent,
    ActionParamStateVariableComponent,
    GetStateVariableIdsPipe,
    VisibilityRulesDialogComponent,
    SanitizationDialogComponent,
    TooltipPropertiesDialogComponent,
    GetValidAudioVideoIDsPipe,
    InputAssistancePropertiesComponent,
    RadioWizardDialogComponent,
    TextWizardDialogComponent,
    LikertWizardDialogComponent,
    InputWizardDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    SharedModule,
    MatInputModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatSelectModule,
    MatToolbarModule,
    MatMenuModule,
    MatSliderModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatSidenavModule,
    MatDividerModule,
    NgxTiptapModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: EditorTranslateLoader
      }
    }),
    MatListModule,
    MatRadioModule,
    MathEditorModule,
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    MatBadgeModule,
    IsInputElementPipe,
    OptionListPanelComponent,
    EleSpecificPropsComponent,
    PageMenu,
    ReferenceListComponent,
    ElementListComponent,
    SizeInputPanelComponent,
    MeasurePipe,
    SectionComponent
  ],
  providers: [
    { provide: APIService, useExisting: VeronaAPIService },
    {provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: myCustomTooltipDefaults}
  ]
})

export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) {}
  ngDoBootstrap(): void {
    const editorElement = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define('aspect-editor', editorElement);
  }
}
