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

import { SharedModule } from 'common/shared.module';
import { SectionInsertDialogComponent } from 'editor/src/app/components/dialogs/section-insert-dialog.component';
import { AppComponent } from './app.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { UiElementToolboxComponent } from
  './components/new-ui-element-panel/ui-element-toolbox.component';
import { UnitViewComponent } from './components/unit-view/unit-view.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { StaticCanvasOverlayComponent } from
  './components/canvas/overlays/static-canvas-overlay.component';
import { DynamicCanvasOverlayComponent } from
  './components/canvas/overlays/dynamic-canvas-overlay.component';
import { EditorTranslateLoader } from './editor-translate-loader';
import { SectionMenuComponent } from './components/canvas/section-menu.component';
import { SectionStaticComponent } from './components/canvas/section-static.component';
import { SectionDynamicComponent } from './components/canvas/section-dynamic.component';
import { RichTextEditorComponent } from './text-editor/rich-text-editor.component';
import { ConfirmationDialogComponent } from './components/dialogs/confirmation-dialog.component';
import { TextEditDialogComponent } from './components/dialogs/text-edit-dialog.component';
import { TextEditMultilineDialogComponent } from './components/dialogs/text-edit-multiline-dialog.component';
import { PlayerEditDialogComponent } from './components/dialogs/player-edit-dialog.component';
import { ColumnHeaderEditDialogComponent } from './components/dialogs/column-header-edit-dialog.component';
import { LikertRowEditDialogComponent } from './components/dialogs/likert-row-edit-dialog.component';
import { RichTextEditDialogComponent } from './components/dialogs/rich-text-edit-dialog.component';
import { DropListOptionEditDialogComponent } from './components/dialogs/drop-list-option-edit-dialog.component';

import { ToggleButtonNodeviewComponent } from './text-editor/angular-node-views/toggle-button-nodeview.component';
import { TextFieldNodeviewComponent } from './text-editor/angular-node-views/text-field-nodeview.component';
import { DropListNodeviewComponent } from './text-editor/angular-node-views/drop-list-nodeview.component';
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
import { ElementModelPropertiesComponent } from
  './components/properties-panel/model-properties-tab/element-model-properties.component';
import { DynamicSectionHelperGridComponent } from './components/canvas/dynamic-section-helper-grid.component';
import { ElementGridChangeListenerDirective } from './components/canvas/element-grid-change-listener.directive';
import { OptionsFieldSetComponent } from
  './components/properties-panel/model-properties-tab/input-groups/options-field-set.component';
import { TextPropertiesFieldSetComponent } from
  './components/properties-panel/model-properties-tab/input-groups/text-properties-field-set.component';
import { ButtonPropertiesComponent } from
  './components/properties-panel/model-properties-tab/input-groups/button-properties.component';
import { SliderPropertiesComponent } from
  './components/properties-panel/model-properties-tab/input-groups/slider-properties.component';
import { TextFieldElementPropertiesComponent } from
    './components/properties-panel/model-properties-tab/input-groups/text-field-element-properties.component';
import { ScaleAndZoomPropertiesComponent } from
    './components/properties-panel/model-properties-tab/input-groups/scale-and-zoom-properties.component';
import { DropListPropertiesComponent } from
  './components/properties-panel/model-properties-tab/input-groups/drop-list-properties.component';
import { RichTextEditorSimpleComponent } from './text-editor-simple/rich-text-editor-simple.component';
import { RichTextSimpleEditDialogComponent } from './components/dialogs/rich-text-simple-edit-dialog.component';
import { SelectPropertiesComponent } from './components/properties-panel/model-properties-tab/input-groups/select-properties.component';
import { InputElementPropertiesComponent } from './components/properties-panel/model-properties-tab/input-groups/input-element-properties.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    UiElementToolboxComponent,
    UnitViewComponent,
    CanvasComponent,
    StaticCanvasOverlayComponent,
    DynamicCanvasOverlayComponent,
    ElementPropertiesPanelComponent,
    SectionMenuComponent,
    SectionStaticComponent,
    SectionDynamicComponent,
    RichTextEditorComponent,
    ToggleButtonNodeviewComponent,
    TextFieldNodeviewComponent,
    DropListNodeviewComponent,
    ElementStylePropertiesComponent,
    ElementPositionPropertiesComponent,
    ConfirmationDialogComponent,
    TextEditDialogComponent,
    TextEditMultilineDialogComponent,
    PlayerEditDialogComponent,
    ColumnHeaderEditDialogComponent,
    LikertRowEditDialogComponent,
    RichTextEditDialogComponent,
    ElementModelPropertiesComponent,
    DropListOptionEditDialogComponent,
    PositionFieldSetComponent,
    DimensionFieldSetComponent,
    DynamicSectionHelperGridComponent,
    ElementGridChangeListenerDirective,
    OptionsFieldSetComponent,
    TextPropertiesFieldSetComponent,
    ButtonPropertiesComponent,
    SliderPropertiesComponent,
    TextFieldElementPropertiesComponent,
    ScaleAndZoomPropertiesComponent,
    DropListPropertiesComponent,
    RichTextEditorSimpleComponent,
    RichTextSimpleEditDialogComponent,
    SectionInsertDialogComponent,
    SelectPropertiesComponent,
    InputElementPropertiesComponent
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
    MatListModule
  ],
  providers: []
})

export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) {}
  ngDoBootstrap(): void {
    const editorElement = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define('aspect-editor', editorElement);
  }
}
