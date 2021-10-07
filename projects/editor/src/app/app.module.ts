import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { createCustomElement } from '@angular/elements';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { NgxTiptapModule } from 'ngx-tiptap';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { UiElementToolboxComponent } from './components/unit-view/page-view/ui-element-toolbox/ui-element-toolbox.component';
import { UnitViewComponent } from './components/unit-view/unit-view.component';
import { PageViewComponent } from './components/unit-view/page-view/page-view.component';
import { PageCanvasComponent } from './components/unit-view/page-view/canvas/page-canvas.component';
import { StaticCanvasOverlayComponent } from './components/unit-view/page-view/canvas/static-canvas-overlay.component';
import { DynamicCanvasOverlayComponent } from './components/unit-view/page-view/canvas/dynamic-canvas-overlay.component';
import { SharedModule } from '../../../common/app.module';
import {
  ConfirmationDialog, TextEditDialog, MultilineTextEditDialog, RichTextEditDialog
} from './dialog.service';
import { EditorTranslateLoader } from './editor-translate-loader';
import { ElementPropertiesComponent } from './components/unit-view/page-view/properties/element-properties.component';
import { SectionMenuComponent } from './components/unit-view/page-view/canvas/section-menu.component';
import { SectionStaticComponent } from './components/unit-view/page-view/canvas/section-static.component';
import { SectionDynamicComponent } from './components/unit-view/page-view/canvas/section-dynamic.component';
import { RichTextEditorComponent } from './components/unit-view/page-view/rich-text-editor.component';
import { ElementStylePropertiesComponent } from './components/unit-view/page-view/properties/element-style-properties.component';
import { ElementSizingPropertiesComponent } from './components/unit-view/page-view/properties/element-sizing-properties.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    UiElementToolboxComponent,
    UnitViewComponent,
    PageViewComponent,
    PageCanvasComponent,
    StaticCanvasOverlayComponent,
    DynamicCanvasOverlayComponent,
    ConfirmationDialog,
    TextEditDialog,
    MultilineTextEditDialog,
    RichTextEditDialog,
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
    MatSlideToggleModule,
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
