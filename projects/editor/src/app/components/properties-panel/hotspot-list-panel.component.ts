import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import { Hotspot } from 'common/models/elements/element';

@Component({
  selector: 'aspect-hotspot-list-panel',
  template: `
    <fieldset fxLayout="column">
      <legend>{{title | translate }}</legend>
      <button mat-mini-fab matSuffix color="primary" [style.bottom.px]="3" fxFlexAlign="end"
              (click)="addListItem();">
        <mat-icon>add</mat-icon>
      </button>

      <div class="drop-list" cdkDropList [cdkDropListData]="itemList"
           (cdkDropListDropped)="moveListValue($event)">
        <div *ngFor="let item of itemList; let i = index" cdkDrag
             class="option-draggable" fxLayout="row">
          <div fxFlex fxFlexAlign="center">{{'hotspot.'+item.shape | translate}}({{i + 1}})</div>
          <button mat-icon-button color="primary"
                  (click)="editItem.emit(i)">
            <mat-icon>build</mat-icon>
          </button>
          <button mat-icon-button color="primary"
                  (click)="removeListItem(i)">
            <mat-icon>clear</mat-icon>
          </button>
        </div>
      </div>
    </fieldset>
  `
})
export class HotspotListPanelComponent {
  @Input() title!: string;
  @Input() textFieldLabel!: string;
  @Input() itemList!: Hotspot[];
  @Output() addItem = new EventEmitter<void>();
  @Output() removeItem = new EventEmitter<number>();
  @Output() editItem = new EventEmitter<number>();
  @Output() changedItemOrder = new EventEmitter<{ previousIndex: number, currentIndex: number }>();

  addListItem(): void {
    this.addItem.emit();
  }

  removeListItem(itemIndex: number): void {
    this.removeItem.emit(itemIndex);
  }

  moveListValue(event: CdkDragDrop<Hotspot[]>): void {
    this.changedItemOrder.emit({ previousIndex: event.previousIndex, currentIndex: event.currentIndex });
  }
}
