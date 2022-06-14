import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { PositionProperties } from 'common/models/elements/element';
import { UnitService } from 'editor/src/app/services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';

@Component({
  selector: 'aspect-dimension-field-set',
  template: `
    <fieldset>
      <legend>Dimensionen</legend>
      <mat-checkbox *ngIf="dimensions.dynamicWidth !== undefined"
                    [checked]="$any(dimensions?.dynamicWidth)"
                    (change)="updateDimensionProperty('dynamicWidth', $event.checked)">
        {{'propertiesPanel.dynamicWidth' | translate }}
      </mat-checkbox>

      <mat-checkbox *ngIf="positionProperties?.dynamicPositioning"
                    matTooltip="Element ist nicht mehr dynamisch. Die eingestellte Größe wird benutzt."
                    [checked]="$any(positionProperties?.fixedSize)"
                    (change)="updatePositionProperty('fixedSize', $event.checked)">
        {{'propertiesPanel.fixedSize' | translate }}
      </mat-checkbox>

      <mat-form-field appearance="fill">
        <mat-label *ngIf="positionProperties?.dynamicPositioning && !positionProperties?.fixedSize">
          {{'propertiesPanel.minWidth' | translate }}
        </mat-label>
        <mat-label *ngIf="!positionProperties?.dynamicPositioning ||
                          (positionProperties?.dynamicPositioning && positionProperties?.fixedSize)">
          {{'propertiesPanel.width' | translate }}
        </mat-label>
        <input matInput type="number" #width="ngModel" min="0"
               [disabled]="$any(dimensions.dynamicWidth)"
               [ngModel]="dimensions.width"
               (ngModelChange)="updateDimensionProperty('width', $event)">
      </mat-form-field>

      <mat-checkbox *ngIf="positionProperties?.dynamicPositioning && !positionProperties?.fixedSize"
                    [checked]="$any(positionProperties?.useMinHeight)"
                    (change)="updatePositionProperty('useMinHeight', $event.checked)">
        {{'propertiesPanel.useMinHeight' | translate }}
      </mat-checkbox>
      <mat-form-field *ngIf="!positionProperties?.dynamicPositioning ||
                             (positionProperties?.dynamicPositioning && positionProperties?.useMinHeight ||
                             positionProperties?.fixedSize)"
                      appearance="fill">
        <mat-label *ngIf="positionProperties?.dynamicPositioning && positionProperties?.useMinHeight">
          {{'propertiesPanel.minHeight' | translate }}
        </mat-label>
        <mat-label *ngIf="!positionProperties?.dynamicPositioning ||
                          (positionProperties?.dynamicPositioning &&
                          (positionProperties?.fixedSize || positionProperties?.useMinHeight))">
          {{'propertiesPanel.height' | translate }}
        </mat-label>
        <input matInput type="number" #height="ngModel" min="0"
               [ngModel]="dimensions.height"
               (ngModelChange)="updateDimensionProperty('height', $event)">
      </mat-form-field>
    </fieldset>
  `,
  styles: [
    '.mat-form-field {display: inline;}'
  ]
})
export class DimensionFieldSetComponent {
  @Input() positionProperties: PositionProperties | undefined;
  @Input() dimensions!: { width: number; height: number; dynamicWidth?: boolean };

  constructor(public unitService: UnitService, public selectionService: SelectionService) { }

  updateDimensionProperty(property: string, value: any): void {
    this.unitService.updateElementsProperty(this.selectionService.getSelectedElements(), property, value);
  }

  updatePositionProperty(property: string, value: any): void {
    this.unitService.updateSelectedElementsPositionProperty(property, value);
  }
}
