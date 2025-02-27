import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'aspect-editor-text2-wizard-dialog',
  standalone: true,
  imports: [
    TranslateModule,
    MatDialogModule,
    RichTextEditorComponent,
    MatCheckboxModule,
    FormsModule,
    MatButtonModule
  ],
  template: `
    <div mat-dialog-title>Aufgabenidee</div>
    <div mat-dialog-content>
      <h3>Beschreibung der Aufgabenidee:</h3>
      <aspect-rich-text-editor class="input1" [(content)]="text1"
                               [placeholder]="'Beschreibung der Aufgabenidee (möglichst detailliert, falls' +
                                ' keine Skizze oder Vorlage dazu vorhanden)'">
      </aspect-rich-text-editor>
      <h3>Skizze der Aufgabe</h3>
      <aspect-rich-text-editor class="input1" [(content)]="text2"
                               [placeholder]="'Skizze der Aufgabe'">
      </aspect-rich-text-editor>
      <h3>Lösung der Aufgabe</h3>
      <aspect-rich-text-editor class="input1" [(content)]="text3"
                               [placeholder]="'Lösung der Aufgabe'">
      </aspect-rich-text-editor>
      <h3>Aufgabenvorlage</h3>
      <aspect-rich-text-editor class="input1" [(content)]="text4"
                               [placeholder]="'Verlinkungen'">
      </aspect-rich-text-editor>
      <h3>Benötigte Ressourcen</h3>
      <aspect-rich-text-editor class="input1" [(content)]="text5"
                               [placeholder]="'Links zu benötigten Ressourcen (zum Beispiel Textauszüge, Audios,' +
                                ' Videos, Homepages, ...)'">
      </aspect-rich-text-editor>
    </div>
    <div mat-dialog-actions>
      <button mat-button
              [mat-dialog-close]="{ text1, text2, text3, text4, text5 }">
        {{'confirm' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </div>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    .mat-mdc-dialog-content > *:not(h3, mat-divider) {margin-left: 30px;}
    h3:not(:first-child) {margin-top: 40px;}
    .input1 {min-height: 200px;}
  `
})
export class Text3WizardDialogComponent {
  text1: string = '';
  text2: string = '';
  text3: string = '';
  text4: string = '';
  text5: string = '';
}
