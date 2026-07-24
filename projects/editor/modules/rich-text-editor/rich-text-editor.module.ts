import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'common/shared.module';
import { RichTextEditorComponent } from './components/rich-text-editor/rich-text-editor.component';
import { ButtonNodeviewComponent } from './components/button-nodeview/button-nodeview.component';
import { CheckboxNodeviewComponent } from './components/checkbox-nodeview/checkbox-nodeview.component';
import { DropdownNodeviewComponent } from './components/dropdown-nodeview/dropdown-nodeview.component';
import { DropListNodeviewComponent } from './components/drop-list-nodeview/drop-list-nodeview.component';
import { TextFieldNodeviewComponent } from './components/text-field-nodeview/text-field-nodeview.component';
import {
  ToggleButtonNodeviewComponent
} from './components/toggle-button-nodeview/toggle-button-nodeview.component';

@NgModule({
  declarations: [
    ButtonNodeviewComponent,
    CheckboxNodeviewComponent,
    DropdownNodeviewComponent,
    DropListNodeviewComponent,
    TextFieldNodeviewComponent,
    ToggleButtonNodeviewComponent
  ],
  imports: [
    CommonModule,
    MatTooltipModule,
    SharedModule,
    RichTextEditorComponent
  ],
  exports: [
    RichTextEditorComponent
  ]
})
export class RichTextEditorModule { }
