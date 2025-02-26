import { Component } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { OptionListPanelComponent } from 'editor/src/app/components/properties-panel/option-list-panel.component';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { FormsModule } from '@angular/forms';
import { ImageRadioOptions } from 'editor/src/app/section-templates/radio-interfaces';
import { MatCheckbox } from '@angular/material/checkbox';
import { NgIf } from '@angular/common';

@Component({
  selector: 'aspect-editor-imageradio-stimulus',
  standalone: true,
  imports: [
    FormsModule,
    MatInput,
    MatDivider,
    MatFormField,
    OptionListPanelComponent,
    RichTextEditorComponent,
    MatCheckbox,
    NgIf
  ],
  template: `
    <h3>Frage</h3>
    <aspect-rich-text-editor class="input1" [(content)]="options.label1"
                             [placeholder]="'Hier steht die Fragestellung.'">
    </aspect-rich-text-editor>

    <mat-divider></mat-divider>

    <h3>Optionen</h3>
    <aspect-option-list-panel class="options" [textFieldLabel]="'Neue Option'"
                              [itemList]="options.options"
                              [showImageButton]="true"
                              [localMode]="true">
    </aspect-option-list-panel>

    <mat-divider></mat-divider>

    <h3>Bilder je Zeile</h3>
    <mat-form-field [style.align-self]="'flex-start'">
      <input matInput type="number" min="1" max="9" [(ngModel)]="options.itemsPerRow">
    </mat-form-field>
    <p>4 Bilder pro Zeile: empfohlen für kleine Bilder oder einseitige Aufgaben<br>
      2 Bilder pro Zeile: empfohlen für zweiseitige Aufgaben oder große Bilder</p>

    <h3>Begründung</h3>
    <mat-checkbox [(ngModel)]="options.addExtraInput">
      Begründungsfeld anfügen
    </mat-checkbox>
    <aspect-rich-text-editor class="input1" [disabled]="!options.addExtraInput"
                             [(content)]="options.text1" [placeholder]="'Begründe deine Entscheidung.'">
    </aspect-rich-text-editor>
    <mat-checkbox [(ngModel)]="options.extraInputMathfield" [disabled]="!options.addExtraInput">
      Formeleingabefeld verwenden
    </mat-checkbox>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    .mat-mdc-dialog-content > *:not(h3, mat-divider) {margin-left: 30px;}
    h3 {text-decoration: underline;}
  `
})
export class ImageRadioComponent {
  options: ImageRadioOptions = {
    label1: '',
    options: [],
    itemsPerRow: 4,
    addExtraInput: false,
    text1: '',
    extraInputMathfield: false
  };
}
