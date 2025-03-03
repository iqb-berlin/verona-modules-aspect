import { Component, EventEmitter, Output } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { OptionListPanelComponent } from 'editor/src/app/components/properties-panel/option-list-panel.component';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { FormsModule } from '@angular/forms';
import { TextRadioOptions } from 'editor/src/app/section-templates/radio-interfaces';

@Component({
  selector: 'aspect-editor-textradio-stimulus',
  standalone: true,
  imports: [
    FormsModule,
    MatInput,
    MatCheckbox,
    MatFormField,
    OptionListPanelComponent,
    RichTextEditorComponent
  ],
  template: `
    <h3>Frage</h3>
    <aspect-rich-text-editor class="input1" [(content)]="options.label1"
                             [placeholder]="'Hier steht die Fragestellung.'">
    </aspect-rich-text-editor>

    <h3>Satzanfang (optional)</h3>
    <mat-form-field appearance="fill" [style.width.%]="60">
      <textarea matInput type="text" [style.margin-left]="'unset'"
                [(ngModel)]="options.label2" placeholder="Hier kann ein Satzanfang stehen.">
      </textarea>
    </mat-form-field>

    <h3>Optionen</h3>
    <aspect-option-list-panel class="options" [textFieldLabel]="'Neue Option'"
                              [itemList]="options.options"
                              [localMode]="true"
                              (itemListUpdated)="checkValidity()">
    </aspect-option-list-panel>

    <h3>Begründung</h3>
    <mat-checkbox [(ngModel)]="options.addExtraInput">
      Begründungsfeld anfügen
    </mat-checkbox>
    <aspect-rich-text-editor class="input1" [disabled]="!options.addExtraInput"
                             [(content)]="options.text1" [controlPanelFolded]="true">
    </aspect-rich-text-editor>
    <mat-checkbox [(ngModel)]="options.extraInputMathfield" [disabled]="!options.addExtraInput">
      Formeleingabefeld verwenden
    </mat-checkbox>
  `,
  styles: `
    :host {display: flex; flex-direction: column;}
    *:not(h3, mat-divider) {margin-left: 30px;}
    h3:not(:first-child) {margin-top: 40px;}
    mat-checkbox {margin: 10px 0;}
  `
})
export class TextRadioComponent {
  @Output() validityChange = new EventEmitter<boolean>();

  options: TextRadioOptions = {
    label1: '',
    label2: '',
    options: [],
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
