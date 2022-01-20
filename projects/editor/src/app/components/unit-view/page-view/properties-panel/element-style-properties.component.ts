import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UIElement } from '../../../../../../../common/models/uI-element';

@Component({
  selector: 'app-element-style-properties',
  template: `
    <div fxLayout="column">
      <mat-form-field *ngIf="combinedProperties.selectionColor !== undefined" appearance="fill">
        <mat-label>{{'propertiesPanel.selectionColor' | translate }}</mat-label>
        <input matInput type="text" [value]="combinedProperties.selectionColor"
               (input)="updateModel.emit({ property: 'selectionColor', value: $any($event.target).value })">
        <button mat-icon-button matSuffix (click)="selectionColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #selectionColorInput
             [value]="combinedProperties.selectionColor"
             (input)="updateModel.emit({ property: 'selectionColor', value: $any($event.target).value })">

      <mat-form-field *ngIf="combinedProperties.borderRadius !== undefined" appearance="fill">
        <mat-label>{{'propertiesPanel.borderRadius' | translate }}</mat-label>
        <input matInput type="number" [value]="combinedProperties.borderRadius"
               (input)="updateModel.emit({ property: 'borderRadius', value: $any($event.target).value })">
      </mat-form-field>

      <mat-form-field *ngIf="combinedProperties.itemBackgroundColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.itemBackgroundColor' | translate }}</mat-label>
        <input matInput type="text" [value]="combinedProperties.itemBackgroundColor"
               (input)="updateModel.emit({ property: 'itemBackgroundColor', value: $any($event.target).value })">
        <button mat-icon-button matSuffix (click)="itembackgroundColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #itembackgroundColorInput
             [value]="combinedProperties.itemBackgroundColor"
             (input)="updateModel.emit({ property: 'itemBackgroundColor', value: $any($event.target).value })">

    <mat-form-field *ngIf="combinedProperties.backgroundColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.backgroundColor' | translate }}</mat-label>
        <input matInput type="text" [value]="combinedProperties.backgroundColor"
               (input)="updateModel.emit({ property: 'backgroundColor', value: $any($event.target).value })">
        <button mat-icon-button matSuffix (click)="backgroundColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #backgroundColorInput
             [value]="combinedProperties.backgroundColor"
             (input)="updateModel.emit({ property: 'backgroundColor', value: $any($event.target).value })">

      <mat-form-field *ngIf="combinedProperties.borderColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.borderColor' | translate }}</mat-label>
        <input matInput type="text" [value]="combinedProperties.borderColor"
               (input)="updateModel.emit({ property: 'borderColor', value: $any($event.target).value })">
        <button mat-icon-button matSuffix (click)="borderColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #borderColorInput
             [value]="combinedProperties.borderColor"
             (input)="updateModel.emit({ property: 'borderColor', value: $any($event.target).value })">

      <mat-form-field *ngIf="combinedProperties.fontColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.fontColor' | translate }}</mat-label>
        <input matInput type="text" [value]="combinedProperties.fontColor"
               (input)="updateModel.emit({ property: 'fontColor', value: $any($event.target).value })">
        <button mat-icon-button matSuffix (click)="fontColorInput.click()">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-form-field>
      <input matInput type="color" hidden #fontColorInput
             [value]="combinedProperties.fontColor"
             (input)="updateModel.emit({ property: 'fontColor', value: $any($event.target).value })">

      <mat-form-field *ngIf="combinedProperties.font !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.font' | translate }}</mat-label>
        <input matInput type="text" [value]="combinedProperties.font" disabled
               (input)="updateModel.emit({ property: 'font', value: $any($event.target).value })">
      </mat-form-field>
      <mat-form-field *ngIf="combinedProperties.fontSize !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.fontSize' | translate }}</mat-label>
        <input matInput type="number" #fontSize="ngModel" min="0"
               [ngModel]="combinedProperties.fontSize"
               (ngModelChange)="updateModel.emit({ property: 'fontSize',
                                                   value: $event,
                                                   isInputValid: fontSize.valid && $event !== null})">
      </mat-form-field>
      <mat-form-field *ngIf="combinedProperties.lineHeight !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.lineHeight' | translate }}</mat-label>
        <input matInput type="number" #lineHeight="ngModel" min="0"
               [ngModel]="combinedProperties.lineHeight"
               (ngModelChange)="updateModel.emit({ property: 'lineHeight',
                                                   value: $event,
                                                   isInputValid: lineHeight.valid && $event !== null })">
      </mat-form-field>

      <mat-checkbox *ngIf="combinedProperties.bold !== undefined"
                    [checked]="$any(combinedProperties.bold)"
                    (change)="updateModel.emit({ property: 'bold', value: $event.checked })">
        {{'propertiesPanel.bold' | translate }}
      </mat-checkbox>
      <mat-checkbox *ngIf="combinedProperties.italic !== undefined"
                    [checked]="$any(combinedProperties.italic)"
                    (change)="updateModel.emit({ property: 'italic', value: $event.checked })">
        {{'propertiesPanel.italic' | translate }}
      </mat-checkbox>
      <mat-checkbox *ngIf="combinedProperties.underline !== undefined"
                    [checked]="$any(combinedProperties.underline)"
                    (change)="updateModel.emit({ property: 'underline', value: $event.checked })">
        {{'propertiesPanel.underline' | translate }}
      </mat-checkbox>
    </div>
  `
})
export class ElementStylePropertiesComponent {
  @Input() combinedProperties: UIElement = {} as UIElement;
  @Output() updateModel = new EventEmitter<{
    property: string;
    value: string | boolean,
    isInputValid?: boolean | null
  }>();
}
