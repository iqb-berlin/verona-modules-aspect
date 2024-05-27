import {
  Component, Input
} from '@angular/core';
import { PositionedUIElement } from 'common/models/elements/element';
import { DimensionProperties, PositionProperties } from 'common/models/elements/property-group-interfaces';
import { UnitService } from '../../../services/unit-services/unit.service';
import { SelectionService } from '../../../services/selection.service';
import { ElementService } from 'editor/src/app/services/unit-services/element.service';

@Component({
  selector: 'aspect-position-and-dimension-properties',
  template: `
    <div class="fx-column-start-stretch">
      <aspect-position-field-set
        *ngIf="positionProperties"
        [positionProperties]="positionProperties"
        [isZIndexDisabled]="isZIndexDisabled"
        (updateModel)="elementService.updateSelectedElementsPositionProperty($event.property, $event.value)">
      </aspect-position-field-set>

      <aspect-dimension-field-set *ngIf="dimensions"
                                  [positionProperties]="positionProperties"
                                  [dimensions]="dimensions">
      </aspect-dimension-field-set>

      <ng-container *ngIf="(selectionService.selectedElements | async)!.length > 1">
        {{'propertiesPanel.alignment' | translate }}
        <div class="alignment-button-group fx-row-space-evenly-center"
             [style.margin]="'10px 0'">
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
  `
})
export class ElementPositionPropertiesComponent {
  @Input() dimensions!: DimensionProperties | null;
  @Input() positionProperties: PositionProperties | undefined;
  @Input() isZIndexDisabled: boolean = false;

  constructor(public unitService: UnitService,
              public selectionService: SelectionService,
              public elementService: ElementService) { }

  alignElements(direction: 'left' | 'right' | 'top' | 'bottom'): void {
    this.elementService.alignElements(this.selectionService.getSelectedElements() as PositionedUIElement[], direction);
  }
}
