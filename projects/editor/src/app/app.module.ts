import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { createCustomElement } from '@angular/elements';

import { FlexLayoutModule } from '@angular/flex-layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDialogModule } from '@angular/material/dialog';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { UiElementToolboxComponent } from './components/unit-view/page-view/ui-element-toolbox/ui-element-toolbox.component';
import { PropertiesComponent } from './components/unit-view/page-view/properties/properties.component';
import { ConfirmationDialog, UnitViewComponent } from './components/unit-view/unit-view.component';
import { PageViewComponent } from './components/unit-view/page-view/page-view.component';
import { PageCanvasComponent } from './components/unit-view/page-view/canvas/page-canvas.component';
import { ButtonComponent } from './components/unit-view/page-view/canvas/canvas-element-components/button.component';
import { LabelComponent } from './components/unit-view/page-view/canvas/canvas-element-components/label.component';
import { TextFieldComponent } from './components/unit-view/page-view/canvas/canvas-element-components/text-field.component';
import { CanvasToolbarComponent } from './components/unit-view/page-view/canvas/canvas.toolbar.component';
import { ImageComponent } from './components/unit-view/page-view/canvas/canvas-element-components/image.component';
import { AudioComponent } from './components/unit-view/page-view/canvas/canvas-element-components/audio.component';
import { VideoComponent } from './components/unit-view/page-view/canvas/canvas-element-components/video.component';
import { RadioButtonGroupComponent } from './components/unit-view/page-view/canvas/canvas-element-components/radio-button-group.component';
import { CheckboxComponent } from './components/unit-view/page-view/canvas/canvas-element-components/checkbox.component';
import { DropdownComponent } from './components/unit-view/page-view/canvas/canvas-element-components/dropdown.component';
import { CorrectionComponent } from './components/unit-view/page-view/canvas/canvas-element-components/compound-components/correction.component';
import { CanvasSectionComponent } from './components/unit-view/page-view/canvas/canvas-section.component';
import { CanvasSectionToolbarComponent } from './components/unit-view/page-view/canvas/canvas-section-toolbar.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    UiElementToolboxComponent,
    PropertiesComponent,
    UnitViewComponent,
    PageViewComponent,
    PageCanvasComponent,
    ButtonComponent,
    LabelComponent,
    TextFieldComponent,
    CanvasToolbarComponent,
    ImageComponent,
    AudioComponent,
    VideoComponent,
    RadioButtonGroupComponent,
    CheckboxComponent,
    DropdownComponent,
    CorrectionComponent,
    CanvasSectionComponent,
    CanvasSectionToolbarComponent,
    ConfirmationDialog
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MatToolbarModule,
    MatIconModule,
    MatTabsModule,
    MatButtonModule,
    MatInputModule,
    FormsModule, // TODO needed?
    DragDropModule,
    MatCheckboxModule,
    MatSelectModule,
    MatRadioModule,
    MatListModule,
    MatExpansionModule,
    MatSidenavModule,
    MatDialogModule
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
