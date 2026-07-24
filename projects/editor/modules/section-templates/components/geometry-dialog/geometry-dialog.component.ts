import { Component } from '@angular/core';
import { FileInformation, FileService } from 'common/services/file.service';

@Component({
  standalone: false,
  selector: 'aspect-editor-geometry-wizard-dialog',
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
