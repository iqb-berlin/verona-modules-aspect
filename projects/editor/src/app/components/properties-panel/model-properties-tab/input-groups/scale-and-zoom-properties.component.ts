import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';

@Component({
  selector: 'aspect-scale-and-zoom-properties',
  template: `
    <div class="fx-column-start-stretch" [style.gap.px]="5">
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

      <mat-checkbox *ngIf="combinedProperties.allowFullscreen !== undefined"
                    [checked]="$any(combinedProperties.allowFullscreen)"
                    (change)="updateModel.emit({ property: 'allowFullscreen', value: $event.checked })">
        {{'propertiesPanel.allowFullscreen' | translate }}
      </mat-checkbox>

      <mat-form-field appearance="fill" *ngIf="combinedProperties.magnifierSize !== undefined">
        <mat-label>{{'propertiesPanel.magnifierSize' | translate }} in px</mat-label>
        <input matInput type="number" #magnifierSize="ngModel" min="0"
               [disabled]="!combinedProperties.magnifier"
               [ngModel]="combinedProperties.magnifierSize"
               (ngModelChange)="updateModel.emit({
                    property: 'magnifierSize',
                    value: $event,
                    isInputValid: magnifierSize.valid})"
               (change)="combinedProperties.magnifierSize = combinedProperties.magnifierSize ?
                                                            combinedProperties.magnifierSize : 0">
      </mat-form-field>

      <div *ngIf="combinedProperties.magnifierZoom !== undefined"
           [class.disabled-label]="!combinedProperties.magnifier">
        {{'propertiesPanel.magnifierZoom' | translate }}
      </div>
      <mat-slider *ngIf="combinedProperties.magnifierZoom !== undefined"
                  [min]="1.0" [max]="3.0" [step]="0.1" [disabled]="!combinedProperties.magnifier">
        <input matSliderThumb [ngModel]="combinedProperties.magnifierZoom"
               (valueChange)="updateModel.emit({ property: 'magnifierZoom', value: $event })">
      </mat-slider>
      <div *ngIf="combinedProperties.magnifier">
        {{combinedProperties.magnifierZoom}}
      </div>
    </div>
  `,
  styles: [`
    .disabled-label {
      color: rgba(0, 0, 0, 0.26);
    }

    mat-slider {
        max-width: 90%;
    }
  `]
})
export class ScaleAndZoomPropertiesComponent {
  @Input() combinedProperties!: UIElement;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | null, isInputValid?: boolean | null }>();
}
