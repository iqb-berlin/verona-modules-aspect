import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { createCustomElement } from '@angular/elements';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { NgxTiptapModule } from 'ngx-tiptap';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { UiElementToolboxComponent } from './unit-view/page-view/new-ui-element-panel/ui-element-toolbox.component';
import { UnitViewComponent } from './unit-view/unit-view.component';
import { PageViewComponent } from './unit-view/page-view/page-view.component';
import { CanvasComponent } from './unit-view/page-view/canvas/canvas.component';
import { StaticCanvasOverlayComponent } from './unit-view/page-view/canvas/static-canvas-overlay.component';
import { DynamicCanvasOverlayComponent } from './unit-view/page-view/canvas/dynamic-canvas-overlay.component';
import { SharedModule } from '../../../common/shared.module';
import {
  ConfirmationDialog,
  TextEditDialog,
  MultilineTextEditDialog,
  RichTextEditDialog,
  LikertColumnEditDialog,
  LikertRowEditDialog,
  PlayerEditDialog
} from './dialog.service';
import { EditorTranslateLoader } from './editor-translate-loader';
import { ElementPropertiesComponent } from './unit-view/page-view/properties-panel/element-properties.component';
import { SectionMenuComponent } from './unit-view/page-view/canvas/section-menu.component';
import { SectionStaticComponent } from './unit-view/page-view/canvas/section-static.component';
import { SectionDynamicComponent } from './unit-view/page-view/canvas/section-dynamic.component';
import { RichTextEditorComponent } from './text-editor/rich-text-editor.component';
import { ElementStylePropertiesComponent } from './unit-view/page-view/properties-panel/element-style-properties.component';
import { ElementSizingPropertiesComponent } from './unit-view/page-view/properties-panel/element-sizing-properties.component';

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
    ConfirmationDialog,
    TextEditDialog,
    MultilineTextEditDialog,
    RichTextEditDialog,
    LikertColumnEditDialog,
    LikertRowEditDialog,
    PlayerEditDialog,
    ElementPropertiesComponent,
    SectionMenuComponent,
    SectionStaticComponent,
    SectionDynamicComponent,
    RichTextEditorComponent,
    ElementStylePropertiesComponent,
    ElementSizingPropertiesComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    SharedModule,
    MatButtonToggleModule,
    MatMenuModule,
    NgxTiptapModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: EditorTranslateLoader
      }
    })
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
