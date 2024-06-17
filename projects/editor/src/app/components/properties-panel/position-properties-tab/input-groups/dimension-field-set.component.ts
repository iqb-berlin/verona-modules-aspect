import { Component, Input } from '@angular/core';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { DimensionProperties, PositionProperties } from 'common/models/elements/property-group-interfaces';
import { ElementService } from 'editor/src/app/services/unit-services/element.service';

@Component({
  selector: 'aspect-dimension-field-set',
  template: `
    <fieldset>
      <legend>Dimensionen</legend>
      <ng-container *ngIf="unitService.unit.pages[selectionService.selectedPageIndex]
                    .sections[selectionService.selectedSectionIndex].dynamicPositioning ||
                    selectionService.isCompoundChildSelected;
                    else elseBlock">
        <mat-checkbox #fixedWidth [checked]="$any(dimensions.isWidthFixed)"
                      (change)="updateDimensionProperty('isWidthFixed', $event.checked)">
          {{'propertiesPanel.isWidthFixed' | translate }}
        </mat-checkbox>
        <mat-form-field appearance="fill">
          <mat-label>{{'propertiesPanel.width' | translate }}</mat-label>
          <input matInput type="number" min="0"
                 [disabled]="!fixedWidth.checked"
                 [ngModel]="dimensions.width"
                 (ngModelChange)="updateDimensionProperty('width', $event)"
                 (change)="dimensions.width = dimensions.width ? dimensions.width : 0">
        </mat-form-field>

        <mat-checkbox #fixedHeight [checked]="$any(dimensions.isHeightFixed)"
                      (change)="updateDimensionProperty('isHeightFixed', $event.checked)">
          {{'propertiesPanel.isHeightFixed' | translate }}
        </mat-checkbox>
        <mat-form-field>
          <mat-label>
            {{'propertiesPanel.height' | translate }}
          </mat-label>
          <input matInput type="number" min="0"
                 [disabled]="!fixedHeight.checked"
                 [ngModel]="dimensions.height"
                 (ngModelChange)="updateDimensionProperty('height', $event)"
                 (change)="dimensions.height = dimensions.height ? dimensions.height : 0">
        </mat-form-field>

        <mat-checkbox #minWidthEnabled [checked]="dimensions.minWidth !== null"
                      (change)="toggleProperty('minWidth', $event.checked)">
          {{'propertiesPanel.minWidthEnabled' | translate }}
        </mat-checkbox>
        <mat-form-field>
          <mat-label>
            {{'propertiesPanel.minWidth' | translate }}
          </mat-label>
          <input matInput type="number" min="0"
                 [disabled]="!minWidthEnabled.checked"
                 [ngModel]="dimensions.minWidth"
                 (ngModelChange)="updateDimensionProperty('minWidth', $event)">
        </mat-form-field>

        <mat-checkbox #maxWidthEnabled [checked]="dimensions.maxWidth !== null"
                      (change)="toggleProperty('maxWidth', $event.checked)">
          {{'propertiesPanel.maxWidthEnabled' | translate }}
        </mat-checkbox>
        <mat-form-field>
          <mat-label>
            {{'propertiesPanel.maxWidth' | translate }}
          </mat-label>
          <input matInput type="number" min="0"
                 [disabled]="!maxWidthEnabled.checked"
                 [ngModel]="dimensions.maxWidth"
                 (ngModelChange)="updateDimensionProperty('maxWidth', $event)">
        </mat-form-field>

        <mat-checkbox #minHeightEnabled [checked]="dimensions.minHeight !== null"
                      (change)="toggleProperty('minHeight', $event.checked)">
          {{'propertiesPanel.minHeightEnabled' | translate }}
        </mat-checkbox>
        <mat-form-field>
          <mat-label>
            {{'propertiesPanel.minHeight' | translate }}
          </mat-label>
          <input matInput type="number" min="0"
                 [disabled]="!minHeightEnabled.checked"
                 [ngModel]="dimensions.minHeight"
                 (ngModelChange)="updateDimensionProperty('minHeight', $event)">
        </mat-form-field>

        <mat-checkbox #maxHeightEnabled [checked]="dimensions.maxHeight !== null"
                      (change)="toggleProperty('maxHeight', $event.checked)">
          {{'propertiesPanel.maxHeightEnabled' | translate }}
        </mat-checkbox>
        <mat-form-field>
          <mat-label>
            {{'propertiesPanel.maxHeight' | translate }}
          </mat-label>
          <input matInput type="number" min="0"
                 [disabled]="!maxHeightEnabled.checked"
                 [ngModel]="dimensions.maxHeight"
                 (ngModelChange)="updateDimensionProperty('maxHeight', $event)">
        </mat-form-field>
      </ng-container>

      <ng-template #elseBlock>
        <mat-form-field appearance="fill">
          <mat-label>{{'propertiesPanel.width' | translate }}</mat-label>
          <input matInput type="number" min="0"
                 [ngModel]="dimensions.width"
                 (ngModelChange)="updateDimensionProperty('width', $event)"
                 (change)="dimensions.width = dimensions.width ? dimensions.width : 0">
        </mat-form-field>
        <mat-form-field>
          <mat-label>
            {{'propertiesPanel.height' | translate }}
          </mat-label>
          <input matInput type="number" min="0"
                 [ngModel]="dimensions.height"
                 (ngModelChange)="updateDimensionProperty('height', $event)"
                 (change)="dimensions.height = dimensions.height ? dimensions.height : 0">
        </mat-form-field>
      </ng-template>
    </fieldset>
  `
})

export class DimensionFieldSetComponent {
  @Input() positionProperties: PositionProperties | undefined;
  @Input() dimensions!: DimensionProperties;

  constructor(public unitService: UnitService,
              public elementService: ElementService,
              public selectionService: SelectionService) { }

  updateDimensionProperty(property: string, value: any): void {
    this.elementService.updateElementsDimensionsProperty(this.selectionService.getSelectedElements(), property, value);
  }

  toggleProperty(property: string, checked:boolean): void {
    if (!checked) {
      this.elementService.updateElementsDimensionsProperty(this.selectionService.getSelectedElements(), property, null);
    }
  }
}
