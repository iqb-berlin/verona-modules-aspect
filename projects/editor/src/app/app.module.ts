import {
  DoBootstrap, ErrorHandler, Injector, NgModule
} from '@angular/core';
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
import {
  SectionInsertDialogComponent
} from 'editor/src/app/components/dialogs/section-insert-dialog/section-insert-dialog.component';
import { VeronaAPIService } from 'editor/src/app/services/verona-api.service';
import { MatRadioModule } from '@angular/material/radio';
import { HotspotEditDialogComponent } from 'editor/src/app/components/dialogs/hotspot-edit-dialog/hotspot-edit-dialog.component';
import { MathEditorModule } from 'common/math-editor/math-editor.module';
import { TextEditorModule } from 'editor/modules/text-editor/text-editor.module';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { UnitNavNextComponent } from 'common/components/unit-nav-next/unit-nav-next.component';
import { MarkingPanelComponent } from 'common/components/interactive-group/marking-panel/marking-panel.component';
import { ComponentRegistry } from 'common/utils/component-registry';
import {
  StateVariablesDialogComponent
} from 'editor/src/app/components/dialogs/state-variables-dialog/state-variables-dialog.component';
import {
  VisibilityRuleEditorComponent
} from 'editor/src/app/components/dialogs/visibility-rule-editor/visibility-rule-editor.component';
import {
  ShowStateVariablesButtonComponent
} from 'editor/src/app/components/show-state-variables-button/show-state-variables-button.component';
import {
  TextFieldElementPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/text-field-element-properties/text-field-element-properties.component';
import {
  ScaleAndZoomPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/scale-and-zoom-properties/scale-and-zoom-properties.component';
import {
  StateVariableEditorComponent
} from 'editor/src/app/components/state-variable-editor/state-variable-editor.component';
import { ActionParamStateVariableComponent } from
  'editor/src/app/components/properties-panel/model-properties-tab/action-param-state-variable/action-param-state-variable.component';
import {
  VisibilityRulesDialogComponent
} from 'editor/src/app/components/dialogs/visibility-rules-dialog/visibility-rules-dialog.component';

import { InputAssistancePropertiesComponent } from
  'editor/src/app/components/properties-panel/model-properties-tab/input-assistance-properties/input-assistance-properties.component';
import {
  TooltipPropertiesDialogComponent
} from 'editor/src/app/components/dialogs/tooltip-properties-dialog/tooltip-properties-dialog.component';
import {
  ActionPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/action-properties/action-properties.component';
import { GetStateVariablePipe } from 'editor/src/app/pipes/get-state-variable.pipe';
import { ScrollPageIndexPipe } from 'editor/src/app/pipes/scroll-page-index.pipe';
import { AppComponent } from 'editor/src/app/app.component';
import { ToolbarComponent } from 'editor/src/app/components/toolbar/toolbar.component';
import { UiElementToolboxComponent } from
  'editor/src/app/components/ui-element-toolbox/ui-element-toolbox.component';
import { UnitViewComponent } from 'editor/src/app/components/unit-view/unit-view/unit-view.component';
import { PageViewComponent } from 'editor/src/app/components/unit-view/page/page-view/page-view.component';
import { EditorTranslateLoader } from 'editor/src/app/classes/editor-translate-loader';
import { DeleteConfirmationDialogComponent } from 'editor/src/app/components/dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { TextEditDialogComponent } from 'editor/src/app/components/dialogs/text-edit-dialog/text-edit-dialog.component';
import { TextEditMultilineDialogComponent } from 'editor/src/app/components/dialogs/text-edit-multiline-dialog/text-edit-multiline-dialog.component';
import { PlayerEditDialogComponent } from 'editor/src/app/components/dialogs/player-edit-dialog/player-edit-dialog.component';
import { GetValidAudioVideoAliasAndIDsPipe } from 'editor/src/app/pipes/get-valid-audio-video-alias-and-ids.pipe';
import { LikertRowEditDialogComponent } from 'editor/src/app/components/dialogs/likert-row-edit-dialog/likert-row-edit-dialog.component';
import { RichTextEditDialogComponent } from 'editor/src/app/components/dialogs/rich-text-edit-dialog/rich-text-edit-dialog.component';
import { DropListOptionEditDialogComponent } from 'editor/src/app/components/dialogs/drop-list-option-edit-dialog/drop-list-option-edit-dialog.component';
import { PositionFieldSetComponent } from
  'editor/src/app/components/properties-panel/position-properties-tab/position-field-set/position-field-set.component';
import { DimensionFieldSetComponent } from
  'editor/src/app/components/properties-panel/position-properties-tab/dimension-field-set/dimension-field-set.component';
import { ElementPropertiesPanelComponent }
  from 'editor/src/app/components/properties-panel/element-properties-panel/element-properties-panel.component';
import { ElementPositionPropertiesComponent } from
  'editor/src/app/components/properties-panel/position-properties-tab/element-position-properties/element-position-properties.component';
import { ElementStylePropertiesComponent } from
  'editor/src/app/components/properties-panel/style-properties-tab/element-style-properties/element-style-properties.component';
import { ElementModelPropertiesComponent } from
  'editor/src/app/components/properties-panel/model-properties-tab/element-model-properties/element-model-properties.component';
import { IsInputElementPipe } from 'editor/src/app/pipes/is-input-element.pipe';
import { OptionsFieldSetComponent } from
  'editor/src/app/components/properties-panel/model-properties-tab/options-field-set/options-field-set.component';
import { SelectPropertiesComponent } from
  'editor/src/app/components/properties-panel/model-properties-tab/select-properties/select-properties.component';
import { InputElementPropertiesComponent } from
  'editor/src/app/components/properties-panel/model-properties-tab/input-element-properties/input-element-properties.component';
import { PresetValuePropertiesComponent } from
  'editor/src/app/components/properties-panel/model-properties-tab/preset-value-properties/preset-value-properties.component';
import { LikertRowLabelPipe } from 'editor/src/app/pipes/likert-row-label.pipe';
import { LabelEditDialogComponent } from 'editor/src/app/components/dialogs/label-edit-dialog/label-edit-dialog.component';
import { GeogebraAppDefinitionDialogComponent } from 'editor/src/app/components/dialogs/geogebra-app-definition-dialog/geogebra-app-definition-dialog.component';
import { SizeInputPanelComponent } from 'editor/src/app/components/size-input-panel/size-input-panel.component';
import { DeleteReferenceDialogComponent } from 'editor/src/app/components/dialogs/delete-reference-dialog/delete-reference-dialog.component';
import { SanitizationDialogComponent } from 'editor/src/app/components/dialogs/sanitization-dialog/sanitization-dialog.component';
import { OptionListPanelComponent } from 'editor/src/app/components/properties-panel/option-list-panel/option-list-panel.component';
import {
  EleSpecificPropsComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/ele-specific-props/ele-specific-props.component';
import { PageMenu } from 'editor/src/app/components/unit-view/page/page-menu/page-menu.component';
import { ImageResizeDialogComponent } from 'editor/src/app/components/dialogs/image-resize-dialog/image-resize-dialog.component';
import { BytesPipe } from 'editor/src/app/pipes/bytes.pipe';
import { SupportsQualityPipe } from 'editor/src/app/pipes/supports-quality.pipe';

import { ReferenceListComponent } from 'editor/src/app/components/reference-list/reference-list.component';
import { ElementListComponent } from 'editor/src/app/components/element-list/element-list.component';

import { SectionComponent } from 'editor/src/app/components/unit-view/section/section/section.component';
import { ErrorService } from 'editor/src/app/services/error.service';

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
    PageViewComponent,
    ElementPropertiesPanelComponent,
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
    GetStateVariablePipe,
    ScrollPageIndexPipe,
    DeleteReferenceDialogComponent,
    VisibilityRuleEditorComponent,
    StateVariablesDialogComponent,
    ShowStateVariablesButtonComponent,
    StateVariableEditorComponent,
    ActionParamStateVariableComponent,
    VisibilityRulesDialogComponent,
    SanitizationDialogComponent,
    TooltipPropertiesDialogComponent,
    GetValidAudioVideoAliasAndIDsPipe,
    InputAssistancePropertiesComponent,
    ImageResizeDialogComponent,
    BytesPipe,
    SupportsQualityPipe
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
    TextEditorModule,
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
    SectionComponent,
    UnitNavNextComponent
  ],
  providers: [
    {
      provide: APIService,
      useExisting: VeronaAPIService
    },
    {
      provide: ErrorHandler,
      useClass: ErrorService
    },
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: myCustomTooltipDefaults
    }
  ]
})

export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) {
    ComponentRegistry.registerComponent('marking-panel', MarkingPanelComponent);
  }

  ngDoBootstrap(): void {
    const editorElement = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define('aspect-editor', editorElement);
  }
}
