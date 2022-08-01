import {
  Component, EventEmitter, Input, Output
} from '@angular/core';

@Component({
  selector: 'aspect-image-properties',
  template: `
    <div fxLayout="column" fxLayoutGap="5px" *ngIf="combinedProperties.scale !== undefined">
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

      <mat-form-field appearance="fill">
        <mat-label>{{'propertiesPanel.magnifierSize' | translate }} in px</mat-label>
        <input matInput type="number" #magnifierSize="ngModel" min="0"
               [disabled]="!combinedProperties.magnifier"
               [ngModel]="combinedProperties.magnifierSize"
               (ngModelChange)="updateModel.emit({
                    property: 'magnifierSize',
                    value: $event,
                    isInputValid: magnifierSize.valid})">
      </mat-form-field>

      <div [class.disabled-label]="!combinedProperties.magnifier">
        {{'propertiesPanel.magnifierZoom' | translate }}
      </div>
      <mat-slider min="1" max="3" step="0.1" [disabled]="!combinedProperties.magnifier"
                  [ngModel]="combinedProperties.magnifierZoom"
                  (change)="updateModel.emit({ property: 'magnifierZoom', value: $event.value })">
      </mat-slider>
      <div *ngIf="combinedProperties.magnifier">
        {{combinedProperties.magnifierZoom}}
      </div>
    </div>
  `,
  styles: [
    '.disabled-label {color: rgba(0, 0, 0, 0.26)}'
  ]
})
export class ImagePropertiesComponent {
  @Input() combinedProperties!: any;
  @Output() updateModel =
  new EventEmitter<{ property: string; value: string | number | boolean | null, isInputValid?: boolean | null }>();
}
