import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UIElement } from '../../../../../../../common/models/uI-element';

@Component({
  selector: 'app-element-style-properties',
  template: `
    <div fxLayout="column">
      <mat-form-field *ngIf="combinedProperties.borderRadius !== undefined" appearance="fill">
        <mat-label>{{'propertiesPanel.borderRadius' | translate }}</mat-label>
        <input matInput type="number" [value]="combinedProperties.borderRadius"
               (input)="updateModel.emit({ property: 'borderRadius', value: $any($event.target).value })">
      </mat-form-field>

      <mat-form-field *ngIf="combinedProperties.itemBackgroundColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.itemBackgroundColor' | translate }}</mat-label>
        <input matInput type="color" [value]="combinedProperties.itemBackgroundColor"
               (input)="updateModel.emit({ property: 'itemBackgroundColor', value: $any($event.target).value })">
      </mat-form-field>
      <mat-form-field *ngIf="combinedProperties.itemBackgroundColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.itemBackgroundColor' | translate }}</mat-label>
        <input matInput type="text" [value]="combinedProperties.itemBackgroundColor"
               (input)="updateModel.emit({ property: 'itemBackgroundColor', value: $any($event.target).value })">
      </mat-form-field>

      <mat-form-field *ngIf="combinedProperties.surfaceProps?.backgroundColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.backgroundColor' | translate }}</mat-label>
        <input matInput type="color" [value]="combinedProperties.surfaceProps?.backgroundColor"
               (input)="updateModel.emit({ property: 'backgroundColor', value: $any($event.target).value })">
      </mat-form-field>
      <mat-form-field *ngIf="combinedProperties.surfaceProps?.backgroundColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.backgroundColor' | translate }}</mat-label>
        <input matInput type="text" [value]="combinedProperties.surfaceProps?.backgroundColor"
               (input)="updateModel.emit({ property: 'backgroundColor', value: $any($event.target).value })">
      </mat-form-field>

      <mat-form-field *ngIf="combinedProperties.fontProps?.fontColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.fontColor' | translate }}</mat-label>
        <input matInput type="color" [value]="combinedProperties.fontProps?.fontColor"
               (input)="updateModel.emit({ property: 'fontColor', value: $any($event.target).value })">
      </mat-form-field>
      <mat-form-field *ngIf="combinedProperties.fontProps?.fontColor !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.fontColor' | translate }}</mat-label>
        <input matInput type="text" [value]="combinedProperties.fontProps?.fontColor"
               (input)="updateModel.emit({ property: 'fontColor', value: $any($event.target).value })">
      </mat-form-field>

      <mat-form-field *ngIf="combinedProperties.fontProps?.font !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.font' | translate }}</mat-label>
        <input matInput type="text" [value]="combinedProperties.fontProps?.font"
               (input)="updateModel.emit({ property: 'font', value: $any($event.target).value })">
      </mat-form-field>
      <mat-form-field *ngIf="combinedProperties.fontProps?.fontSize !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.fontSize' | translate }}</mat-label>
        <input matInput type="number" #fontSize="ngModel" min="0"
               [ngModel]="combinedProperties.fontProps?.fontSize"
               (ngModelChange)="updateModel.emit({ property: 'fontSize',
                                                   value: $event,
                                                   isInputValid: fontSize.valid && $event !== null})">
      </mat-form-field>
      <mat-form-field *ngIf="combinedProperties.fontProps?.lineHeight !== undefined"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{'propertiesPanel.lineHeight' | translate }}</mat-label>
        <input matInput type="number" #lineHeight="ngModel" min="0"
               [ngModel]="combinedProperties.fontProps?.lineHeight"
               (ngModelChange)="updateModel.emit({ property: 'lineHeight',
                                                   value: $event,
                                                   isInputValid: lineHeight.valid && $event !== null })">
      </mat-form-field>

      <mat-checkbox *ngIf="combinedProperties.fontProps?.bold !== undefined"
                    [checked]="$any(combinedProperties.fontProps?.bold)"
                    (change)="updateModel.emit({ property: 'bold', value: $event.checked })">
        {{'propertiesPanel.bold' | translate }}
      </mat-checkbox>
      <mat-checkbox *ngIf="combinedProperties.fontProps?.italic !== undefined"
                    [checked]="$any(combinedProperties.fontProps?.italic)"
                    (change)="updateModel.emit({ property: 'italic', value: $event.checked })">
        {{'propertiesPanel.italic' | translate }}
      </mat-checkbox>
      <mat-checkbox *ngIf="combinedProperties.fontProps?.underline !== undefined"
                    [checked]="$any(combinedProperties.fontProps?.underline)"
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
