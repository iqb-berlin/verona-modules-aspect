import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { OptionListPanelComponent } from 'editor/src/app/components/properties-panel/option-list-panel/option-list-panel.component';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { TextImageLabel } from 'common/models/label-interfaces';

@Component({
  selector: 'aspect-editor-likert-wizard-dialog',
  imports: [
    MatDialogModule,
    OptionListPanelComponent,
    RichTextEditorComponent,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    TranslateModule,
    MatButtonModule
  ],
  templateUrl: './likert-dialog.component.html',
  styleUrls: ['./likert-dialog.component.scss']
})
export class LikertWizardDialogComponent {
  text1: string = '';
  text2: string = '';
  options: TextImageLabel[] = [];
  rows: TextImageLabel[] = [];
}
