import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxTiptapModule } from 'ngx-tiptap';
import { SharedModule } from 'common/shared.module';
import { RichTextEditorComponent } from './components/rich-text-editor/rich-text-editor.component';
import { ComboButtonComponent } from './components/combo-button/combo-button.component';
import { MathFormulaNodeviewComponent } from './components/math-formula/math-formula.component';
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
    ToggleButtonNodeviewComponent,
    MathFormulaNodeviewComponent,
    ComboButtonComponent,
    RichTextEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatSelectModule,
    MatTooltipModule,
    NgxTiptapModule,
    SharedModule
  ],
  exports: [
    RichTextEditorComponent
  ]
})
export class RichTextEditorModule { }
