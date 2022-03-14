import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { UnitService } from '../../../../../services/unit.service';
import { SelectionService } from '../../../../../services/selection.service';
import { PositionedElement, PositionProperties } from '../../../../../../../../common/interfaces/elements';

@Component({
  selector: 'aspect-element-postion-properties',
  template: `
    <div fxLayout="column">
      <aspect-position-field-set [positionProperties]="positionProperties"
                                 (updateModel)="this.updateModel.emit($event)">
      </aspect-position-field-set>

      <aspect-dimension-field-set [positionProperties]="positionProperties"
                                  [dimensions]="dimensions"
                                  (updateModel)="this.updateModel.emit($event)">
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
  @Input() dimensions!: { width: number; height: number; };
  @Input() positionProperties!: PositionProperties;
  @Output() updateModel =
  new EventEmitter<{ property: string; value: string | number | boolean, isInputValid?: boolean | null }>();

  constructor(private unitService: UnitService, public selectionService: SelectionService) { }

  alignElements(direction: 'left' | 'right' | 'top' | 'bottom'): void {
    this.unitService.alignElements(this.selectionService.getSelectedElements() as PositionedElement[], direction);
  }
}
