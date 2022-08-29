import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import { Label } from 'common/models/elements/element';

@Component({
  selector: 'aspect-option-list-panel',
  template: `
    <fieldset fxLayout="column">
      <legend>{{title | translate }}</legend>
      <mat-form-field appearance="outline">
        <mat-label>{{textFieldLabel}}</mat-label>
        <input #newItem matInput type="text" placeholder="Fragetext"
               (keyup.enter)="addListItem(newItem.value); newItem.select()">
        <button mat-mini-fab matSuffix color="primary" [style.bottom.px]="3"
                (click)="addListItem(newItem.value); newItem.select()">
          <mat-icon>add</mat-icon>
        </button>
      </mat-form-field>

      <div class="drop-list" cdkDropList [cdkDropListData]="itemList"
           (cdkDropListDropped)="moveListValue($event)">
        <div *ngFor="let item of itemList; let i = index" cdkDrag
             class="option-draggable" fxLayout="row">
          <div fxFlex fxFlexAlign="center" [innerHTML]="item.text"></div>
          <img [src]="$any(item).imgSrc"
               [style.object-fit]="'scale-down'" [style.height.px]="40">
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
export class OptionListPanelComponent {
  @Input() title!: string;
  @Input() textFieldLabel!: string;
  @Input() itemList!: Label[];
  @Output() addItem = new EventEmitter<string>();
  @Output() removeItem = new EventEmitter<number>();
  @Output() editItem = new EventEmitter<number>();
  @Output() changedItemOrder = new EventEmitter<{ previousIndex: number, currentIndex: number }>();

  addListItem(text: string): void {
    this.addItem.emit(text);
  }

  removeListItem(itemIndex: number): void {
    this.removeItem.emit(itemIndex);
  }

  moveListValue(event: CdkDragDrop<Label[]>): void {
    this.changedItemOrder.emit({ previousIndex: event.previousIndex, currentIndex: event.currentIndex });
  }
}
