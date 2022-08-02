import {
  Component, Input
} from '@angular/core';
import { UnitService } from '../../../services/unit.service';
import { SelectionService } from '../../../services/selection.service';
import { PositionedUIElement, PositionProperties } from 'common/models/elements/element';

@Component({
  selector: 'aspect-element-postion-properties',
  template: `
    <div fxLayout="column">
      <aspect-position-field-set
        *ngIf="positionProperties"
        [positionProperties]="positionProperties"
        (updateModel)="unitService.updateSelectedElementsPositionProperty($event.property, $event.value)">
      </aspect-position-field-set>

      <aspect-dimension-field-set
        [positionProperties]="positionProperties"
        [dimensions]="dimensions">
      </aspect-dimension-field-set>

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
    </div>
  `,
  styles: [
    'aspect-position-field-set {margin-bottom: 20px;}',
    ':host ::ng-deep fieldset {padding-bottom: 0;}'
  ]
})
export class ElementPositionPropertiesComponent {
  @Input() dimensions!: { width?: number; height?: number; dynamicWidth: boolean; };
  @Input() positionProperties: PositionProperties | undefined;

  constructor(public unitService: UnitService, public selectionService: SelectionService) { }

  alignElements(direction: 'left' | 'right' | 'top' | 'bottom'): void {
    this.unitService.alignElements(this.selectionService.getSelectedElements() as PositionedUIElement[], direction);
  }
}
