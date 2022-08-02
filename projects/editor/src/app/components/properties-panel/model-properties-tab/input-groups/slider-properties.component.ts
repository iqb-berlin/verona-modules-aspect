import {
  Component, EventEmitter, Input, Output
} from '@angular/core';

@Component({
  selector: 'aspect-slider-properties',
  template: `
    <mat-form-field *ngIf="combinedProperties.minValue !== undefined" appearance="fill">
      <mat-label>{{'propertiesPanel.minValue' | translate }}</mat-label>
      <input matInput type="number" #minValue="ngModel"
             [ngModel]="combinedProperties.minValue"
             (ngModelChange)="updateModel.emit({
                    property: 'minValue',
                    value: $event,
                    isInputValid: minValue.valid})">
    </mat-form-field>
    <mat-form-field *ngIf="combinedProperties.maxValue !== undefined" appearance="fill">
      <mat-label>{{'propertiesPanel.maxValue' | translate }}</mat-label>
      <input matInput type="number" #maxValue="ngModel"
             [ngModel]="combinedProperties.maxValue"
             (ngModelChange)="updateModel.emit({
                    property: 'maxValue',
                    value: $event,
                    isInputValid: maxValue.valid})">
    </mat-form-field>
    <mat-checkbox *ngIf="combinedProperties.showValues !== undefined"
                  [checked]="$any(combinedProperties.showValues)"
                  (change)="updateModel.emit({ property: 'showValues', value: $event.checked })">
      {{'propertiesPanel.showValues' | translate }}
    </mat-checkbox>
    <mat-checkbox *ngIf="combinedProperties.barStyle !== undefined"
                  [checked]="$any(combinedProperties.barStyle)"
                  (change)="updateModel.emit({ property: 'barStyle', value: $event.checked })">
      {{'propertiesPanel.barStyle' | translate }}
    </mat-checkbox>
    <mat-checkbox *ngIf="combinedProperties.thumbLabel !== undefined"
                  [checked]="$any(combinedProperties.thumbLabel)"
                  (change)="updateModel.emit({ property: 'thumbLabel', value: $event.checked })">
      {{'propertiesPanel.thumbLabel' | translate }}
    </mat-checkbox>
  `,
  styles: [
  ]
})
export class SliderPropertiesComponent {
  @Input() combinedProperties!: any;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | string[], isInputValid?: boolean | null }>();
}
