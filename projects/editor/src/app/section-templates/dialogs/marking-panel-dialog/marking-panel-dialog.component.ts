import { Component, Inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';

@Component({
  selector: 'aspect-editor-text2-wizard-dialog',
  imports: [
    TranslateModule,
    MatDialogModule,
    RichTextEditorComponent,
    MatDividerModule,
    MatCheckboxModule,
    FormsModule,
    MatButtonModule,
    MatRadioButton,
    MatRadioGroup,
    MatFormField,
    MatSelect,
    MatLabel,
    MatOption
  ],
  templateUrl: './marking-panel-dialog.component.html',
  styleUrls: ['./marking-panel-dialog.component.scss']
})
export class MarkingPanelDialogComponent {
  text1: string = '';
  showHelper: boolean = true;
  markingMode: 'word' | 'range' = 'word';
  connectedText: string | undefined;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { availableTextIDs: string[] }) { }
}
