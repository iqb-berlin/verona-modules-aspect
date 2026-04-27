import { Component } from '@angular/core';
import { FileService } from 'common/services/file.service';
import { UnitService } from '../../services/unit-services/unit.service';
import { VeronaAPIService } from '../../services/verona-api.service';

@Component({
  selector: 'aspect-toolbar',
  templateUrl: './toolbar.component.html',
  styles: [
    'mat-toolbar {background-color: #696969}',
    'mat-toolbar button {margin: 15px}'
  ],
  standalone: false
})
export class ToolbarComponent {
  constructor(private unitService: UnitService,
              private veronaApiService: VeronaAPIService) { }

  save(): void {
    this.unitService.saveUnit();
  }

  async load(): Promise<void> {
    const unitFile = await FileService.loadFile(['.json', '.voud']);
    // Use the same load path as hosted mode by dispatching a start command message.
    window.postMessage({
      type: 'voeStartCommand',
      sessionId: this.veronaApiService.sessionID || 'dev',
      unitDefinition: unitFile.content,
      unitDefinitionType: 'aspect-unit-definition',
      editorConfig: {
        directDownloadUrl: this.veronaApiService.resourceURL || 'assets',
        role: 'maintainer'
      }
    }, '*');
  }
}
