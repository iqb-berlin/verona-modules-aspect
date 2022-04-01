import {
  Component, EventEmitter, Input, Output
} from '@angular/core';

@Component({
  selector: 'aspect-image-properties',
  template: `
    <mat-checkbox *ngIf="combinedProperties.scale !== undefined"
                  [checked]="$any(combinedProperties.scale)"
                  (change)="updateModel.emit({ property: 'scale', value: $event.checked })">
      {{'propertiesPanel.scale' | translate }}
    </mat-checkbox>

    <mat-checkbox *ngIf="combinedProperties.magnifier !== undefined"
                  [checked]="$any(combinedProperties.magnifier)"
                  (change)="updateModel.emit({ property: 'magnifier', value: $event.checked })">
      {{'propertiesPanel.magnifier' | translate }}
    </mat-checkbox>
    <mat-form-field *ngIf="combinedProperties.magnifier" appearance="fill">
      <mat-label>{{'propertiesPanel.magnifierSize' | translate }} in px</mat-label>
      <input matInput type="number" #magnifierSize="ngModel" min="0"
             [ngModel]="combinedProperties.magnifierSize"
             (ngModelChange)="updateModel.emit({
                  property: 'magnifierSize',
                  value: $event,
                  isInputValid: magnifierSize.valid})">
    </mat-form-field>

    <ng-container *ngIf="combinedProperties.magnifier">
      {{'propertiesPanel.magnifierZoom' | translate }}
      <mat-slider min="1" max="3" step="0.1" [ngModel]="combinedProperties.magnifierZoom"
                  (change)="updateModel.emit({ property: 'magnifierZoom', value: $event.value })">
      </mat-slider>
      <div *ngIf="combinedProperties.magnifier">
        {{combinedProperties.magnifierZoom}}
      </div>
    </ng-container>
  `,
  styles: [
  ]
})
export class ImagePropertiesComponent {
  @Input() combinedProperties!: any;
  @Output() updateModel =
  new EventEmitter<{ property: string; value: string | number | boolean | null, isInputValid?: boolean | null }>();
}
