import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { createCustomElement } from '@angular/elements';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { EditorModule } from '@tinymce/tinymce-angular';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { UiElementToolboxComponent } from './components/unit-view/page-view/ui-element-toolbox/ui-element-toolbox.component';
import { PropertiesComponent } from './components/unit-view/page-view/properties/properties.component';
import { UnitViewComponent } from './components/unit-view/unit-view.component';
import { PageViewComponent } from './components/unit-view/page-view/page-view.component';
import { PageCanvasComponent } from './components/unit-view/page-view/canvas/page-canvas.component';
import { SectionComponent } from './components/unit-view/page-view/canvas/section.component';
import { StaticCanvasOverlayComponent } from './components/unit-view/page-view/canvas/static-canvas-overlay.component';
import { DynamicCanvasOverlayComponent } from './components/unit-view/page-view/canvas/dynamic-canvas-overlay.component';
import { SharedModule } from '../../../common/app.module';
import {
  ConfirmationDialog, TextEditDialog, MultilineTextEditDialog, RichTextEditDialogTinyMCE
} from './dialog.service';
import { EditorTranslateLoader } from './editor-translate-loader';
import { PagePropertiesComponent } from './components/unit-view/page-view/properties/page-properties.component';
import { SectionPropertiesComponent } from './components/unit-view/page-view/properties/section-properties.component';
import { ElementPropertiesComponent } from './components/unit-view/page-view/properties/element-properties.component';
import { StaticViewOnlyElementOverlayComponent } from './components/unit-view/page-view/canvas/static-view-only-element-overlay.component';
import { DynamicViewOnlyElementOverlayComponent } from './components/unit-view/page-view/canvas/dynamic-view-only-element-overlay.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    UiElementToolboxComponent,
    PropertiesComponent,
    UnitViewComponent,
    PageViewComponent,
    PageCanvasComponent,
    SectionComponent,
    StaticCanvasOverlayComponent,
    DynamicCanvasOverlayComponent,
    ConfirmationDialog,
    TextEditDialog,
    MultilineTextEditDialog,
    RichTextEditDialogTinyMCE,
    PagePropertiesComponent,
    SectionPropertiesComponent,
    ElementPropertiesComponent,
    StaticViewOnlyElementOverlayComponent,
    DynamicViewOnlyElementOverlayComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    SharedModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    EditorModule,
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
