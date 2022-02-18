import {
  Component, Input, Output, EventEmitter, OnInit
} from '@angular/core';
import { UnitService } from '../../../../services/unit.service';
import { SelectionService } from '../../../../services/selection.service';
import { PositionedElement, PositionProperties } from '../../../../../../../common/interfaces/elements';
import { ElementPropertiesComponent } from './element-properties.component';

@Component({
  selector: 'aspect-element-postion-properties',
  template: `
    <div fxLayout="column">
      <mat-checkbox *ngIf="positionProperties.dynamicWidth !== undefined"
                    [checked]="$any(positionProperties.dynamicWidth)"
                    (change)="updateModel.emit({ property: 'dynamicWidth', value: $event.checked })">
        {{'propertiesPanel.dynamicWidth' | translate }}
      </mat-checkbox>

      <ng-container *ngIf="!positionProperties.dynamicPositioning; else elseBlock">
        <mat-form-field *ngIf="positionProperties.dynamicWidth === undefined ||
                               !positionProperties.dynamicWidth" appearance="fill">
          <mat-label>{{'propertiesPanel.width' | translate }}</mat-label>
          <input matInput type="number" #width="ngModel" min="0"
                 [ngModel]="positionProperties.width"
                 (ngModelChange)="updateModel.emit({ property: 'width',
                                                     value: $event,
                                                     isInputValid: width.valid && $event !== null})">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>{{'propertiesPanel.height' | translate }}</mat-label>
          <input matInput type="number" #height="ngModel" min="0"
                 [ngModel]="positionProperties.height"
                 (ngModelChange)="updateModel.emit({ property: 'height',
                                                     value: $event,
                                                     isInputValid: height.valid && $event !== null})">
        </mat-form-field>

        <mat-form-field *ngIf="positionProperties.xPosition !== undefined" appearance="fill">
          <mat-label>{{'propertiesPanel.xPosition' | translate }}</mat-label>
          <input matInput type="number" #xPosition="ngModel" min="0"
                 [ngModel]="positionProperties.xPosition"
                 (ngModelChange)="updateModel.emit(
                    { property: 'xPosition', value: $event, isInputValid: xPosition.valid && $event !== null })">
        </mat-form-field>

        <mat-form-field *ngIf="positionProperties.yPosition !== undefined" appearance="fill">
          <mat-label>{{'propertiesPanel.yPosition' | translate }}</mat-label>
          <input matInput type="number" #yPosition="ngModel" min="0"
                 [ngModel]="positionProperties.yPosition"
                 (ngModelChange)="updateModel.emit(
                    { property: 'yPosition', value: $event, isInputValid: yPosition.valid && $event !== null })">
        </mat-form-field>
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
        <ng-container *ngIf="(selectionService.selectedElements | async)!.length > 1">
          {{'propertiesPanel.alignment' | translate }}
          <div class="alignment-button-group" [style.margin]="'10px 0'"
               fxLayout="row" fxLayoutAlign="space-evenly center">
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
      </ng-container>
      <ng-template #elseBlock>
        <mat-checkbox *ngIf="positionProperties.positionProps !== undefined"
                      matTooltip="Element ist nicht mehr dynamisch. Die eingestellte Größe wird benutzt."
                      [checked]="$any(positionProperties.fixedSize)"
                      (change)="updateModel.emit({ property: 'fixedSize', value: $event.checked })">
          {{'propertiesPanel.fixedSize' | translate }}
        </mat-checkbox>

        <mat-form-field appearance="fill" *ngIf="positionProperties.positionProps !== undefined">
          <mat-label *ngIf="!positionProperties.fixedSize">
            {{'propertiesPanel.minWidth' | translate }}
          </mat-label>
          <mat-label *ngIf="positionProperties.fixedSize">
            {{'propertiesPanel.width' | translate }}
          </mat-label>
          <input matInput type="number" #width="ngModel" min="0"
                 [ngModel]="positionProperties.width"
                 (ngModelChange)="updateModel.emit({ property: 'width',
                                                     value: $event,
                                                     isInputValid: width.valid && $event !== null })">
        </mat-form-field>

        <mat-checkbox *ngIf="positionProperties.positionProps && !positionProperties.fixedSize"
                      [checked]="$any(positionProperties.useMinHeight)"
                      (change)="updateModel.emit({ property: 'useMinHeight', value: $event.checked })">
          {{'propertiesPanel.useMinHeight' | translate }}
        </mat-checkbox>

        <mat-form-field *ngIf="positionProperties.positionProps &&
                               positionProperties.useMinHeight ||
                               positionProperties.positionProps &&
                               positionProperties.fixedSize" appearance="fill">
          <mat-label *ngIf="!positionProperties.fixedSize">
            {{'propertiesPanel.minHeight' | translate }}
          </mat-label>
          <mat-label *ngIf="positionProperties.fixedSize">
            {{'propertiesPanel.height' | translate }}
          </mat-label>
          <input matInput type="number" #height="ngModel" min="0"
                 [ngModel]="positionProperties.height"
                 (ngModelChange)="updateModel.emit({ property: 'height',
                                                     value: $event,
                                                     isInputValid: height.valid && $event !== null })">
        </mat-form-field>

        {{'propertiesPanel.grid' | translate }}
        <div class="input-group">
          <div fxLayoutAlign="row">
            <mat-form-field class="small-input">
              <mat-label>{{'propertiesPanel.startColumn' | translate }}</mat-label>
              <input matInput type="number" [ngModel]="positionProperties.gridColumnStart"
                     (ngModelChange)="updateModel.emit({ property: 'gridColumnStart', value: $event })">
            </mat-form-field>
            <mat-form-field class="small-input">
              <mat-label>{{'propertiesPanel.endColumn' | translate }}</mat-label>
              <input matInput type="number" [ngModel]="positionProperties.gridColumnEnd"
                     (ngModelChange)="updateModel.emit({ property: 'gridColumnEnd', value: $event })">
            </mat-form-field>
          </div>
          <div fxLayoutAlign="row">
            <mat-form-field class="small-input">
              <mat-label>{{'propertiesPanel.startRow' | translate }}</mat-label>
              <input matInput type="number" [ngModel]="positionProperties.gridRowStart"
                     (ngModelChange)="updateModel.emit({ property: 'gridRowStart', value: $event })">
            </mat-form-field>
            <mat-form-field class="small-input">
              <mat-label>{{'propertiesPanel.endRow' | translate }}</mat-label>
              <input matInput type="number" [ngModel]="positionProperties.gridRowEnd"
                     (ngModelChange)="updateModel.emit({ property: 'gridRowEnd', value: $event })">
            </mat-form-field>
          </div>
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
                     (ngModelChange)="updateModel.emit(
                        { property: 'marginLeft', value: $event, isInputValid: marginLeft.valid && $event !== null })">
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
      </ng-template>
    </div>
  `,
  styles: [
    '.centered-form-field {margin-left: 25%}',
    '.right-form-field {margin-left: 15%}',
    '.input-group {background-color: rgba(0,0,0,.04); margin-bottom: 10px;}',
    '::ng-deep aspect-element-properties .small-input .mat-form-field-infix {width: 100px; margin: 0 5px;}'
  ]
})
export class ElementPositionPropertiesComponent {
  @Input() positionProperties: PositionProperties = {} as PositionProperties;
  @Output() updateModel =
  new EventEmitter<{ property: string; value: string | boolean, isInputValid?: boolean | null }>();

  constructor(private unitService: UnitService, public selectionService: SelectionService) { }

  // ngOnInit(): void {
  //   this.positionProperties = ElementPropertiesComponent.createCombinedProperties(this.positionProperties);
  // }

  alignElements(direction: 'left' | 'right' | 'top' | 'bottom'): void {
    this.unitService.alignElements(this.selectionService.getSelectedElements() as PositionedElement[], direction);
  }

}
