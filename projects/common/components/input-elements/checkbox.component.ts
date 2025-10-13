import { Component, Input, OnInit } from '@angular/core';
import { CheckboxElement } from 'common/models/elements/input-elements/checkbox';
import { FormElementComponent } from '../../directives/form-element-component.directive';

@Component({
    selector: 'aspect-checkbox',
    template: `
    <ng-container *ngIf="!tableMode">
      <div class="mat-form-field"
           [style.width.%]="100"
           [style.height.%]="100"
           [style.background-color]="elementModel.styling.backgroundColor">
        <mat-checkbox #checkbox class="example-margin"
                      [formControl]="elementFormControl"
                      [class.image]="elementModel.imgSrc"
                      [checked]="$any(elementModel.value)"
                      [class.strike]="elementModel.crossOutChecked && elementFormControl.value"
                      [style.color]="elementModel.styling.fontColor"
                      [style.font-size.px]="elementModel.styling.fontSize"
                      [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
                      [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
                      [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
                      (click)="elementModel.readOnly ? $event.preventDefault() : null">
          @if (elementModel.imgSrc) {
            <img [src]="elementModel.imgSrc" alt="Bildplatzhalter">
          } @else {
            <div [innerHTML]="elementModel.label | safeResourceHTML"></div>
          }
        </mat-checkbox>
        <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched"
                   class="error-message">
          {{elementFormControl.errors | errorTransform: elementModel}}
        </mat-error>
      </div>
    </ng-container>
    <div *ngIf="tableMode" class="svg-checkbox"
         (click)="this.elementFormControl.setValue(!this.elementFormControl.value)">
      <svg class="svg-checkbox-cross" [style.opacity]="this.elementFormControl.value ? 1 : 0" viewBox='0 0 100 100'>
        <path d='M1 0 L0 1 L99 100 L100 99' fill='black' stroke="black" stroke-width="2" />
        <path d='M0 99 L99 0 L100 1 L1 100' fill='black' stroke="black" stroke-width="1" />
      </svg>
    </div>
  `,
    styles: [`
    :host ::ng-deep mat-checkbox.image .mdc-form-field.mat-internal-form-field {
      flex-direction: column-reverse;
    }
    :host ::ng-deep .mdc-form-field.mat-internal-form-field {
      font-size: inherit;
      font-weight: inherit;
    }
    .error-message {
      position: absolute;
      display: block;
      margin-top: 5px;
      font-size: 75%;
    }
    .strike {
      text-decoration: line-through;
      text-decoration-thickness: 3px;
    }
    :host ::ng-deep .strike .mdc-form-field.mat-internal-form-field {
      text-decoration: inherit;
    }
    .svg-checkbox {width: 100%; height: 100%;}
    .svg-checkbox:hover {background-color: lightgrey;}
    .svg-checkbox-cross {width: 100%; height: 100%;}
 `],
    standalone: false
})
export class CheckboxComponent extends FormElementComponent implements OnInit {
  @Input() elementModel!: CheckboxElement;
  tableMode: boolean = false;
}
