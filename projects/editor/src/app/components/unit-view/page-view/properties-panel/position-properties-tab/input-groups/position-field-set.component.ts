import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { PositionProperties } from '../../../../../../../../../common/interfaces/elements';

@Component({
  selector: 'aspect-position-field-set',
  template: `
    <fieldset>
      <legend>Position</legend>
      <ng-container *ngIf="!positionProperties.dynamicPositioning; else elseBlock">
        <mat-form-field *ngIf="!positionProperties.dynamicPositioning &&
                               positionProperties.xPosition !== undefined" appearance="fill">
          <mat-label>{{'propertiesPanel.xPosition' | translate }}</mat-label>
          <input matInput type="number" #xPosition="ngModel" min="0"
                 [ngModel]="positionProperties.xPosition"
                 (ngModelChange)="updateModel.emit(
                        { property: 'xPosition', value: $event, isInputValid: xPosition.valid && $event !== null })">
        </mat-form-field>
        <mat-form-field *ngIf="!positionProperties.dynamicPositioning &&
                                 positionProperties.yPosition !== undefined" appearance="fill">
          <mat-label>{{'propertiesPanel.yPosition' | translate }}</mat-label>
          <input matInput type="number" #yPosition="ngModel" min="0"
                 [ngModel]="positionProperties.yPosition"
                 (ngModelChange)="updateModel.emit(
                        { property: 'yPosition', value: $event, isInputValid: yPosition.valid && $event !== null })">
        </mat-form-field>
      </ng-container>

      <ng-template #elseBlock>
        {{'propertiesPanel.grid' | translate }}
        <div class="input-group">
          <mat-form-field>
            <mat-label>{{'propertiesPanel.column' | translate }}</mat-label>
            <input matInput type="number" [ngModel]="positionProperties.gridColumn"
                   (ngModelChange)="updateModel.emit({ property: 'gridColumn', value: $event })">
          </mat-form-field>
          <mat-form-field>
            <mat-label>{{'propertiesPanel.row' | translate }}</mat-label>
            <input matInput type="number" [ngModel]="positionProperties.gridRow"
                   (ngModelChange)="updateModel.emit({ property: 'gridRow', value: $event })">
          </mat-form-field>

          <mat-form-field>
            <mat-label>{{'propertiesPanel.columnRange' | translate }}</mat-label>
            <input matInput type="number"
                   [ngModel]="positionProperties.gridColumnRange"
                   (ngModelChange)="updateModel.emit({ property: 'gridColumnRange', value: $event })">
          </mat-form-field>
          <mat-form-field>
            <mat-label>{{'propertiesPanel.rowRange' | translate }}</mat-label>
            <input matInput type="number"
                   [ngModel]="positionProperties.gridRowRange"
                   (ngModelChange)="updateModel.emit({ property: 'gridRowRange', value: $event })">
          </mat-form-field>
        </div>

        {{'propertiesPanel.margin' | translate }}
        <div class="input-group">
          <mat-form-field class="centered-form-field small-input">
            <mat-label>{{'propertiesPanel.top' | translate }}</mat-label>
            <input matInput type="number" #marginTop="ngModel"
                   [ngModel]="positionProperties.marginTop"
                   (ngModelChange)="updateModel.emit(
                          { property: 'marginTop', value: $event, isInputValid: marginTop.valid && $event !== null })">
          </mat-form-field>
          <div fxLayoutAlign="row">
            <mat-form-field class="small-input">
              <mat-label>{{'propertiesPanel.left' | translate }}</mat-label>
              <input matInput type="number" #marginLeft="ngModel"
                     [ngModel]="positionProperties.marginLeft"
                     (ngModelChange)="updateModel.emit({
                       property: 'marginLeft',
                       value: $event,
                       isInputValid: marginLeft.valid && $event !== null
                     })">
            </mat-form-field>
            <mat-form-field class="right-form-field small-input">
              <mat-label>{{'propertiesPanel.right' | translate }}</mat-label>
              <input matInput type="number" #marginRight="ngModel"
                     [ngModel]="positionProperties.marginRight"
                     (ngModelChange)="updateModel.emit(
                            { property: 'marginRight',
                              value: $event,
                              isInputValid: marginRight .valid && $event !== null })">
            </mat-form-field>
          </div>
          <mat-form-field class="centered-form-field small-input">
            <mat-label>{{'propertiesPanel.bottom' | translate }}</mat-label>
            <input matInput type="number" #marginBottom="ngModel"
                   [ngModel]="positionProperties.marginBottom"
                   (ngModelChange)="updateModel.emit(
                          { property: 'marginBottom',
                            value: $event,
                            isInputValid: marginBottom .valid && $event !== null })">
          </mat-form-field>
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
    '.centered-form-field {margin-left: 25%;}',
    '.right-form-field {margin-left: 15px;}',
    '.input-group {background-color: rgba(0,0,0,.04); margin-bottom: 10px;}',
    '.mat-form-field {display: inline;}',
    '.small-input {display: inline-block;}',
    '::ng-deep aspect-position-field-set .small-input .mat-form-field-infix {width: 100px; margin: 0 5px;}'
  ]
})
export class PositionFieldSetComponent {
  @Input() positionProperties!: PositionProperties;
  @Output() updateModel =
  new EventEmitter<{ property: string; value: string | number | boolean, isInputValid?: boolean | null }>();
}
