import { Component, Input, OnInit } from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragStart,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
  copyArrayItem
} from '@angular/cdk/drag-drop';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { DragNDropValueObject } from 'common/models/elements/label-interfaces';
import { FormElementComponent } from '../../directives/form-element-component.directive';

@Component({
  selector: 'aspect-drop-list',
  template: `
    <div class="list" [id]="elementModel.id"
         tabindex="0"
         [class.cloze-context]="clozeContext"
         [class.only-one-item]="elementModel.onlyOneItem"
         [class.vertical-orientation]="elementModel.orientation === 'vertical'"
         [class.horizontal-orientation]="elementModel.orientation === 'horizontal'"
         [class.floating-orientation]="elementModel.orientation === 'flex'"
         [class.static-placeholder]="parentForm && elementFormControl.value.length === 1 &&
                                    (elementModel.allowReplacement || (elementModel.copyOnDrop && showsPlaceholder)) &&
                                    !dragging"
         [class.highlight-receiver]="classReference.highlightReceivingDropList"
         [class.error]="elementFormControl.errors &&
                        elementFormControl.touched &&
                        !classReference.highlightReceivingDropList"
         cdkDropList
         (cdkDropListEntered)="showsPlaceholder = true"
         (cdkDropListExited)="showsPlaceholder = false"
         [cdkDropListData]="this" [cdkDropListConnectedTo]="elementModel.connectedTo"
         [cdkDropListOrientation]="$any(elementModel.orientation)"
         [cdkDropListSortingDisabled]="elementModel.orientation === 'flex'"
         [cdkDropListEnterPredicate]="validDropPredicate"
         (cdkDropListDropped)="drop($event);"
         [style.gap.px]="elementModel.onlyOneItem ? 0 : 5"
         [style.color]="elementModel.styling.fontColor"
         [style.font-size.px]="elementModel.styling.fontSize"
         [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
         [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
         [style.backgroundColor]="elementModel.styling.backgroundColor"
         [style.border-color]="elementModel.highlightReceivingDropListColor"
         (focusout)="elementFormControl.markAsTouched()">
      <ng-container *ngFor="let dropListValueElement of
        parentForm ? elementFormControl.value : elementModel.value; let index = index;">
        <div *ngIf="!dropListValueElement.imgSrc"
             class="list-item text-list-item"
             [class.hide-list-item]="parentForm && (elementModel.allowReplacement || elementModel.copyOnDrop) &&
                                     elementFormControl.value.length === 1 && showsPlaceholder"
             [class.audio-list-item]="dropListValueElement.audioSrc"
             cdkDrag [cdkDragData]="dropListValueElement"
             (cdkDragStarted)="dragStart($event)"
             (cdkDragEnded)="dragEnd()"
             [style.background-color]="elementModel.styling.itemBackgroundColor">
          <ng-container *ngIf="dropListValueElement.audioSrc">
            <audio #player
                   [src]="dropListValueElement.audioSrc | safeResourceUrl">
            </audio>
            <div class="audio-button"
                 (click)="player.play()">
              <mat-icon>play_arrow</mat-icon>
            </div>
          </ng-container>
          <div class="text-padding">
            {{dropListValueElement.text}}
          </div>
          <ng-template cdkDragPreview matchSize>
            <div class="text-preview"
                 [class.audio-list-item]="dropListValueElement.audioSrc"
                 [class.cloze-context-preview]="clozeContext"
                 [style.color]="elementModel.styling.fontColor"
                 [style.font-size.px]="elementModel.styling.fontSize"
                 [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
                 [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
                 [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
                 [style.background-color]="elementModel.styling.itemBackgroundColor">
                <div *ngIf="dropListValueElement.audioSrc"
                     class="audio-button">
                  <mat-icon>play_arrow</mat-icon>
                </div>
              <div class="text-padding">{{dropListValueElement.text}}</div>
            </div>
          </ng-template>
        </div>
        <div *ngIf="dropListValueElement.imgSrc"
             class="list-item image-list-item"
             [class.hide-list-item]="parentForm && (elementModel.allowReplacement || elementModel.copyOnDrop) &&
                                     elementFormControl.value.length === 1 && showsPlaceholder"
             cdkDrag [cdkDragData]="dropListValueElement"
             (cdkDragStarted)="dragStart($event)"
             (cdkDragEnded)="dragEnd()">
          <span class="baseline-helper">&nbsp;</span>
          <img [src]="dropListValueElement.imgSrc | safeResourceUrl" alt="Image Placeholder">
          <ng-template cdkDragPreview matchSize>
            <div>
              <span class="baseline-helper">&nbsp;</span>
              <img *ngIf="dropListValueElement.imgSrc"
                 [src]="dropListValueElement.imgSrc | safeResourceUrl" alt="Image Placeholder">
            </div>
          </ng-template>
        </div>
      </ng-container>

      <div class="list-item text-list-item" *ngIf="parentForm ?
                                    (!elementFormControl.value.length && !showsPlaceholder) ||
                                    (elementFormControl.value.length === 1 && !showsPlaceholder && dragging) :
                                    !elementModel.value.length;">
        <div class="baseline-helper text-padding">&nbsp;</div>
        <mat-error *ngIf="elementFormControl.errors &&
                          elementFormControl.touched &&
                          !classReference.highlightReceivingDropList"
                   class="error-message">{{elementFormControl.errors | errorTransform: elementModel}}</mat-error>
      </div>
    </div>
  `,
  styles: [
    ':host {display: flex !important; width: 100%; height: 100%;}',
    '.audio-button {cursor: pointer;}',
    '.audio-button:hover {color: #006064;}',
    '.cloze-context .list-item.text-list-item .audio-button .mat-icon {height: 19px;}',
    ':not(.cloze-context) .list-item.text-list-item .audio-button .mat-icon {margin-top: 5px; padding-left: 3px;}',
    '.audio-list-item {display: flex; flex-direction: row; align-items: center; justify-content: flex-start;}',
    '.list {width: 100%; height: 100%; background-color: rgb(244, 244, 242); border-radius: 5px;}',
    '.list {display: flex; box-sizing: border-box; padding: 5px;}',
    '.list.vertical-orientation {flex-direction: column;}',
    '.list.horizontal-orientation {flex-direction: row;}',
    '.list.floating-orientation {place-content: center space-around; align-items: center; flex-flow: row wrap;}',
    '.cloze-context.list {padding: 0}',
    '.highlight-receiver.cdk-drop-list-receiving {border: 2px solid;}',
    '.highlight-receiver.cdk-drop-list-receiving:not(.cloze-context) {padding: 3px;}',
    '.error {padding: 3px; border: 2px solid #f44336 !important;}',
    '.list-item:active {cursor: grabbing;}',
    '.list-item {border-radius: 5px;}',
    ':not(.cloze-context) .list-item.text-list-item:not(.audio-list-item) .text-padding {padding: 10px;}',
    ':not(.cloze-context) .list-item.text-list-item.audio-list-item .text-padding {padding: 10px 10px 10px 5px;}',
    '.cloze-context .list-item.text-list-item .text-padding {padding: 0 5px;}',
    '.cloze-context.only-one-item .list-item {height: 100%; display: flex; align-items: center; justify-content: center;}',
    '.image-list-item {align-self: flex-start;}',
    '.hide-list-item {display: none !important; transform: unset !important;}',
    '.cdk-drag-preview {border-radius: 5px; box-shadow: 2px 2px 5px black;}',
    '.cdk-drag-preview.text-preview {box-sizing: border-box;}',
    '.cdk-drag-preview.text-preview:not(.audio-list-item) .text-padding{padding: 10px;}',
    '.cdk-drag-preview.text-preview.audio-list-item .text-padding{padding: 10px 10px 10px 5px;}',
    '.cdk-drag-preview.text-preview .audio-button .mat-icon {margin-top: 5px; padding-left: 3px;}',
    '.cdk-drag-preview.cloze-context-preview {padding: 0 2px; display: flex; align-items: center; justify-content: center;}',
    '.cdk-drop-list-dragging .cdk-drag {transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);}',
    '.cdk-drag-placeholder {background-color: #ccc !important;}',
    '.cdk-drag-placeholder {transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);}',
    '.cdk-drag-placeholder * {visibility: hidden;}',
    '.static-placeholder .cdk-drag-placeholder {transform: unset !important;}',
    '.error-message {font-size: 12px;}',
    '.baseline-helper {width: 0; display: inline-block;}'
  ]
})
export class DropListComponent extends FormElementComponent implements OnInit {
  @Input() elementModel!: DropListElement;
  @Input() clozeContext: boolean = false;
  dragging = false;
  showsPlaceholder = false;
  classReference = DropListComponent;

