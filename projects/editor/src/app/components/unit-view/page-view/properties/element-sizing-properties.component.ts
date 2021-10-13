import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { UnitService } from '../../../../unit.service';
import { SelectionService } from '../../../../selection.service';

@Component({
  selector: 'app-element-sizing-properties',
  template: `
    <div fxLayout="column">
      <ng-container *ngIf="!combinedProperties.dynamicPositioning; else elseBlock">
        <mat-form-field appearance="fill">
          <mat-label>Breite</mat-label>
          <input matInput type="number" #width="ngModel" min="0"
                 [ngModel]="combinedProperties.width"
                 (ngModelChange)="updateModel.emit({ property: 'width', value: $event, isInputValid: width.valid })">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Hoehe</mat-label>
          <input matInput type="number" #height="ngModel" min="0"
                 [ngModel]="combinedProperties.height"
                 (ngModelChange)="updateModel.emit({ property: 'height', value: $event, isInputValid: height.valid })">
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>X Position</mat-label>
          <input matInput type="number" #xPosition="ngModel" min="0"
                 [ngModel]="combinedProperties.xPosition"
                 (ngModelChange)="updateModel.emit(
                    { property: 'xPosition', value: $event, isInputValid: xPosition.valid })">
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Y Position</mat-label>
          <input matInput type="number" #yPosition="ngModel" min="0"
                 [ngModel]="combinedProperties.yPosition"
                 (ngModelChange)="updateModel.emit(
                    { property: 'yPosition', value: $event, isInputValid: yPosition.valid })">
        </mat-form-field>
      </ng-container>
      <ng-template #elseBlock>
        <mat-form-field appearance="fill">
          <mat-label>Mindestbreite</mat-label>
          <input matInput type="number" #width="ngModel" min="0"
                 [ngModel]="combinedProperties.width"
                 (ngModelChange)="updateModel.emit({ property: 'width', value: $event, isInputValid: width.valid })">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Mindesthöhe</mat-label>
          <input matInput type="number" #height="ngModel" min="0"
                 [ngModel]="combinedProperties.height"
                 (ngModelChange)="updateModel.emit({ property: 'height', value: $event, isInputValid: height.valid })">
        </mat-form-field>

        Grid
        <div class="input-group">
          <div fxLayoutAlign="row">
            <mat-form-field class="small-input">
              <mat-label>Start-Spalte</mat-label>
              <input matInput type="number" [ngModel]="combinedProperties.gridColumnStart"
                     (ngModelChange)="updateModel.emit({ property: 'gridColumnStart', value: $event })">
            </mat-form-field>
            <mat-form-field class="small-input">
              <mat-label>End-Spalte</mat-label>
              <input matInput type="number" [ngModel]="combinedProperties.gridColumnEnd"
                     (ngModelChange)="updateModel.emit({ property: 'gridColumnEnd', value: $event })">
            </mat-form-field>
          </div>
          <div fxLayoutAlign="row">
            <mat-form-field class="small-input">
              <mat-label>Start-Zeile</mat-label>
              <input matInput type="number" [ngModel]="combinedProperties.gridRowStart"
                     (ngModelChange)="updateModel.emit({ property: 'gridRowStart', value: $event })">
            </mat-form-field>
            <mat-form-field class="small-input">
              <mat-label>End-Zeile</mat-label>
              <input matInput type="number" [ngModel]="combinedProperties.gridRowEnd"
                     (ngModelChange)="updateModel.emit({ property: 'gridRowEnd', value: $event })">
            </mat-form-field>
          </div>
        </div>

        Abstand
        <div class="input-group">
          <mat-form-field class="centered-form-field small-input">
            <mat-label>oben</mat-label>
            <input matInput type="number" #marginTop="ngModel" min="0"
                   [ngModel]="combinedProperties.marginTop"
                   (ngModelChange)="updateModel.emit(
                      { property: 'marginTop', value: $event, isInputValid: marginTop.valid })">
          </mat-form-field>
          <div fxLayoutAlign="row">
            <mat-form-field class="small-input">
              <mat-label>links</mat-label>
              <input matInput type="number" #marginLeft="ngModel" min="0"
                     [ngModel]="combinedProperties.marginLeft"
                     (ngModelChange)="updateModel.emit(
                        { property: 'marginLeft', value: $event, isInputValid: marginLeft.valid })">
            </mat-form-field>
            <mat-form-field class="right-form-field small-input">
              <mat-label>rechts</mat-label>
              <input matInput type="number" #marginRight="ngModel" min="0"
                     [ngModel]="combinedProperties.marginRight"
                     (ngModelChange)="updateModel.emit(
                        { property: 'marginRight', value: $event, isInputValid: marginRight.valid })">
            </mat-form-field>
          </div>
          <mat-form-field class="centered-form-field small-input">
            <mat-label>unten</mat-label>
            <input matInput type="number" #marginBottom="ngModel" min="0"
                   [ngModel]="combinedProperties.marginBottom"
                   (ngModelChange)="updateModel.emit(
                      { property: 'marginBottom', value: $event, isInputValid: marginBottom.valid })">
          </mat-form-field>
        </div>
      </ng-template>

      <mat-form-field appearance="fill">
        <mat-label>Z-Index</mat-label>
        <input matInput type="number" #zIndex="ngModel" min="0"
               [ngModel]="combinedProperties.zIndex"
               (ngModelChange)="updateModel.emit({ property: 'zIndex', value: $event, isInputValid: zIndex.valid })"
               matTooltip="Priorität beim Stapeln von Elementen. Der höhere Index erscheint vorne.">
      </mat-form-field>
      <ng-container *ngIf="(selectionService.selectedElements | async)!.length > 1">
        Ausrichtung
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
  @Input() combinedProperties: Record<string, string | number | boolean | string[] | undefined> = {};
  @Output() updateModel =
  new EventEmitter<{ property: string; value: string | boolean, isInputValid?: boolean | null }>();

  constructor(private unitService: UnitService, public selectionService: SelectionService) { }

  alignElements(direction: 'left' | 'right' | 'top' | 'bottom'): void {
    this.unitService.alignElements(this.selectionService.getSelectedElements(), direction);
  }
}
