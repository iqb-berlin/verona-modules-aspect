import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UIElementValue } from 'common/models/elements/element';
import { PositionProperties } from 'common/models/elements/property-group-interfaces';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';

@Component({
  selector: 'aspect-position-field-set',
  template: `
    <fieldset>
      <legend>Position</legend>
      <div *ngIf="!unitService.unit
                    .pages[selectionService.selectedPageIndex]
                    .sections[selectionService.selectedSectionIndex]
                    .dynamicPositioning;
                    else elseBlock"
           class="flex-row">
        <mat-form-field *ngIf="positionProperties.xPosition !== undefined"
                        appearance="outline">
          <mat-label>{{'propertiesPanel.xPosition' | translate }}</mat-label>
          <input matInput type="number" #xPosition="ngModel" min="0"
                 [ngModel]="positionProperties.xPosition"
                 (ngModelChange)="updateModel.emit(
                        { property: 'xPosition', value: $event, isInputValid: xPosition.valid && $event !== null })"
                 (change)="positionProperties.xPosition = positionProperties.xPosition ?
                                                          positionProperties.xPosition : 0">
        </mat-form-field>
        <mat-form-field *ngIf="positionProperties.yPosition !== undefined"
                        appearance="outline">
          <mat-label>{{'propertiesPanel.yPosition' | translate }}</mat-label>
          <input matInput type="number" #yPosition="ngModel" min="0"
                 [ngModel]="positionProperties.yPosition"
                 (ngModelChange)="updateModel.emit(
                        { property: 'yPosition', value: $event, isInputValid: yPosition.valid && $event !== null })"
                 (change)="positionProperties.yPosition = positionProperties.yPosition ?
                                                          positionProperties.yPosition : 0">
        </mat-form-field>
      </div>

      <ng-template #elseBlock>
        {{'propertiesPanel.grid' | translate }}
        <div class="flex-row">
          <mat-form-field appearance="outline">
            <mat-label>{{'row' | translate }}</mat-label>
            <input matInput type="number" [ngModel]="positionProperties.gridRow"
                   (ngModelChange)="updateModel.emit({ property: 'gridRow', value: $event })">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{'propertiesPanel.rowRange' | translate }}</mat-label>
            <input matInput type="number"
                   [ngModel]="positionProperties.gridRowRange"
                   (ngModelChange)="updateModel.emit({ property: 'gridRowRange', value: $event })"
                   (change)="positionProperties.gridRowRange = positionProperties.gridRowRange ?
                                                               positionProperties.gridRowRange : 0">
          </mat-form-field>
        </div>
        <div class="flex-row">
          <mat-form-field appearance="outline">
            <mat-label>{{'column' | translate }}</mat-label>
            <input matInput type="number" [ngModel]="positionProperties.gridColumn"
                   (ngModelChange)="updateModel.emit({ property: 'gridColumn', value: $event })">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{'propertiesPanel.columnRange' | translate }}</mat-label>
            <input matInput type="number"
                   [ngModel]="positionProperties.gridColumnRange"
                   (ngModelChange)="updateModel.emit({ property: 'gridColumnRange', value: $event })"
                   (change)="positionProperties.gridColumnRange = positionProperties.gridColumnRange ?
                                                                  positionProperties.gridColumnRange : 0">
          </mat-form-field>
        </div>

        {{'propertiesPanel.margin' | translate }}
        <div>
          <aspect-size-input-panel [label]="('propertiesPanel.top' | translate)"
                                   [value]="positionProperties.marginTop.value"
                                   [unit]="positionProperties.marginTop.unit"
                                   [allowedUnits]="['px', '%']"
                                   (valueUpdated)="updateModel.emit(
                                                     {
                                                       property: 'marginTop',
                                                       value: $any($event)
                                                     })">
          </aspect-size-input-panel>
          <aspect-size-input-panel [label]="('propertiesPanel.bottom' | translate)"
                                   [value]="positionProperties.marginBottom.value"
                                   [unit]="positionProperties.marginBottom.unit"
                                   [allowedUnits]="['px', '%']"
                                   (valueUpdated)="updateModel.emit(
                                                     {
                                                       property: 'marginBottom',
                                                       value: $any($event)
                                                     })">
          </aspect-size-input-panel>
          <aspect-size-input-panel [label]="('propertiesPanel.left' | translate)"
                                   [value]="positionProperties.marginLeft.value"
                                   [unit]="positionProperties.marginLeft.unit"
                                   [allowedUnits]="['px', '%']"
                                   (valueUpdated)="updateModel.emit(
                                                     {
                                                       property: 'marginLeft',
                                                       value: $any($event)
                                                     })">
          </aspect-size-input-panel>
          <aspect-size-input-panel [label]="('propertiesPanel.right' | translate)"
                                   [value]="positionProperties.marginRight.value"
                                   [unit]="positionProperties.marginRight.unit"
                                   [allowedUnits]="['px', '%']"
                                   (valueUpdated)="updateModel.emit(
                                                     {
                                                       property: 'marginRight',
                                                       value: $any($event)
                                                     })">
          </aspect-size-input-panel>
        </div>
      </ng-template>

      <ng-container *ngIf="!isZIndexDisabled">
        Stapelung<br>
        <mat-form-field appearance="fill">
          <mat-label>{{'propertiesPanel.zIndex' | translate }}</mat-label>
          <input matInput type="number" #zIndex="ngModel"
                 [ngModel]="positionProperties.zIndex"
                 (ngModelChange)="updateModel.emit({ property: 'zIndex',
                                                         value: $event,
                                                         isInputValid: zIndex.valid && $event !== null })"
                 (change)="positionProperties.zIndex = positionProperties.zIndex ? positionProperties.zIndex : 0"
                 matTooltip="Priorität beim Stapeln von Elementen. Der höhere Index erscheint vorne.">
        </mat-form-field>
      </ng-container>
    </fieldset>
  `,
  styles: [
    'mat-form-field {width: 140px;}',
    '.flex-row {display: flex; flex-direction: row; gap: 10px;}'
  ]
})
export class PositionFieldSetComponent {
  @Input() positionProperties!: PositionProperties;
  @Input() isZIndexDisabled: boolean = false;
  @Output() updateModel =
    new EventEmitter<{
      property: string;
      value: UIElementValue,
      isInputValid?: boolean | null
    }>();

  constructor(public unitService: UnitService, public selectionService: SelectionService) {}
}