  static highlightReceivingDropList = false;
  static dragAndDropComponents: { [id: string]: DropListComponent } = {};

  ngOnInit() {
    super.ngOnInit();
    DropListComponent.dragAndDropComponents[this.elementModel.id] = this;
  }

  dragStart(event: CdkDragStart) {
    DropListComponent.setHighlighting(event.source.dropContainer.data.elementModel.highlightReceivingDropList);
    // add class for cursor while dragging
    document.body.classList.add('dragging-active');
    this.showsPlaceholder = true;
    this.dragging = true;
  }

  dragEnd() {
    DropListComponent.setHighlighting(false);
    document.body.classList.remove('dragging-active');
    this.dragging = false;
    Object.values(DropListComponent.dragAndDropComponents).forEach(d => { d.showsPlaceholder = false; });
  }

  static setHighlighting(showHighlight: boolean) {
    DropListComponent.highlightReceivingDropList = showHighlight;
  }

  drop(event: CdkDragDrop<any>) {
    if (DropListComponent.isReorderDrop(event)) {
      moveItemInArray(event.container.data.elementFormControl.value, event.previousIndex, event.currentIndex);
      event.container.data.updateFormvalue();
    } else if (DropListComponent.isPutBack(event.item, event.container)) {
      event.previousContainer.data.elementFormControl.value.splice(event.previousIndex, 1);
      event.previousContainer.data.updateFormvalue();
    } else if (DropListComponent.isReplace(event)) {
      const isToReplaceItemAlreadyInOrigin: boolean =
        event.container.data.elementFormControl.value[0].originListID === event.container.data.elementModel.id;
      if (isToReplaceItemAlreadyInOrigin) {
        return;
      }
      // splice first and hold the replaced item, then move. to prevent indix mixup
      const replacedItem: DragNDropValueObject = event.container.data.elementFormControl.value.splice(0, 1)[0];
      DropListComponent.moveItem(event);
      const originComponent = DropListComponent.dragAndDropComponents[replacedItem.originListID];
      const isIDAlreadyPresentInOrigin = DropListComponent.isItemIDAlreadyPresent(
        replacedItem.id,
        originComponent.elementFormControl.value);
      if (!(originComponent.elementModel.copyOnDrop && isIDAlreadyPresentInOrigin)) {
        DropListComponent.addElementToList(originComponent, replacedItem);
      }
    } else {
      DropListComponent.moveItem(event);
    }
  }

