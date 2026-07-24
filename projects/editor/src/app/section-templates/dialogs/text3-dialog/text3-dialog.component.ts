import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'aspect-editor-text2-wizard-dialog',
  imports: [
    TranslateModule,
    MatDialogModule,
    RichTextEditorComponent,
    MatCheckboxModule,
    FormsModule,
    MatButtonModule
  ],
  templateUrl: './text3-dialog.component.html',
  styleUrls: ['./text3-dialog.component.scss']
})
export class Text3WizardDialogComponent {
  text1: string = '';
  text2: string = '';
  text3: string = '';
  text4: string = '';
  text5: string = '';
}
