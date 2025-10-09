import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';

@Component({
    selector: 'aspect-slider-properties',
    imports: [
        NgIf,
        TranslateModule,
        MatInputModule,
        FormsModule,
        MatCheckboxModule
    ],
    template: `
    <mat-form-field *ngIf="combinedProperties.minValue !== undefined" appearance="fill">
      <mat-label>{{'propertiesPanel.minValue' | translate }}</mat-label>
      <input matInput type="number" #minValue="ngModel"
             [ngModel]="combinedProperties.minValue"
             (ngModelChange)="updateModel.emit({
                    property: 'minValue',
                    value: $event,
                    isInputValid: minValue.valid})"
             (change)="combinedProperties.minValue = combinedProperties.minValue ?
                                                            combinedProperties.minValue : 0">
    </mat-form-field>
    <mat-form-field *ngIf="combinedProperties.maxValue !== undefined" appearance="fill">
      <mat-label>{{'propertiesPanel.maxValue' | translate }}</mat-label>
      <input matInput type="number" #maxValue="ngModel"
             [ngModel]="combinedProperties.maxValue"
             (ngModelChange)="updateModel.emit({
                    property: 'maxValue',
                    value: $event,
                    isInputValid: maxValue.valid})"
             (change)="combinedProperties.maxValue = combinedProperties.maxValue ?
                                                            combinedProperties.maxValue : 0">
    </mat-form-field>
    <mat-checkbox *ngIf="unitService.expertMode && combinedProperties.showValues !== undefined"
                  [checked]="$any(combinedProperties.showValues)"
                  (change)="updateModel.emit({ property: 'showValues', value: $event.checked })">
      {{'propertiesPanel.showValues' | translate }}
    </mat-checkbox>
    <mat-checkbox *ngIf="unitService.expertMode && combinedProperties.barStyle !== undefined"
                  [checked]="$any(combinedProperties.barStyle)"
                  (change)="updateModel.emit({ property: 'barStyle', value: $event.checked })">
      {{'propertiesPanel.barStyle' | translate }}
    </mat-checkbox>
    <mat-checkbox *ngIf="unitService.expertMode && combinedProperties.thumbLabel !== undefined"
                  [checked]="$any(combinedProperties.thumbLabel)"
                  (change)="updateModel.emit({ property: 'thumbLabel', value: $event.checked })">
      {{'propertiesPanel.thumbLabel' | translate }}
    </mat-checkbox>
  `
})
export class SliderPropertiesComponent {
  @Input() combinedProperties!: any;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | string[], isInputValid?: boolean | null }>();

  constructor(public unitService: UnitService) { }
}
