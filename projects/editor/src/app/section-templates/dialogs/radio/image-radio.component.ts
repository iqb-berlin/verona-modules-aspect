import { Component, EventEmitter, Output } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { OptionListPanelComponent } from 'editor/src/app/components/properties-panel/option-list-panel.component';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { FormsModule } from '@angular/forms';
import { ImageRadioOptions } from 'editor/src/app/section-templates/radio-interfaces';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'aspect-editor-imageradio-stimulus',
  standalone: true,
  imports: [
    FormsModule,
    MatInput,
    MatFormField,
    OptionListPanelComponent,
    RichTextEditorComponent,
    MatCheckbox
  ],
  template: `
    <h3>Frage</h3>
    <aspect-rich-text-editor [(content)]="options.label1" [placeholder]="'Hier steht die Fragestellung.'">
    </aspect-rich-text-editor>

    <h3>Optionen</h3>
    <aspect-option-list-panel class="options" [textFieldLabel]="'Neue Option'"
                              [itemList]="options.options" [showImageButton]="true" [localMode]="true"
                              (itemListUpdated)="checkValidity()">
    </aspect-option-list-panel>

    <h3>Bilder je Zeile</h3>
    <mat-form-field [style.align-self]="'flex-start'">
      <input matInput type="number" min="1" max="9" [style.margin-left]="'unset'" [(ngModel)]="options.itemsPerRow">
    </mat-form-field>
    <p>4 Bilder pro Zeile: empfohlen für kleine Bilder oder einseitige Aufgaben<br>
      2 Bilder pro Zeile: empfohlen für zweiseitige Aufgaben oder große Bilder</p>

    <h3>Begründung</h3>
    <mat-checkbox [(ngModel)]="options.addExtraInput">
      Begründungsfeld anfügen
    </mat-checkbox>
    <aspect-rich-text-editor [disabled]="!options.addExtraInput" [(content)]="options.text1">
    </aspect-rich-text-editor>
    <mat-checkbox [(ngModel)]="options.extraInputMathfield" [disabled]="!options.addExtraInput">
      Formeleingabefeld verwenden
    </mat-checkbox>
  `,
  styles: `
    :host {display: flex; flex-direction: column;}
    *:not(h3, mat-divider) {margin-left: 30px;}
    h3:not(:first-child) {margin-top: 40px;}
  `
})
export class ImageRadioComponent {
  @Output() validityChange = new EventEmitter<boolean>();

  options: ImageRadioOptions = {
    label1: '',
    options: [],
    itemsPerRow: 4,
    addExtraInput: false,
    text1: 'Begründe deine Entscheidung.',
    extraInputMathfield: false
  };

  checkValidity(): void {
    if (this.options.options.length > 1) {
      this.validityChange.emit(true);
    } else {
      this.validityChange.emit(false);
    }
  }
}
