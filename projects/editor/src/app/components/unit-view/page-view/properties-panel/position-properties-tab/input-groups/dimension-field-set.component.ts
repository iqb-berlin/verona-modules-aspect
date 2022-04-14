import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { PositionProperties } from 'common/interfaces/elements';

@Component({
  selector: 'aspect-dimension-field-set',
  template: `
    <fieldset>
      <legend>Dimensionen</legend>
      <mat-checkbox *ngIf="positionProperties.dynamicWidth !== undefined"
                    [checked]="$any(positionProperties.dynamicWidth)"
                    (change)="updateModel.emit({ property: 'dynamicWidth', value: $event.checked })">
        {{'propertiesPanel.dynamicWidth' | translate }}
      </mat-checkbox>

      <mat-checkbox *ngIf="positionProperties.dynamicPositioning"
                    matTooltip="Element ist nicht mehr dynamisch. Die eingestellte Größe wird benutzt."
                    [checked]="$any(positionProperties.fixedSize)"
                    (change)="updateModel.emit({ property: 'fixedSize', value: $event.checked })">
        {{'propertiesPanel.fixedSize' | translate }}
      </mat-checkbox>

      <mat-form-field appearance="fill">
        <mat-label *ngIf="positionProperties.dynamicPositioning && !positionProperties.fixedSize">
          {{'propertiesPanel.minWidth' | translate }}
        </mat-label>
        <mat-label *ngIf="!positionProperties.dynamicPositioning ||
                          (positionProperties.dynamicPositioning && positionProperties.fixedSize)">
          {{'propertiesPanel.width' | translate }}
        </mat-label>
        <input matInput type="number" #width="ngModel" min="0"
               [ngModel]="dimensions.width"
               (ngModelChange)="updateModel.emit({ property: 'width',
                                                     value: $event,
                                                     isInputValid: width.valid && $event !== null })">
      </mat-form-field>

      <mat-checkbox *ngIf="positionProperties.dynamicPositioning && !positionProperties.fixedSize"
                    [checked]="$any(positionProperties.useMinHeight)"
                    (change)="updateModel.emit({ property: 'useMinHeight', value: $event.checked })">
        {{'propertiesPanel.useMinHeight' | translate }}
      </mat-checkbox>
      <mat-form-field *ngIf="!positionProperties.dynamicPositioning ||
                             (positionProperties.dynamicPositioning && positionProperties.useMinHeight ||
                             positionProperties.fixedSize)"
                      appearance="fill">
        <mat-label *ngIf="positionProperties.dynamicPositioning && positionProperties.useMinHeight">
          {{'propertiesPanel.minHeight' | translate }}
        </mat-label>
        <mat-label *ngIf="!positionProperties.dynamicPositioning ||
                          (positionProperties.dynamicPositioning &&
                          (positionProperties.fixedSize || positionProperties.useMinHeight))">
          {{'propertiesPanel.height' | translate }}
        </mat-label>
        <input matInput type="number" #height="ngModel" min="0"
               [ngModel]="dimensions.height"
               (ngModelChange)="updateModel.emit({ property: 'height',
                                                     value: $event,
                                                     isInputValid: height.valid && $event !== null })">
      </mat-form-field>
    </fieldset>
  `,
  styles: [
    '.mat-form-field {display: inline;}'
  ]
})
export class DimensionFieldSetComponent {
  @Input() positionProperties!: PositionProperties;
  @Input() dimensions!: { width: number; height: number; };
  @Output() updateModel =
  new EventEmitter<{ property: string; value: string | boolean, isInputValid?: boolean | null }>();
}