  static moveItem(event: CdkDragDrop<any>): void {
    if (DropListComponent.isCopyDrop(event)) {
      copyArrayItem(
        event.previousContainer.data.elementFormControl.value,
        event.container.data.elementFormControl.value,
        event.previousIndex,
        event.currentIndex);
    } else {
      DropListComponent.transferItem(event.previousContainer, event.container, event.previousIndex, event.currentIndex);
    }
    event.previousContainer.data.updateFormvalue();
    event.container.data.updateFormvalue();
  }

  static transferItem(previousContainer: CdkDropList, newContainer: CdkDropList,
                      previousIndex: number, newIndex: number): void {
    transferArrayItem(
      previousContainer.data.elementFormControl.value,
      newContainer.data.elementFormControl.value,
      previousIndex,
      newIndex
    );
  }

  static addElementToList(listComponent: DropListComponent, element: DragNDropValueObject): void {
    const targetIndex = Math.min(listComponent.elementFormControl.value.length, element.originListIndex || 0);
    listComponent.elementFormControl.value.splice(targetIndex, 0, element);
    listComponent.elementFormControl.setValue(listComponent.elementFormControl.value);
  }

  /* Move element within the same list to a new index position. */
  static isReorderDrop(event: CdkDragDrop<any>): boolean {
    return event.previousContainer === event.container;
  }

  static isCopyDrop(event: CdkDragDrop<any>): boolean {
    return event.previousContainer.data.elementModel.copyOnDrop;
  }

  /* Put a copied element back to the source list. */
  static isPutBack(draggedItem: CdkDrag, list: CdkDropList): boolean {
    return list.data.elementModel.copyOnDrop &&
      DropListComponent.isItemIDAlreadyPresent(draggedItem.data.id, list.data.elementFormControl.value);
  }

  static isReplace(event: CdkDragDrop<any>): boolean {
    return event.container.data.elementFormControl.value.length === 1 &&
      event.container.data.elementModel.allowReplacement;
  }

  static isItemIDAlreadyPresent(itemID: string, valueList: DragNDropValueObject[]): boolean {
    const listValueIDs = valueList.map((valueValue: DragNDropValueObject) => valueValue.id);
    return listValueIDs.includes(itemID);
  }

  updateFormvalue(): void {
    this.elementFormControl.setValue(this.elementFormControl.value);
  }

  validDropPredicate = (draggedItem: CdkDrag, targetList: CdkDropList): boolean => {
    if (!DropListComponent.isItemIDAlreadyPresent(draggedItem.data.id, targetList.data.elementFormControl.value) &&
       !targetList.data.elementModel.onlyOneItem) {
      return true;
    }

    if (targetList.data.elementModel.onlyOneItem && targetList.data.elementFormControl.value.length < 1) {
      return true;
    }

    if (targetList.data.elementModel.onlyOneItem &&
        targetList.data.elementFormControl.value.length > 0 &&
        (targetList.data.elementModel.allowReplacement && DropListComponent.containedItemIsReplacable(targetList))) {
      return true;
    }

    if (DropListComponent.isItemIDAlreadyPresent(draggedItem.data.id, targetList.data.elementFormControl.value) &&
        targetList.data.elementModel.onlyOneItem &&
        (targetList.data.elementModel.allowReplacement && DropListComponent.containedItemIsReplacable(targetList))) {
      return true;
    }

    if (DropListComponent.isPutBack(draggedItem, targetList)) {
      return true;
    }
    return false;
  };

  /* To be replacable an item must not be in it's origin. Otherwise it has nowhere to go to. */
  static containedItemIsReplacable(list: CdkDropList): boolean {
    return list.data.elementFormControl.value[0].originListID !== list.data.elementModel.id;
  }
}
