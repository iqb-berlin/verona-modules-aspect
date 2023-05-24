import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { PositionProperties } from 'common/models/elements/element';

@Component({
  selector: 'aspect-position-field-set',
  template: `
    <fieldset>
      <legend>Position</legend>
      <div *ngIf="!positionProperties.dynamicPositioning; else elseBlock"
           class="fx-row-start-stretch fx-fix-gap-10">
        <mat-form-field *ngIf="!positionProperties.dynamicPositioning &&
                               positionProperties.xPosition !== undefined"
                        class="fx-flex">
          <mat-label>{{'propertiesPanel.xPosition' | translate }}</mat-label>
          <input matInput type="number" #xPosition="ngModel" min="0"
                 [ngModel]="positionProperties.xPosition"
                 (ngModelChange)="updateModel.emit(
                        { property: 'xPosition', value: $event, isInputValid: xPosition.valid && $event !== null })">
        </mat-form-field>
        <mat-form-field *ngIf="!positionProperties.dynamicPositioning &&
                                 positionProperties.yPosition !== undefined"
                        class="fx-flex">
          <mat-label>{{'propertiesPanel.yPosition' | translate }}</mat-label>
          <input matInput type="number" #yPosition="ngModel" min="0"
                 [ngModel]="positionProperties.yPosition"
                 (ngModelChange)="updateModel.emit(
                        { property: 'yPosition', value: $event, isInputValid: yPosition.valid && $event !== null })">
        </mat-form-field>
      </div>

      <ng-template #elseBlock>
        {{'propertiesPanel.grid' | translate }}
        <div class="fx-row-start-stretch fx-fix-gap-10">
          <mat-form-field class="fx-flex">
            <mat-label>{{'column' | translate }}</mat-label>
            <input matInput type="number" [ngModel]="positionProperties.gridColumn"
                   (ngModelChange)="updateModel.emit({ property: 'gridColumn', value: $event })">
          </mat-form-field>
          <mat-form-field class="fx-flex-40">
            <mat-label>{{'propertiesPanel.columnRange' | translate }}</mat-label>
            <input matInput type="number"
                   [ngModel]="positionProperties.gridColumnRange"
                   (ngModelChange)="updateModel.emit({ property: 'gridColumnRange', value: $event })">
          </mat-form-field>
        </div>
        <div class="fx-row-start-stretch fx-fix-gap-10">
          <mat-form-field class="fx-flex">
            <mat-label>{{'row' | translate }}</mat-label>
            <input matInput type="number" [ngModel]="positionProperties.gridRow"
                   (ngModelChange)="updateModel.emit({ property: 'gridRow', value: $event })">
          </mat-form-field>
          <mat-form-field class="fx-flex-40">
            <mat-label>{{'propertiesPanel.rowRange' | translate }}</mat-label>
            <input matInput type="number"
                   [ngModel]="positionProperties.gridRowRange"
                   (ngModelChange)="updateModel.emit({ property: 'gridRowRange', value: $event })">
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

      <mat-form-field *ngIf="positionProperties.zIndex !== undefined" appearance="fill">
        <mat-label>{{'propertiesPanel.zIndex' | translate }}</mat-label>
        <input matInput type="number" #zIndex="ngModel"
               [ngModel]="positionProperties.zIndex"
               (ngModelChange)="updateModel.emit({ property: 'zIndex',
                                                       value: $event,
                                                       isInputValid: zIndex.valid && $event !== null })"
               matTooltip="Priorität beim Stapeln von Elementen. Der höhere Index erscheint vorne.">
        <!--        TODO translate-->
      </mat-form-field>
    </fieldset>
  `,
  styles: [
    'mat-form-field {width: 110px;}'
  ]
})
export class PositionFieldSetComponent {
  @Input() positionProperties!: PositionProperties;
  @Output() updateModel =
    new EventEmitter<{
      property: string;
      value: UIElementValue,
      isInputValid?: boolean | null
    }>();
}
