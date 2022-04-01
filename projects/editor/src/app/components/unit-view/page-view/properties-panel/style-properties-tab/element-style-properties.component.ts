import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ElementStyling } from '../../../../../../../../common/interfaces/elements';

@Component({
  selector: 'aspect-element-style-properties',
  template: `
    <div fxLayout="column">
      <mat-checkbox *ngIf="styles.lineColoring !== undefined"
                    [checked]="$any(styles.lineColoring)"
                    (change)="updateModel.emit({ property: 'lineColoring', value: $event.checked })">
        {{'propertiesPanel.lineColoring' | translate }}
      </mat-checkbox>

      <mat-form-field *ngIf="styles.lineColoring && styles.lineColoringColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.lineColoringColor' | translate }}</mat-label>
        <input matInput type="text" [value]="styles.lineColoringColor"
               (input)="updateModel.emit({ property: 'lineColoringColor', value: $any($event.target).value })">
        <button mat-icon-button matSuffix (click)="lineColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #lineColorInput
             [value]="styles.lineColoringColor"
             (input)="updateModel.emit({ property: 'lineColoringColor', value: $any($event.target).value })">

      <mat-form-field *ngIf="styles.selectionColor !== undefined" appearance="fill">
        <mat-label>{{'propertiesPanel.selectionColor' | translate }}</mat-label>
        <input matInput type="text" [value]="styles.selectionColor"
               (input)="updateModel.emit({ property: 'selectionColor', value: $any($event.target).value })">
        <button mat-icon-button matSuffix (click)="selectionColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #selectionColorInput
             [value]="styles.selectionColor"
             (input)="updateModel.emit({ property: 'selectionColor', value: $any($event.target).value })">

      <mat-form-field *ngIf="styles.borderRadius !== undefined" appearance="fill">
        <mat-label>{{'propertiesPanel.borderRadius' | translate }}</mat-label>
        <input matInput type="number" [ngModel]="styles.borderRadius"
               (input)="updateModel.emit({ property: 'borderRadius', value: $any($event.target).value })">
      </mat-form-field>

      <mat-form-field *ngIf="styles.itemBackgroundColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.itemBackgroundColor' | translate }}</mat-label>
        <input matInput type="text" [value]="styles.itemBackgroundColor"
               (input)="updateModel.emit({ property: 'itemBackgroundColor', value: $any($event.target).value })">
        <button mat-icon-button matSuffix (click)="itembackgroundColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #itembackgroundColorInput
             [value]="styles.itemBackgroundColor"
             (input)="updateModel.emit({ property: 'itemBackgroundColor', value: $any($event.target).value })">

      <mat-form-field *ngIf="styles.backgroundColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.backgroundColor' | translate }}</mat-label>
        <input matInput type="text" [value]="styles.backgroundColor"
               (input)="updateModel.emit({ property: 'backgroundColor', value: $any($event.target).value })">
        <button mat-icon-button matSuffix (click)="backgroundColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #backgroundColorInput
             [value]="styles.backgroundColor"
             (input)="updateModel.emit({ property: 'backgroundColor', value: $any($event.target).value })">

      <mat-form-field *ngIf="styles.borderColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.borderColor' | translate }}</mat-label>
        <input matInput type="text" [value]="styles.borderColor"
               (input)="updateModel.emit({ property: 'borderColor', value: $any($event.target).value })">
        <button mat-icon-button matSuffix (click)="borderColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #borderColorInput
             [value]="styles.borderColor"
             (input)="updateModel.emit({ property: 'borderColor', value: $any($event.target).value })">

      <mat-form-field *ngIf="styles.fontColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.fontColor' | translate }}</mat-label>
        <input matInput type="text" [value]="styles.fontColor"
               (input)="updateModel.emit({ property: 'fontColor', value: $any($event.target).value })">
        <button mat-icon-button matSuffix (click)="fontColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #fontColorInput
             [value]="styles.fontColor"
             (input)="updateModel.emit({ property: 'fontColor', value: $any($event.target).value })">

      <mat-form-field *ngIf="styles.font !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.font' | translate }}</mat-label>
        <input matInput type="text" [value]="styles.font" disabled
               (input)="updateModel.emit({ property: 'font', value: $any($event.target).value })">
      </mat-form-field>
      <mat-form-field *ngIf="styles.fontSize !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.fontSize' | translate }}</mat-label>
        <input matInput type="number" #fontSize="ngModel" min="0"
               [ngModel]="styles.fontSize"
               (ngModelChange)="updateModel.emit({ property: 'fontSize',
                                                   value: $event,
                                                   isInputValid: fontSize.valid && $event !== null})">
      </mat-form-field>
      <mat-form-field *ngIf="styles.lineHeight !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.lineHeight' | translate }}</mat-label>
        <input matInput type="number" #lineHeight="ngModel" min="0"
               [ngModel]="styles.lineHeight"
               (ngModelChange)="updateModel.emit({ property: 'lineHeight',
                                                   value: $event,
                                                   isInputValid: lineHeight.valid && $event !== null })">
      </mat-form-field>

      <mat-checkbox *ngIf="styles.bold !== undefined"
                    [checked]="$any(styles.bold)"
                    (change)="updateModel.emit({ property: 'bold', value: $event.checked })">
        {{'propertiesPanel.bold' | translate }}
      </mat-checkbox>
      <mat-checkbox *ngIf="styles.italic !== undefined"
                    [checked]="$any(styles.italic)"
                    (change)="updateModel.emit({ property: 'italic', value: $event.checked })">
        {{'propertiesPanel.italic' | translate }}
      </mat-checkbox>
      <mat-checkbox *ngIf="styles.underline !== undefined"
                    [checked]="$any(styles.underline)"
                    (change)="updateModel.emit({ property: 'underline', value: $event.checked })">
        {{'propertiesPanel.underline' | translate }}
      </mat-checkbox>

      <mat-form-field *ngIf="styles.borderStyle !== undefined"
                      appearance="fill">
        <mat-label>{{'propertiesPanel.borderStyle' | translate }}</mat-label>
        <mat-select [value]="styles.borderStyle"
                    (selectionChange)="updateModel.emit({ property: 'borderStyle', value: $event.value })">
          <mat-option *ngFor="let option of ['solid', 'dotted', 'dashed',
                                         'double', 'groove', 'ridge', 'inset', 'outset']"
                      [value]="option">
            {{option}}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field *ngIf="styles.borderWidth !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.borderWidth' | translate }}</mat-label>
        <input matInput type="number" #borderWidth="ngModel" min="0"
               [ngModel]="styles.borderWidth"
               (ngModelChange)="updateModel.emit({ property: 'borderWidth',
                                                     value: $event,
                                                     isInputValid: borderWidth.valid && $event !== null })">
      </mat-form-field>
    </div>
  `
})
export class ElementStylePropertiesComponent {
  @Input() styles: ElementStyling = {};
  @Output() updateModel = new EventEmitter<{
    property: string;
    value: string | boolean,
    isInputValid?: boolean | null
  }>();
}
