import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { UnitService } from '../../../unit.service';
import { SelectionService } from '../../../selection.service';
import { UIElement } from '../../../../../../common/models/uI-element';

@Component({
  selector: 'app-element-sizing-properties',
  template: `
    <div fxLayout="column">
      <ng-container *ngIf="!combinedProperties.dynamicPositioning; else elseBlock">
        <mat-form-field appearance="fill">
          <mat-label>{{'propertiesPanel.width' | translate }}</mat-label>
          <input matInput type="number" #width="ngModel" min="0"
                 [ngModel]="combinedProperties.width"
                 (ngModelChange)="updateModel.emit({ property: 'width',
                                                     value: $event,
                                                     isInputValid: width.valid && $event !== null})">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>{{'propertiesPanel.height' | translate }}</mat-label>
          <input matInput type="number" #height="ngModel" min="0"
                 [ngModel]="combinedProperties.height"
                 (ngModelChange)="updateModel.emit({ property: 'height',
                                                     value: $event,
                                                     isInputValid: height.valid && $event !== null})">
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>{{'propertiesPanel.xPosition' | translate }}</mat-label>
          <input matInput type="number" #xPosition="ngModel" min="0"
                 [ngModel]="combinedProperties.xPosition"
                 (ngModelChange)="updateModel.emit(
                    { property: 'xPosition', value: $event, isInputValid: xPosition.valid && $event !== null })">
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>{{'propertiesPanel.yPosition' | translate }}</mat-label>
          <input matInput type="number" #yPosition="ngModel" min="0"
                 [ngModel]="combinedProperties.yPosition"
                 (ngModelChange)="updateModel.emit(
                    { property: 'yPosition', value: $event, isInputValid: yPosition.valid && $event !== null })">
        </mat-form-field>
      </ng-container>
      <ng-template #elseBlock>
        <mat-form-field appearance="fill">
          <mat-label>{{'propertiesPanel.minWidth' | translate }}</mat-label>
          <input matInput type="number" #width="ngModel" min="0"
                 [ngModel]="combinedProperties.width"
                 (ngModelChange)="updateModel.emit({ property: 'width',
                                                     value: $event,
                                                     isInputValid: width.valid && $event !== null })">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>{{'propertiesPanel.minHeight' | translate }}</mat-label>
          <input matInput type="number" #height="ngModel" min="0"
                 [ngModel]="combinedProperties.height"
                 (ngModelChange)="updateModel.emit({ property: 'height',
                                                     value: $event,
                                                     isInputValid: height.valid && $event !== null })">
        </mat-form-field>

        {{'propertiesPanel.grid' | translate }}
        <div class="input-group">
          <div fxLayoutAlign="row">
            <mat-form-field class="small-input">
              <mat-label>{{'propertiesPanel.startColumn' | translate }}</mat-label>
              <input matInput type="number" [ngModel]="combinedProperties.gridColumnStart"
                     (ngModelChange)="updateModel.emit({ property: 'gridColumnStart', value: $event })">
            </mat-form-field>
            <mat-form-field class="small-input">
              <mat-label>{{'propertiesPanel.endColumn' | translate }}</mat-label>
              <input matInput type="number" [ngModel]="combinedProperties.gridColumnEnd"
                     (ngModelChange)="updateModel.emit({ property: 'gridColumnEnd', value: $event })">
            </mat-form-field>
          </div>
          <div fxLayoutAlign="row">
            <mat-form-field class="small-input">
              <mat-label>{{'propertiesPanel.startRow' | translate }}</mat-label>
              <input matInput type="number" [ngModel]="combinedProperties.gridRowStart"
                     (ngModelChange)="updateModel.emit({ property: 'gridRowStart', value: $event })">
            </mat-form-field>
            <mat-form-field class="small-input">
              <mat-label>{{'propertiesPanel.endRow' | translate }}</mat-label>
              <input matInput type="number" [ngModel]="combinedProperties.gridRowEnd"
                     (ngModelChange)="updateModel.emit({ property: 'gridRowEnd', value: $event })">
            </mat-form-field>
          </div>
        </div>

        {{'propertiesPanel.margin' | translate }}
        <div class="input-group">
          <mat-form-field class="centered-form-field small-input">
            <mat-label>{{'propertiesPanel.top' | translate }}</mat-label>
            <input matInput type="number" #marginTop="ngModel" min="0"
                   [ngModel]="combinedProperties.marginTop"
                   (ngModelChange)="updateModel.emit(
                      { property: 'marginTop', value: $event, isInputValid: marginTop.valid && $event !== null })">
          </mat-form-field>
          <div fxLayoutAlign="row">
            <mat-form-field class="small-input">
              <mat-label>{{'propertiesPanel.left' | translate }}</mat-label>
              <input matInput type="number" #marginLeft="ngModel" min="0"
                     [ngModel]="combinedProperties.marginLeft"
                     (ngModelChange)="updateModel.emit(
                        { property: 'marginLeft', value: $event, isInputValid: marginLeft.valid && $event !== null })">
            </mat-form-field>
            <mat-form-field class="right-form-field small-input">
              <mat-label>{{'propertiesPanel.right' | translate }}</mat-label>
              <input matInput type="number" #marginRight="ngModel" min="0"
                     [ngModel]="combinedProperties.marginRight"
                     (ngModelChange)="updateModel.emit(
                        { property: 'marginRight',
                          value: $event,
                          isInputValid: marginRight .valid && $event !== null })">
            </mat-form-field>
          </div>
          <mat-form-field class="centered-form-field small-input">
            <mat-label>{{'propertiesPanel.bottom' | translate }}</mat-label>
            <input matInput type="number" #marginBottom="ngModel" min="0"
                   [ngModel]="combinedProperties.marginBottom"
                   (ngModelChange)="updateModel.emit(
                      { property: 'marginBottom',
                        value: $event,
                        isInputValid: marginBottom .valid && $event !== null })">
          </mat-form-field>
        </div>
      </ng-template>

      <mat-form-field appearance="fill">
        <mat-label>{{'propertiesPanel.zIndex' | translate }}</mat-label>
        <input matInput type="number" #zIndex="ngModel" min="0"
               [ngModel]="combinedProperties.zIndex"
               (ngModelChange)="updateModel.emit({ property: 'zIndex',
                                                   value: $event,
                                                   isInputValid: zIndex.valid && $event !== null })"
               matTooltip="Priorität beim Stapeln von Elementen. Der höhere Index erscheint vorne.">
      </mat-form-field>
      <ng-container *ngIf="(selectionService.selectedElements | async)!.length > 1">
        {{'propertiesPanel.alignment' | translate }}
        <div class="alignment-button-group" fxLayout="row" fxLayoutAlign="center center">
          <button (click)="alignElements('left')">
            <mat-icon>align_horizontal_left</mat-icon>
          </button>
          <button (click)="alignElements('right')">
            <mat-icon>align_horizontal_right</mat-icon>
          </button>
          <button (click)="alignElements('top')">
            <mat-icon>align_vertical_top</mat-icon>
          </button>
          <button (click)="alignElements('bottom')">
            <mat-icon>align_vertical_bottom</mat-icon>
          </button>
        </div>
      </ng-container>
    </div>
  `,
  styles: [
    '.centered-form-field {margin-left: 25%}',
    '.right-form-field {margin-left: 15%}',
    '.input-group {background-color: rgba(0,0,0,.04); margin-bottom: 10px;}',
    '::ng-deep app-element-properties .small-input .mat-form-field-infix {width: 95px; margin: 0 5px;}'
  ]
})
export class ElementSizingPropertiesComponent {
  @Input() combinedProperties: UIElement = {} as UIElement;
  @Output() updateModel =
  new EventEmitter<{ property: string; value: string | boolean, isInputValid?: boolean | null }>();

  constructor(private unitService: UnitService, public selectionService: SelectionService) { }

  alignElements(direction: 'left' | 'right' | 'top' | 'bottom'): void {
    this.unitService.alignElements(this.selectionService.getSelectedElements(), direction);
  }
}
