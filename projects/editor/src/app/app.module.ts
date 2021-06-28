import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { createCustomElement } from '@angular/elements';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { UiElementToolboxComponent } from './components/unit-view/page-view/ui-element-toolbox/ui-element-toolbox.component';
import { PropertiesComponent } from './components/unit-view/page-view/properties/properties.component';
import { ConfirmationDialog, UnitViewComponent } from './components/unit-view/unit-view.component';
import { PageViewComponent } from './components/unit-view/page-view/page-view.component';
import { PageCanvasComponent } from './components/unit-view/page-view/canvas/page-canvas.component';
import { CanvasToolbarComponent } from './components/unit-view/page-view/canvas/canvas.toolbar.component';
import { CanvasSectionComponent } from './components/unit-view/page-view/canvas/canvas-section.component';
import { CanvasSectionToolbarComponent } from './components/unit-view/page-view/canvas/canvas-section-toolbar.component';

import { SharedModule } from '../../../common/app.module';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    UiElementToolboxComponent,
    PropertiesComponent,
    UnitViewComponent,
    PageViewComponent,
    PageCanvasComponent,
    CanvasToolbarComponent,
    CanvasSectionComponent,
    CanvasSectionToolbarComponent,
    ConfirmationDialog
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    SharedModule
  ],
  providers: [],
  // bootstrap: [AppComponent]
  entryComponents: [
    AppComponent
  ]
})
export class AppModule {
  constructor(private injector: Injector) {}
  ngDoBootstrap(): void {
    const editorElement = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define('editor-aspect', editorElement);
  }
}
