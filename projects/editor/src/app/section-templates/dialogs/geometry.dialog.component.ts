import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileInformation, FileService } from 'common/services/file.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'aspect-editor-geometry-wizard-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    TranslateModule,
    MatButtonModule,
    RichTextEditorComponent,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    MatCheckboxModule,
    FormsModule
  ],
  template: `
    <div mat-dialog-title>Assistent: GeoGebra</div>
    <div mat-dialog-content>
      <h3>Text</h3>
      <aspect-rich-text-editor [(content)]="text" [style.min-height.px]="300"
                               [placeholder]="'Hier steht die Fragestellung.'"></aspect-rich-text-editor>

      <mat-divider></mat-divider>

      <h3>GeoGebra-Datei</h3>
      <mat-form-field matTooltip="{{'propertiesPanel.appDefinition' | translate }}"
                      appearance="fill" [style.align-self]="'flex-start'">
        <mat-label>{{ 'propertiesPanel.appDefinition' | translate }}</mat-label>
        <input matInput disabled
               [value]="geometryAppDefinition ? 'Definition vorhanden' : 'keine Definition vorhanden'">
        <button mat-icon-button matSuffix (click)="changeSrc()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>

      <mat-divider></mat-divider>

      <h3>Tooltipp</h3>
      <mat-checkbox [(ngModel)]="showHelper">
        Tooltipp für Zeichenaufgaben
      </mat-checkbox>

    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="{ text, geometryAppDefinition, geometryFileName, showHelper }">
        {{'confirm' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </div>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    .mat-mdc-dialog-content > *:not(h3, mat-divider) {margin-left: 30px;}
    h3 {text-decoration: underline;}
  `
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
