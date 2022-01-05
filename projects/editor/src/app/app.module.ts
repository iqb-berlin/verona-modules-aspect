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

import { AppComponent } from './app.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { UiElementToolboxComponent } from
  './components/unit-view/page-view/new-ui-element-panel/ui-element-toolbox.component';
import { UnitViewComponent } from './components/unit-view/unit-view.component';
import { PageViewComponent } from './components/unit-view/page-view/page-view.component';
import { CanvasComponent } from './components/unit-view/page-view/canvas/canvas.component';
import { StaticCanvasOverlayComponent } from
  './components/unit-view/page-view/canvas/overlays/static-canvas-overlay.component';
import { DynamicCanvasOverlayComponent } from
  './components/unit-view/page-view/canvas/overlays/dynamic-canvas-overlay.component';
import { SharedModule } from '../../../common/shared.module';
import { EditorTranslateLoader } from './editor-translate-loader';
import { ElementPropertiesComponent } from
  './components/unit-view/page-view/properties-panel/element-properties.component';
import { SectionMenuComponent } from './components/unit-view/page-view/canvas/section-menu.component';
import { SectionStaticComponent } from './components/unit-view/page-view/canvas/section-static.component';
import { SectionDynamicComponent } from './components/unit-view/page-view/canvas/section-dynamic.component';
import { RichTextEditorComponent } from './text-editor/rich-text-editor.component';
import { ElementStylePropertiesComponent } from
  './components/unit-view/page-view/properties-panel/element-style-properties.component';
import { ElementSizingPropertiesComponent } from
  './components/unit-view/page-view/properties-panel/element-sizing-properties.component';
import { ConfirmationDialogComponent } from './components/dialogs/confirmation-dialog.component';
import { TextEditDialogComponent } from './components/dialogs/text-edit-dialog.component';
import { TextEditMultilineDialogComponent } from './components/dialogs/text-edit-multiline-dialog.component';
import { PlayerEditDialogComponent } from './components/dialogs/player-edit-dialog.component';
import { LikertColumnEditDialogComponent } from './components/dialogs/likert-column-edit-dialog.component';
import { LikertRowEditDialogComponent } from './components/dialogs/likert-row-edit-dialog.component';
import { RichTextEditDialogComponent } from './components/dialogs/rich-text-edit-dialog.component';
import { ElementModelPropertiesComponent } from
  './components/unit-view/page-view/properties-panel/element-model-properties.component';
import { DropListOptionEditDialogComponent } from './components/dialogs/drop-list-option-edit-dialog.component';

import { NodeviewToggleButtonComponent } from './text-editor/node-views/nodeview-toggle-button.component';
import { NodeviewTextFieldComponent } from './text-editor/node-views/nodeview-text-field.component';
import { NodeviewDropListComponent } from './text-editor/node-views/nodeview-drop-list.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    UiElementToolboxComponent,
    UnitViewComponent,
    PageViewComponent,
    CanvasComponent,
    StaticCanvasOverlayComponent,
    DynamicCanvasOverlayComponent,
    ElementPropertiesComponent,
    SectionMenuComponent,
    SectionStaticComponent,
    SectionDynamicComponent,
    RichTextEditorComponent,
    NodeviewToggleButtonComponent,
    NodeviewTextFieldComponent,
    NodeviewDropListComponent,
    ElementStylePropertiesComponent,
    ElementSizingPropertiesComponent,
    ConfirmationDialogComponent,
    TextEditDialogComponent,
    TextEditMultilineDialogComponent,
    PlayerEditDialogComponent,
    LikertColumnEditDialogComponent,
    LikertRowEditDialogComponent,
    RichTextEditDialogComponent,
    ElementModelPropertiesComponent,
    DropListOptionEditDialogComponent
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
    customElements.define('editor-aspect', editorElement);
  }
}
