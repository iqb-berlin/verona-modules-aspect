import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Label } from 'common/models/elements/label-interfaces';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from 'common/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel.component';

@Component({
  selector: 'aspect-option-list-panel',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    TranslateModule,
    MatInputModule,
    MatIconModule,
    CdkDropList,
    MatButtonModule,
    SharedModule // TODO make pipe standalone and remove
  ],
  template: `
    <fieldset *ngIf="title" class="fx-column-start-stretch">
      <legend>{{ title | translate }}</legend>
      <ng-container *ngTemplateOutlet="optionList"></ng-container>
    </fieldset>

    <div *ngIf="!title">
      <ng-container *ngTemplateOutlet="optionList"></ng-container>
    </div>

    <ng-template #optionList>
      <mat-form-field appearance="outline">
        <mat-label>{{ textFieldLabel }}</mat-label>
        <textarea #newItem matInput cdkTextareaAutosize type="text"
                  (keydown.enter)="$event.stopPropagation(); $event.preventDefault();"
                  (keyup.enter)="addListItem(newItem.value); newItem.select()"></textarea>
        <button mat-icon-button matSuffix color="primary"
                [disabled]="newItem.value === ''"
                (click)="addListItem(newItem.value); newItem.select()">
          <mat-icon>add</mat-icon>
        </button>
        <button *ngIf="showImageButton"
                mat-icon-button matSuffix color="primary"
                [matTooltip]="'Option mit Bild hinzufügen'"
                (click)="addImageOption()">
          <mat-icon>image</mat-icon>
        </button>
      </mat-form-field>

      <div class="drop-list" cdkDropList [cdkDropListData]="itemList"
           (cdkDropListDropped)="moveListValue($event)">
        <div *ngFor="let item of itemList; let i = index" cdkDrag
             class="option-draggable fx-row-start-stretch">
          <div class="item-box" [style.align-self]="'center'">
            <div *ngIf="$any(item).id" class="item-id">{{ $any(item).id }}</div>
            <div [innerHTML]="item.text | safeResourceHTML"></div>
          </div>
          <img [src]="$any(item).imgSrc"
               [style.object-fit]="'scale-down'" [style.height.px]="40">
          <button mat-icon-button color="primary"
                  (click)="editItem(i)">
            <mat-icon>build</mat-icon>
          </button>
          <button mat-icon-button color="primary"
                  (click)="removeListItem(i)">
            <mat-icon>clear</mat-icon>
          </button>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .item-box {
      align-self: center;
      display: flex;
      flex-direction: column;
      flex: 1 1 0;
    }
    .item-id {
      align-self: start;
      font-size: smaller;
      margin-bottom: 4px;
      background-color: lightgray;
      padding: 0 5px;
      border-radius: 5px;
    }
  `]
})
export class OptionListPanelComponent {
  @Input() title: string | undefined; // Fieldset is only rendered when given
  @Input() textFieldLabel!: string;
  @Input() itemList!: Label[];
  @Input() localMode: boolean = false; // Edit list here instead of emitting events for everything
  @Input() showImageButton: boolean = false; // Edit list here instead of emitting events for everything
  @Output() textItemAdded = new EventEmitter<string>();
  @Output() imageItemAdded = new EventEmitter<void>();
  @Output() itemRemoved = new EventEmitter<number>();
  @Output() itemEdited = new EventEmitter<number>();
  @Output() itemReordered = new EventEmitter<{ previousIndex: number, currentIndex: number }>();
  @Output() itemListUpdated = new EventEmitter<void>();

  constructor(private dialogService: DialogService) {}

  addListItem(text: string): void {
    if (this.localMode) {
      this.itemList.push({ text });
      this.itemListUpdated.emit();
    } else {
      this.textItemAdded.emit(text);
    }
  }

  addImageOption() {
    if (this.localMode) {
      const newLabel: Label = { text: '', imgSrc: null };
      this.dialogService.showLabelEditDialog(newLabel)
        .subscribe((result: Label) => {
          if (result) {
            this.itemList.push(result);
            this.itemListUpdated.emit();
          }
        });
    } else {
      this.imageItemAdded.emit();
    }
  }

  removeListItem(itemIndex: number): void {
    if (this.localMode) {
      this.itemList.splice(itemIndex, 1);
      this.itemListUpdated.emit();
    } else {
      this.itemRemoved.emit(itemIndex);
    }
  }

  editItem(itemIndex: number): void {
    if (this.localMode) {
      this.dialogService.showLabelEditDialog(this.itemList[itemIndex])
        .subscribe((result: Label) => {
          if (result) {
            this.itemList[itemIndex] = result;
            this.itemListUpdated.emit();
          }
        });
    } else {
      this.itemEdited.emit(itemIndex);
    }
  }

  moveListValue(event: CdkDragDrop<Label[]>): void {
    if (this.localMode) {
      moveItemInArray(this.itemList, event.previousIndex, event.currentIndex);
      this.itemListUpdated.emit();
    } else {
      this.itemReordered.emit({ previousIndex: event.previousIndex, currentIndex: event.currentIndex });
    }
  }
}
