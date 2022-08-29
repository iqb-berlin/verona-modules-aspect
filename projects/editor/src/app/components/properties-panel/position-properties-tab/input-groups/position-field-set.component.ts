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
           fxLayout="row" fxLayoutGap="10px">
        <mat-form-field *ngIf="!positionProperties.dynamicPositioning &&
                               positionProperties.xPosition !== undefined"
                        fxFlex>
          <mat-label>{{'propertiesPanel.xPosition' | translate }}</mat-label>
          <input matInput type="number" #xPosition="ngModel" min="0"
                 [ngModel]="positionProperties.xPosition"
                 (ngModelChange)="updateModel.emit(
                        { property: 'xPosition', value: $event, isInputValid: xPosition.valid && $event !== null })">
        </mat-form-field>
        <mat-form-field *ngIf="!positionProperties.dynamicPositioning &&
                                 positionProperties.yPosition !== undefined"
                        fxFlex>
          <mat-label>{{'propertiesPanel.yPosition' | translate }}</mat-label>
          <input matInput type="number" #yPosition="ngModel" min="0"
                 [ngModel]="positionProperties.yPosition"
                 (ngModelChange)="updateModel.emit(
                        { property: 'yPosition', value: $event, isInputValid: yPosition.valid && $event !== null })">
        </mat-form-field>
      </div>

      <ng-template #elseBlock>
        {{'propertiesPanel.grid' | translate }}
        <div fxLayout="row" fxLayoutGap="10px">
          <mat-form-field fxFlex>
            <mat-label>{{'column' | translate }}</mat-label>
            <input matInput type="number" [ngModel]="positionProperties.gridColumn"
                   (ngModelChange)="updateModel.emit({ property: 'gridColumn', value: $event })">
          </mat-form-field>
          <mat-form-field fxFlex="40">
            <mat-label>{{'propertiesPanel.columnRange' | translate }}</mat-label>
            <input matInput type="number"
                   [ngModel]="positionProperties.gridColumnRange"
                   (ngModelChange)="updateModel.emit({ property: 'gridColumnRange', value: $event })">
          </mat-form-field>
        </div>
        <div fxLayout="row" fxLayoutGap="10px">
          <mat-form-field fxFlex>
            <mat-label>{{'row' | translate }}</mat-label>
            <input matInput type="number" [ngModel]="positionProperties.gridRow"
                   (ngModelChange)="updateModel.emit({ property: 'gridRow', value: $event })">
          </mat-form-field>
          <mat-form-field fxFlex="40">
            <mat-label>{{'propertiesPanel.rowRange' | translate }}</mat-label>
            <input matInput type="number"
                   [ngModel]="positionProperties.gridRowRange"
                   (ngModelChange)="updateModel.emit({ property: 'gridRowRange', value: $event })">
          </mat-form-field>
        </div>

        {{'propertiesPanel.margin' | translate }}
        <div fxLayout="column" class="margin-controls">
          <mat-form-field fxFlexAlign="center">
            <mat-label>{{'propertiesPanel.top' | translate }}</mat-label>
            <input matInput type="number" #marginTop="ngModel"
                   [ngModel]="positionProperties.marginTop"
                   (ngModelChange)="updateModel.emit(
                          { property: 'marginTop', value: $event, isInputValid: marginTop.valid && $event !== null })">
          </mat-form-field>
          <div fxLayout="row" fxLayoutAlign="space-around center">
            <mat-form-field>
              <mat-label>{{'propertiesPanel.left' | translate }}</mat-label>
              <input matInput type="number" #marginLeft="ngModel"
                     [ngModel]="positionProperties.marginLeft"
                     (ngModelChange)="updateModel.emit({
                       property: 'marginLeft',
                       value: $event,
                       isInputValid: marginLeft.valid && $event !== null
                     })">
            </mat-form-field>
            <mat-form-field>
              <mat-label>{{'propertiesPanel.right' | translate }}</mat-label>
              <input matInput type="number" #marginRight="ngModel"
                     [ngModel]="positionProperties.marginRight"
                     (ngModelChange)="updateModel.emit(
                            { property: 'marginRight',
                              value: $event,
                              isInputValid: marginRight .valid && $event !== null })">
            </mat-form-field>
          </div>
          <mat-form-field fxFlexAlign="center">
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
    '.margin-controls mat-form-field {width: 100px;}',
    '.margin-controls {margin-bottom: 10px;}',
    'mat-form-field {width: 110px;}'
  ]
})
export class PositionFieldSetComponent {
  @Input() positionProperties!: PositionProperties;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean, isInputValid?: boolean | null }>();
}
