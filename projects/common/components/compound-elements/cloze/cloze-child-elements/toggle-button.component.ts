import { Component, Input } from '@angular/core';
import { FormElementComponent } from 'common/directives/form-element-component.directive';
import { ToggleButtonElement } from 'common/models/elements/compound-elements/cloze/cloze-child-elements/toggle-button';

@Component({
  selector: 'aspect-toggle-button',
  template: `
    <aspect-cloze-child-error-message *ngIf="elementFormControl.errors && elementFormControl.touched"
                                      [elementModel]="elementModel"
                                      [elementFormControl]="elementFormControl">
    </aspect-cloze-child-error-message>
    <mat-button-toggle-group [class.errors]="elementFormControl.errors && elementFormControl.touched"
                             [formControl]="elementFormControl"
                             [isDisabled]="elementModel.readOnly"
                             [value]="elementModel.value"
                             [vertical]="elementModel.verticalOrientation"
                             [style.height.px]="elementModel.dimensions.isHeightFixed ? elementModel.dimensions.height : null"
                             [matTooltip]="elementFormControl.errors && elementFormControl.touched ?
                                           (elementFormControl.errors | errorTransform: elementModel) : ''"
                             [matTooltipClass]="'error-tooltip'"
                             (focusout)="elementFormControl.markAsTouched()">
      <!--Add dummy div - otherwise toggle button with empty options will not be in one line-->
      <div *ngIf="elementModel.options.length === 0"
           class="fx-row-center-center"
           [style.min-height.px]="elementModel.dimensions.height - 2"
           [style.width.%]="100">
        <span>&nbsp;</span>
      </div>
      <mat-button-toggle *ngFor="let option of elementModel.options; let i = index"
                         [value]="i"
                         [ngClass]="{ 'strike-other-options' : (this.elementFormControl.value !== null ||
                                                                  elementModel.value !== null) &&
                                                               elementModel.strikeOtherOptions,
                                      'strike-selected-option' : (this.elementFormControl.value !== null ||
                                                                    elementModel.value !== null) &&
                                                                 elementModel.strikeSelectedOption }"
                         [style.color]="elementModel.styling.fontColor"
                         [style.font-size.px]="elementModel.styling.fontSize"
                         [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
                         [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
                         [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
                         [style.background-color]="elementFormControl.value !== null &&
                                                   elementFormControl.value === i &&
                                                   !elementModel.strikeSelectedOption ?
                                                     elementModel.styling.selectionColor :
                                                     elementModel.styling.backgroundColor"
                         [style.line-height.%]="elementModel.styling.lineHeight">
        <div [innerHTML]="option.text | safeResourceHTML"></div>
      </mat-button-toggle>
    </mat-button-toggle-group>
  `,
  styles: [`
    :host {display:flex !important; width: 100%; height: 100%;}
    .errors {
      border: 2px solid #f44336 !important;
    }
    mat-button-toggle-group {
      display: inline-flex;
      width: 100%;
      min-width: 70px;
      min-height: 20px;
      max-width: 100%;
      justify-content: center;
      box-sizing: border-box;
    }

    :host ::ng-deep .mat-button-toggle-label-content {
      line-height: unset !important;
    }
    :host ::ng-deep .mat-button-toggle-button {
      height: 100%;
    }
    :host ::ng-deep .strike-selected-option.mat-button-toggle-checked .mat-button-toggle-label-content {
      text-decoration: line-through;
      text-decoration-thickness: 3px;
    }
    :host ::ng-deep .strike-other-options:not(.mat-button-toggle-checked) .mat-button-toggle-label-content {
      text-decoration: line-through;
      text-decoration-thickness: 3px;
    }
    .fx-row-center-center {
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class ToggleButtonComponent extends FormElementComponent {
  @Input() elementModel!: ToggleButtonElement;
}
