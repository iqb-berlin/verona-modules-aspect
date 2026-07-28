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
import {
  HotspotEditDialogComponent
} from 'editor/src/app/components/dialogs/hotspot-edit-dialog/hotspot-edit-dialog.component';
import { MathEditorModule } from 'common/modules/math-editor/math-editor.module';
import { RichTextEditorModule } from 'editor/modules/rich-text-editor/rich-text-editor.module';
import { SectionTemplatesModule } from 'editor/modules/section-templates/section-templates.module';
import { EditorSharedModule } from 'editor/modules/editor-shared/editor-shared.module';
import {
  PropertiesPanelModule
} from 'editor/src/app/components/properties-panel/properties-panel.module';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import {
  MarkingPanelComponent
} from 'common/components/interactive-group-elements/marking-panel/marking-panel.component';
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
  StateVariableEditorComponent
} from 'editor/src/app/components/state-variable-editor/state-variable-editor.component';
import {
  VisibilityRulesDialogComponent
} from 'editor/src/app/components/dialogs/visibility-rules-dialog/visibility-rules-dialog.component';

import {
  TooltipPropertiesDialogComponent
} from 'editor/src/app/components/dialogs/tooltip-properties-dialog/tooltip-properties-dialog.component';
import { AppComponent } from 'editor/src/app/app.component';
import { ToolbarComponent } from 'editor/src/app/components/toolbar/toolbar.component';
import { UiElementToolboxComponent } from
  'editor/src/app/components/ui-element-toolbox/ui-element-toolbox.component';
import { UnitViewComponent } from 'editor/src/app/components/unit-view/unit-view.component';
import { PageViewComponent } from 'editor/src/app/components/page-view/page-view.component';
import { EditorTranslateLoader } from 'editor/src/app/classes/editor-translate-loader';
import {
  DeleteConfirmationDialogComponent
} from 'editor/src/app/components/dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { TextEditDialogComponent } from 'editor/src/app/components/dialogs/text-edit-dialog/text-edit-dialog.component';
import {
  TextEditMultilineDialogComponent
} from 'editor/src/app/components/dialogs/text-edit-multiline-dialog/text-edit-multiline-dialog.component';
import {
  PlayerEditDialogComponent
} from 'editor/src/app/components/dialogs/player-edit-dialog/player-edit-dialog.component';
import { GetValidAudioVideoAliasAndIDsPipe } from 'editor/src/app/pipes/get-valid-audio-video-alias-and-ids.pipe';
import {
  LikertRowEditDialogComponent
} from 'editor/src/app/components/dialogs/likert-row-edit-dialog/likert-row-edit-dialog.component';
import {
  RichTextEditDialogComponent
} from 'editor/src/app/components/dialogs/rich-text-edit-dialog/rich-text-edit-dialog.component';
import {
  DropListOptionEditDialogComponent
} from 'editor/src/app/components/dialogs/drop-list-option-edit-dialog/drop-list-option-edit-dialog.component';
import {
  LabelEditDialogComponent
} from 'editor/src/app/components/dialogs/label-edit-dialog/label-edit-dialog.component';
import {
  GeogebraAppDefinitionDialogComponent
} from 'editor/src/app/components/dialogs/geogebra-app-definition-dialog/geogebra-app-definition-dialog.component';
import {
  DeleteReferenceDialogComponent
} from 'editor/src/app/components/dialogs/delete-reference-dialog/delete-reference-dialog.component';
import {
  SanitizationDialogComponent
} from 'editor/src/app/components/dialogs/sanitization-dialog/sanitization-dialog.component';
import { PageMenu } from 'editor/src/app/components/page-menu/page-menu.component';
import {
  ImageResizeDialogComponent
} from 'editor/src/app/components/dialogs/image-resize-dialog/image-resize-dialog.component';
import { BytesPipe } from 'editor/src/app/pipes/bytes.pipe';
import { SupportsQualityPipe } from 'editor/src/app/pipes/supports-quality.pipe';

import { ReferenceListComponent } from 'editor/src/app/components/reference-list/reference-list.component';
import { ElementListComponent } from 'editor/src/app/components/element-list/element-list.component';

import { SectionComponent } from 'editor/src/app/components/section/section.component';
import { ErrorService } from 'editor/src/app/services/error.service';
import {
  IDEditDialogComponent
} from 'editor/src/app/components/dialogs/id-edit-dialog/id-edit-dialog.component';
import {
  OverviewDialogComponent
} from 'editor/src/app/components/dialogs/overview-dialog/overview-dialog.component';
import {
  TableEditDialogComponent
} from 'editor/src/app/components/dialogs/table-edit-dialog/table-edit-dialog.component';
import {
  DynamicOverlayComponent
} from 'editor/src/app/components/dynamic-overlay/dynamic-overlay.component';
import {
  DynamicSectionComponent
} from 'editor/src/app/components/dynamic-section/dynamic-section.component';
import {
  DynamicSectionHelperGridComponent
} from 'editor/src/app/components/dynamic-section-helper-grid/dynamic-section-helper-grid.component';
import {
  FixedReferencesSnackbarComponent
} from 'editor/src/app/components/fixed-references-snackbar/fixed-references-snackbar.component';
import {
  ReferenceListSnackbarComponent
} from 'editor/src/app/components/reference-list-snackbar/reference-list-snackbar.component';
import { SectionMenuComponent } from 'editor/src/app/components/section-menu/section-menu.component';
import {
  StaticOverlayComponent
} from 'editor/src/app/components/static-overlay/static-overlay.component';
import {
  StaticSectionComponent
} from 'editor/src/app/components/static-section/static-section.component';
import {
  UnexpectedErrorComponent
} from 'editor/src/app/components/unexpected-error/unexpected-error.component';
import {
  ElementGridChangeListenerDirective
} from 'editor/src/app/directives/element-grid-change-listener.directive';

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
    DeleteConfirmationDialogComponent,
    TextEditDialogComponent,
    TextEditMultilineDialogComponent,
    PlayerEditDialogComponent,
    LikertRowEditDialogComponent,
    RichTextEditDialogComponent,
    HotspotEditDialogComponent,
    DropListOptionEditDialogComponent,
    SectionInsertDialogComponent,
    LabelEditDialogComponent,
    GeogebraAppDefinitionDialogComponent,
    DeleteReferenceDialogComponent,
    VisibilityRuleEditorComponent,
    StateVariablesDialogComponent,
    ShowStateVariablesButtonComponent,
    StateVariableEditorComponent,
    VisibilityRulesDialogComponent,
    SanitizationDialogComponent,
    TooltipPropertiesDialogComponent,
    GetValidAudioVideoAliasAndIDsPipe,
    ImageResizeDialogComponent,
    BytesPipe,
    SupportsQualityPipe,
    IDEditDialogComponent,
    OverviewDialogComponent,
    TableEditDialogComponent,
    DynamicOverlayComponent,
    DynamicSectionComponent,
    DynamicSectionHelperGridComponent,
    ElementListComponent,
    FixedReferencesSnackbarComponent,
    PageMenu,
    ReferenceListComponent,
    ReferenceListSnackbarComponent,
    SectionComponent,
    SectionMenuComponent,
    StaticOverlayComponent,
    StaticSectionComponent,
    UnexpectedErrorComponent,
    ElementGridChangeListenerDirective
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
    RichTextEditorModule,
    SectionTemplatesModule,
    EditorSharedModule,
    PropertiesPanelModule,
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    MatBadgeModule,
    MatTableModule,
    MatSortModule,
    MatSlideToggleModule,
    MatChipsModule
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
