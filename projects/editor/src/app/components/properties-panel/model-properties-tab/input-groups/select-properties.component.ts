import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';

@Component({
  selector: 'aspect-select-properties',
  template: `
    <mat-checkbox *ngIf="unitService.expertMode && combinedProperties.strikeOtherOptions !== undefined"
                  [checked]="$any(combinedProperties.strikeOtherOptions)"
                  (change)="updateModel.emit({ property: 'strikeOtherOptions', value: $event.checked })">
      {{'propertiesPanel.strikeOtherOptions' | translate }}
    </mat-checkbox>
    <mat-checkbox *ngIf="combinedProperties.strikeSelectedOption !== undefined"
                  [matTooltip]="'Setzt gleichzeitig die Auswahlfarbe auf transparent'"
                  [checked]="$any(combinedProperties.strikeSelectedOption)"
                  (change)="updateModel.emit({ property: 'strikeSelectedOption', value: $event.checked })">
      {{'propertiesPanel.strikeSelectedOption' | translate }}
    </mat-checkbox>
    <mat-checkbox *ngIf="combinedProperties.allowUnset !== undefined"
                  [checked]="$any(combinedProperties.allowUnset)"
                  (change)="updateModel.emit({ property: 'allowUnset', value: $event.checked })">
      {{'propertiesPanel.allowUnset' | translate }}
    </mat-checkbox>

    <mat-checkbox *ngIf="combinedProperties.itemsPerRow !== undefined"
                  (change)="setItemsPerRow($event)"
                  [checked]="$any(combinedProperties.itemsPerRow)">
      {{'limitItemPerRow' | translate}}
    </mat-checkbox>

    <mat-form-field *ngIf="combinedProperties.itemsPerRow !== undefined"
                    appearance="fill" class="mdInput textsingleline">
      <mat-label>{{'itemsPerRow' | translate }}</mat-label>
      <input matInput type="number" [min]="1" [pattern]="'[1-9]'" #itemsPerRow="ngModel" required
             [disabled]="combinedProperties.itemsPerRow === null"
             [ngModel]="$any(combinedProperties.itemsPerRow)"
             (input)="itemsPerRow.valid &&
                      updateModel.emit({ property: 'itemsPerRow', value: $any($event.target).value })">
      <mat-error *ngIf="itemsPerRow.errors?.['pattern']">
        {{'numberGreater0' | translate}}
      </mat-error>
    </mat-form-field>
  `
})
export class SelectPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel =
    new EventEmitter<{
      property: string,
      value: string | number | boolean | string[] | null
    }>();

  constructor(public unitService: UnitService) { }

  setItemsPerRow(event: MatCheckboxChange) {
    if (!event.checked) {
      this.updateModel.emit({ property: 'itemsPerRow', value: null });
    } else {
      this.updateModel.emit({ property: 'itemsPerRow', value: 4 });
    }
  }
}
