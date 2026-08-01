import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { Label } from 'common/models/label-interfaces';

@Component({
  selector: 'aspect-option-list-panel',
  standalone: false,
  templateUrl: './option-list-panel.component.html',
  styleUrls: ['./option-list-panel.component.scss']
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
