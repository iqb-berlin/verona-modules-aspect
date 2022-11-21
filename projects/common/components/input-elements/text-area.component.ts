import {
  Component, Input, AfterViewInit
} from '@angular/core';
import { TextAreaElement } from 'common/models/elements/input-elements/text-area';
import { delay, Observable, of } from 'rxjs';
import { TextInputComponent } from 'common/directives/text-input-component.directive';

@Component({
  selector: 'aspect-text-area',
  template: `
    <mat-form-field
      [ngClass]="{ 'no-label' : !elementModel.label}"
      [style.width.%]="100"
      [style.height.%]="100"
      [style.min-height.%]="100"
      aspectInputBackgroundColor [backgroundColor]="elementModel.styling.backgroundColor"
      [style.color]="elementModel.styling.fontColor"
      [style.font-family]="elementModel.styling.font"
      [style.font-size.px]="elementModel.styling.fontSize"
      [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
      [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
      [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
      [appearance]="$any(elementModel.appearance)">
      <mat-label *ngIf="elementModel.label">{{elementModel.label}}</mat-label>
      <mat-icon *ngIf="!elementFormControl.touched && elementModel.hasKeyboardIcon"
                class="keyboard-icon"
                [style.top.px]="elementModel.styling.fontSize/2">
        keyboard_outline
      </mat-icon>
      <textarea matInput #input
                autocomplete="off"
                autocapitalize="none"
                autocorrect="off"
                spellcheck="false"
                value="{{elementModel.value}}"
                [rows]="(isViewInitialized | async) && elementModel.hasDynamicRowCount ?
                            (elementModel.expectedCharactersCount | updateTextareaRows:
                                input.offsetWidth:
                                elementModel.styling.fontSize) :
                            elementModel.rowCount"
                [attr.inputmode]="elementModel.showSoftwareKeyboard ? 'none' : 'text'"
                [formControl]="elementFormControl"
                [readonly]="elementModel.readOnly"
                [style.min-width.%]="100"
                [style.line-height.%]="elementModel.styling.lineHeight"
                [style.resize]="elementModel.resizeEnabled ? 'both' : 'none'"
                (keydown)="onKeyDown($event)"
                (focus)="focusChanged.emit({ inputElement: input, focused: true })"
                (blur)="focusChanged.emit({ inputElement: input, focused: false })">
      </textarea>
      <mat-error *ngIf="elementFormControl.errors">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
    </mat-form-field>
  `,
  styles: [
    '.keyboard-icon {position: absolute; right: 0; font-size: 150%;}',
    ':host ::ng-deep div.mat-form-field-infix {padding-top: 0.2em; padding-bottom: 0.2em;}',
    ':host ::ng-deep .no-label .mat-form-field-outline-gap {border-top-color: unset !important}'
  ]
})
export class TextAreaComponent extends TextInputComponent implements AfterViewInit {
  @Input() elementModel!: TextAreaElement;

  isViewInitialized: Observable<boolean> = of(false);

  ngAfterViewInit(): void {
    this.isViewInitialized = of(true).pipe(delay(0));
  }
}
