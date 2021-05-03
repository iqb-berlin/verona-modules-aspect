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

import { AppComponent } from './app.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { UiElementToolboxComponent } from './components/ui-element-toolbox/ui-element-toolbox.component';
import { PropertiesComponent } from './components/properties/properties.component';
import { UnitViewComponent } from './components/unit-view/unit-view.component';
import { UnitCanvasComponent } from './components/unit-view/canvas.component';
import { ButtonComponent } from './components/unit-view/unit-view-components/button.component';
import { LabelComponent } from './components/unit-view/unit-view-components/label.component';
import { TextFieldComponent } from './components/unit-view/unit-view-components/text-field.component';
import { CanvasToolbarComponent } from './components/unit-view/canvas.toolbar.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    UiElementToolboxComponent,
    PropertiesComponent,
    UnitViewComponent,
    UnitCanvasComponent,
    ButtonComponent,
    LabelComponent,
    TextFieldComponent,
    CanvasToolbarComponent
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
    MatCheckboxModule
  ],
  providers: [],
  // bootstrap: [AppComponent],
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
