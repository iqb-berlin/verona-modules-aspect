import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileInformation, FileService } from 'common/services/file.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'aspect-editor-geometry-wizard-dialog',
  imports: [
    MatDialogModule,
    TranslateModule,
    MatButtonModule,
    RichTextEditorComponent,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    MatCheckboxModule,
    FormsModule
  ],
  templateUrl: './geometry-dialog.component.html',
  styleUrls: ['./geometry-dialog.component.scss']
})
export class GeometryWizardDialogComponent {
  text: string = '';
  geometryAppDefinition: string | undefined;
  geometryFileName: string | undefined;
  showHelper: boolean = true;

  async changeSrc() {
    await FileService.loadFile(['.ggb'], true).then((file: FileInformation) => {
      this.geometryAppDefinition = file.content;
      this.geometryFileName = file.name;
    });
  }
}
