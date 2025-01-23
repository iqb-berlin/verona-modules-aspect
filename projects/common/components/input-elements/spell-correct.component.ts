import {
  Component, Input, ViewChild
} from '@angular/core';
import { MatInput } from '@angular/material/input';
import { SpellCorrectElement } from 'common/models/elements/input-elements/spell-correct';
import { TextInputComponent } from 'common/directives/text-input-component.directive';

@Component({
  selector: 'aspect-spell-correct',
  template: `
    <div [style.width.%]="100"
         [style.height.%]="100">
      <div class="fx-column-start-stretch"
           [style.width.%]="100"
           [style.height.%]="100">
        <mat-form-field class="small-input"
                        [style.--backgroundColor]="elementModel.styling.backgroundColor">
          <input matInput #input
                 autocomplete="off"
                 autocapitalize="none"
                 autocorrect="off"
                 spellcheck="false"
                 value="{{elementModel.value}}"
                 [attr.inputmode]="elementModel.showSoftwareKeyboard || elementModel.hideNativeKeyboard ? 'none' : 'text'"
                 [style.text-align]="'center'"
                 [readonly]="elementModel.readOnly"
                 [style.color]="elementModel.styling.fontColor"
                 [style.font-size.px]="elementModel.styling.fontSize"
                 [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
                 [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
                 [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
                 [formControl]="elementFormControl"
                 (keydown)="onKeyDown.emit({keyboardEvent: $event, inputElement: input})"
                 (focus)="focusChanged.emit({ inputElement: input, focused: true })"
                 (blur)="focusChanged.emit({ inputElement: input, focused: false })">
        </mat-form-field>
        <button #buttonElement
                mat-button
                type="button"
                class="spell-correct-button"
                [disabled]="elementModel.readOnly"
                [style.color]="elementModel.styling.fontColor"
                [style.font-size.px]="elementModel.styling.fontSize"
                [style.font-weight]="elementModel.styling.bold ? 'bold' : '400'"
                [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
                [style.width.%]="100"
                [style.margin-top]="'-20px'"
                [style.text-decoration-line]="!elementModel.readOnly && ((inputElement && inputElement.focused) ||
                                              (inputElement && !!inputElement.value) ||
                                              (elementFormControl && elementFormControl.value === '')) ?
                                              'line-through' : ''"
                (click)="elementFormControl.value === null ?
                            inputElement.focus() :
                            buttonElement.focus();
                         elementFormControl.value === null ?
                            elementFormControl.setValue('') :
                            elementFormControl.setValue(null)">
          {{elementModel.label}}
        </button>
        <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched">
          {{elementFormControl.errors | errorTransform: elementModel}}
        </mat-error>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .mat-mdc-form-field-infix  {
      z-index: 1;
    }
    :host ::ng-deep .mat-mdc-text-field-wrapper .mdc-notched-outline * {
      background-color: var(--backgroundColor) !important;
    }
    :host ::ng-deep .mat-mdc-text-field-wrapper.mdc-text-field--filled {
      background-color: var(--backgroundColor) !important;
    }
    .spell-correct-button {
      text-decoration-thickness: 3px;
    }
    .fx-column-start-stretch {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
    }
  `]
})
export class SpellCorrectComponent extends TextInputComponent {
  @Input() elementModel!: SpellCorrectElement;
  @ViewChild(MatInput) inputElement!: MatInput;
}
