import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import { Hotspot } from 'common/models/elements/element';

@Component({
  selector: 'aspect-hotspot-list-panel',
  template: `
    <fieldset class="fx-column-start-stretch">
      <legend>{{title | translate }}</legend>
      <button class="fx-align-self-end" mat-mini-fab matSuffix color="primary" [style.bottom.px]="3"
              (click)="addListItem();">
        <mat-icon>add</mat-icon>
      </button>

      <div class="drop-list" cdkDropList [cdkDropListData]="itemList"
           (cdkDropListDropped)="moveListValue($event)">
        <div *ngFor="let item of itemList; let i = index" cdkDrag
             class="option-draggable fx-row-start-stretch">
          <div class="fx-flex fx-align-self-center">{{'hotspot.'+item.shape | translate}}({{i + 1}})</div>
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
  `,
  styles: [`
    .fx-column-start-stretch {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
    }

    .fx-row-start-stretch {
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: stretch;
    }

    .fx-align-self-end {
      align-self: flex-end;
    }

    .fx-align-self-center {
      align-self: center;
    }

    .fx-flex {
      flex: 1 1 0;
      box-sizing: border-box;
    }
  `]
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
