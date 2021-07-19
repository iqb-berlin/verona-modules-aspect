import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { createCustomElement } from '@angular/elements';

import { MatDialogModule } from '@angular/material/dialog';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { UiElementToolboxComponent } from './components/unit-view/page-view/ui-element-toolbox/ui-element-toolbox.component';
import { PropertiesComponent } from './components/unit-view/page-view/properties/properties.component';
import { UnitViewComponent } from './components/unit-view/unit-view.component';
import { PageViewComponent } from './components/unit-view/page-view/page-view.component';
import { PageCanvasComponent } from './components/unit-view/page-view/canvas/page-canvas.component';
import { CanvasToolbarComponent } from './components/unit-view/page-view/canvas/canvas.toolbar.component';
import { CanvasSectionComponent } from './components/unit-view/page-view/canvas/canvas-section.component';
import { CanvasSectionToolbarComponent } from './components/unit-view/page-view/canvas/canvas-section-toolbar.component';
import { CanvasDragOverlayComponent } from './components/unit-view/page-view/canvas/canvas-drag-overlay.component';
import { SharedModule } from '../../../common/app.module';
import { ConfirmationDialog, MultilineTextEditDialog, TextEditDialog } from './dialog.service';

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
    CanvasDragOverlayComponent,
    ConfirmationDialog,
    TextEditDialog,
    MultilineTextEditDialog
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    SharedModule,
    MatDialogModule
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
