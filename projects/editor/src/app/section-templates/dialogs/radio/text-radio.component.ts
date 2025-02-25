import { Component } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgIf } from '@angular/common';
import { OptionListPanelComponent } from 'editor/src/app/components/properties-panel/option-list-panel.component';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { FormsModule } from '@angular/forms';
import { TextRadioOptions } from 'editor/src/app/section-templates/radio-interfaces';

@Component({
  selector: 'aspect-editor-textradio-stimulus',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    MatInput,
    MatCheckbox,
    MatDivider,
    MatFormField,
    OptionListPanelComponent,
    RichTextEditorComponent
  ],
  template: `
    <h3>Frage</h3>
    <aspect-rich-text-editor class="input1" [(content)]="options.label1" [placeholder]="'Hier steht die Fragestellung.'">
    </aspect-rich-text-editor>

    <mat-divider></mat-divider>

    <h3>Satzanfang (optional)</h3>
    <mat-form-field appearance="fill">
      <textarea matInput type="text" [(ngModel)]="options.label2" placeholder="Hier kann ein Satzanfang stehen."></textarea>
    </mat-form-field>

    <mat-divider></mat-divider>

    <h3>Optionen</h3>
    <aspect-option-list-panel class="options" [textFieldLabel]="'Neue Option'"
                              [itemList]="options.options"
                              [localMode]="true">
    </aspect-option-list-panel>

    <h3>Begründung</h3>
    <mat-checkbox [(ngModel)]="options.addExtraInput">
      Begründungsfeld anfügen
    </mat-checkbox>
    <aspect-rich-text-editor *ngIf="options.addExtraInput" class="input1"
                             [(content)]="options.text1" [placeholder]="'Begründe deine Entscheidung.'">
    </aspect-rich-text-editor>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    .mat-mdc-dialog-content > *:not(h3, mat-divider) {margin-left: 30px;}
    h3 {text-decoration: underline;}
    .large-text {min-height: 400px;}
    .small-text {min-height: 200px;}
  `
})
export class TextRadioComponent {
  options: TextRadioOptions = {
    label1: '',
    label2: '',
    options: [],
    addExtraInput: false,
    text1: ''
  };
}
