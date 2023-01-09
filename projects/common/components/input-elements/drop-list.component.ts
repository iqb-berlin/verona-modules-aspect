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
import { DragNDropValueObject } from 'common/models/elements/element';
import { FormElementComponent } from '../../directives/form-element-component.directive';

@Component({
  selector: 'aspect-drop-list',
  template: `
    <div class="list" [id]="elementModel.id"
         tabindex="0"
         [class.cloze-context]="clozeContext"
         [class.vertical-orientation]="elementModel.orientation === 'vertical'"
         [class.horizontal-orientation]="elementModel.orientation === 'horizontal'"
         [class.floating-orientation]="elementModel.orientation === 'flex'"
         [class.only-one-item]="elementModel.onlyOneItem"
         [class.highlight-receiver]="classReference.highlightReceivingDropList"
         [class.allow-replacement]="parentForm && elementFormControl.value.length === 1 &&
                                    elementModel.allowReplacement && !dragging"
         cdkDropList
         (cdkDropListEntered)="showsPlaceholder = true"
         (cdkDropListExited)="showsPlaceholder = false"
         [cdkDropListData]="this" [cdkDropListConnectedTo]="elementModel.connectedTo"
         [cdkDropListOrientation]="$any(elementModel.orientation)"
         [cdkDropListSortingDisabled]="elementModel.orientation === 'flex'"
         [cdkDropListEnterPredicate]="validDropPredicate"
         (cdkDropListDropped)="drop($event);"
         [style.color]="elementModel.styling.fontColor"
         [style.font-family]="elementModel.styling.font"
         [style.font-size.px]="elementModel.styling.fontSize"
         [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
         [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
         [style.backgroundColor]="elementModel.styling.backgroundColor"
         [style.border-color]="elementModel.highlightReceivingDropListColor"
         [class.errors]="elementFormControl.errors &&
                         elementFormControl.touched &&
                         !classReference.highlightReceivingDropList"
         (focusout)="elementFormControl.markAsTouched()">
      <div class="list-item" *ngIf="parentForm ? !elementFormControl.value.length && !showsPlaceholder ||
                                                 elementFormControl.value.length === 1 && !showsPlaceholder && dragging:
                                    !elementModel.value.length;">
        <span>&nbsp;</span>
      </div>
      <ng-container *ngFor="let dropListValueElement of
        parentForm ? elementFormControl.value : elementModel.value; let index = index;">
        <div *ngIf="!dropListValueElement.imgSrc"
             class="list-item"
             [class.hide-list-item]="parentForm && elementModel.allowReplacement &&
                                     elementFormControl.value.length === 1 && showsPlaceholder"
             cdkDrag [cdkDragData]="dropListValueElement"
             (cdkDragStarted)="dragStart($event)"
             (cdkDragEnded)="dragEnd()"
             [style.background-color]="elementModel.styling.itemBackgroundColor">
          <span>{{dropListValueElement.text}}</span>
          <ng-template cdkDragPreview>
            <div class="text-preview"
                 [style.color]="elementModel.styling.fontColor"
                 [style.font-family]="elementModel.styling.font"
                 [style.font-size.px]="elementModel.styling.fontSize"
                 [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
                 [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
                 [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
                 [style.background-color]="elementModel.styling.itemBackgroundColor">
              <span>{{dropListValueElement.text}}</span>
            </div>
          </ng-template>
        </div>
        <div *ngIf="dropListValueElement.imgSrc"
             class="list-item image-list-item" cdkDrag
             [class.hide-list-item]="parentForm && elementModel.allowReplacement &&
                                     elementFormControl.value.length === 1 && showsPlaceholder">
          <img [src]="dropListValueElement.imgSrc | safeResourceUrl" alt="Image Placeholder">
          <ng-template cdkDragPreview>
            <img *ngIf="dropListValueElement.imgSrc"
                 [src]="dropListValueElement.imgSrc | safeResourceUrl" alt="Image Placeholder">
          </ng-template>
        </div>
      </ng-container>
      <mat-error *ngIf="elementFormControl.errors &&
                        elementFormControl.touched &&
                        !classReference.highlightReceivingDropList"
                 class="error-message">
        <span>{{elementFormControl.errors | errorTransform: elementModel}}</span>
      </mat-error>
    </div>
  `,
  styles: [
    '.list {width: 100%; height: 100%; background-color: rgb(244, 244, 242); border-radius: 5px;}',
    '.list {display: flex; gap: 5px; box-sizing: border-box; padding: 5px}',
    '.list.vertical-orientation {flex-direction: column;}',
    '.list.horizontal-orientation {flex-direction: row;}',
    '.list.floating-orientation {place-content: center space-around; align-items: center; flex-flow: row wrap;}',
    '.cloze-context.list {padding: 0;}',
    '.list-item {border-radius: 5px;}',
    ':not(.cloze-context) .list-item:not(.image-list-item) {padding: 10px;}',
    '.cloze-context .list-item {padding: 0 5px;}',
    '.cloze-context.only-one-item .list-item {height: 100%; display: flex; align-items: center; justify-content: center;}',
    'img.list-item {align-self: start;}',
    '.errors {border: 2px solid #f44336 !important;}',
    '.error-message {font-size: 75%; position: absolute; margin-left: 3px;}',
    '.list-item:active {cursor: grabbing;}',
    '.cdk-drag-preview {border-radius: 5px; box-shadow: 2px 2px 5px black;}',
    '.cdk-drag-preview.text-preview {padding: 10px;}',
    '.cdk-drop-list-dragging .cdk-drag {transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);}',
    '.highlight-receiver.cdk-drop-list-receiving {padding: 3px; border: 2px solid;}',
    '.cdk-drag-placeholder {background-color: #ccc !important;}',
    '.cdk-drag-placeholder {transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);}',
    '.cdk-drag-placeholder * {visibility: hidden;}',
    '.allow-replacement .cdk-drag-placeholder {padding: 0 !important; height: 0 !important;}',
    '.hide-list-item {background-color: #ccc !important;}',
    '.hide-list-item * {visibility: hidden;}'
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
      return;
    }
    if (DropListComponent.isPutBack(event)) {
      event.previousContainer.data.elementFormControl.value.splice(event.previousIndex, 1);
      event.previousContainer.data.updateFormvalue();
      return;
    }

    if (DropListComponent.isReplace(event)) {
      const isToReplaceItemAlreadyInOrigin: boolean =
        event.container.data.elementFormControl.value[0].originListID === event.container.data.elementModel.id;
      if (isToReplaceItemAlreadyInOrigin) {
        return;
      }
      const replacedItem: DragNDropValueObject = event.container.data.elementFormControl.value.splice(0, 1)[0];
      DropListComponent.transferItem(event.previousContainer, event.container, event.previousIndex, event.currentIndex);
      event.previousContainer.data.updateFormvalue();
      event.container.data.updateFormvalue();
      const originComponent = DropListComponent.dragAndDropComponents[replacedItem.originListID];
      DropListComponent.addElementToList(originComponent, replacedItem);
      return;
    }

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
  static isPutBack(event: CdkDragDrop<any>): boolean {
    return event.container.data.elementModel.copyOnDrop &&
      DropListComponent.isItemIDAlreadyPresent(event.item.data.id, event.container.data.elementFormControl.value);
  }

  static isReplace(event: CdkDragDrop<any>): boolean {
    return event.container.data.elementFormControl.value.length === 1 &&
      event.container.data.elementModel.allowReplacement;
  }

  updateFormvalue(): void {
    this.elementFormControl.setValue(this.elementFormControl.value);
  }

  validDropPredicate = (drag: CdkDrag, drop: CdkDropList): boolean => (
    (!drop.data.elementModel.onlyOneItem || drop.data.elementFormControl.value.length < 1 ||
      drop.data.elementModel.allowReplacement)
  );

  static isItemIDAlreadyPresent(itemID: string, valueList: DragNDropValueObject[]): boolean {
    const listValueIDs = valueList.map((valueValue: DragNDropValueObject) => valueValue.id);
    return listValueIDs.includes(itemID);
  }
}
