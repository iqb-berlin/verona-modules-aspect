import {
  Component, ComponentRef, ElementRef, Input, OnInit, ViewChild
} from '@angular/core';
import {
  CdkDrag, CdkDragDrop, CdkDragStart, CdkDropList, moveItemInArray, transferArrayItem, copyArrayItem
} from '@angular/cdk/drag-drop';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { DragNDropValueObject } from 'common/models/elements/element';
import { FormElementComponent } from '../../directives/form-element-component.directive';

@Component({
  selector: 'aspect-drop-list',
  template: `
    <!--         [style.min-height.px]="elementModel.position?.useMinHeight || clozeContext ? elementModel.height : undefined"-->
    <div class="list" [id]="elementModel.id" #listComponent
         tabindex="0"
         [class.cloze-context]="clozeContext"
         [class.vertical-orientation]="elementModel.orientation === 'vertical'"
         [class.horizontal-orientation]="elementModel.orientation === 'horizontal'"
         [class.floating-orientation]="elementModel.orientation === 'flex'"
         [class.only-one-item]="elementModel.onlyOneItem"
         [class.highlight-receiver]="classReference.highlightReceivingDropList"
         cdkDropList
         [cdkDropListData]="this" [cdkDropListConnectedTo]="elementModel.connectedTo"
         [cdkDropListOrientation]="elementModel.orientation === 'vertical' ? 'vertical' : 'horizontal'"
         [cdkDropListEnterPredicate]="validDropPredicate"
         (cdkDropListDropped)="drop($event)"
         [style.color]="elementModel.styling.fontColor"
         [style.font-family]="elementModel.styling.font"
         [style.font-size.px]="elementModel.styling.fontSize"
         [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
         [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
         [style.backgroundColor]="elementModel.styling.backgroundColor"
         [style.border-color]="elementModel.highlightReceivingDropListColor"
         [class.errors]="elementFormControl.errors && elementFormControl.touched && !classReference.highlightReceivingDropList"
         (focusout)="elementFormControl.markAsTouched()">
      <ng-container *ngFor="let dropListValueElement of
        parentForm ? elementFormControl.value : elementModel.value; let index = index;">
        <div *ngIf="!dropListValueElement.imgSrc"
             class="list-item"
             cdkDrag [cdkDragData]="dropListValueElement"
             (cdkDragStarted)="dragStart($event)"
             (cdkDragEnded)="dragEnd()"
             [style.background-color]="elementModel.styling.itemBackgroundColor">
          <span>{{dropListValueElement.text}}</span>
          <div *cdkDragPlaceholder></div>
          <ng-template cdkDragPreview>
            <div [style.color]="elementModel.styling.fontColor"
                 [style.font-family]="elementModel.styling.font"
                 [style.font-size.px]="elementModel.styling.fontSize"
                 [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
                 [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
                 [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
                 [style.padding.px]="dropListValueElement.imgSrc ? 0 : 10"
                 [style.background-color]="elementModel.styling.itemBackgroundColor">
              <span>{{dropListValueElement.text}}</span>
            </div>
          </ng-template>
        </div>
        <img *ngIf="dropListValueElement.imgSrc"
             class="list-item" cdkDrag
             [src]="dropListValueElement.imgSrc | safeResourceUrl" alt="Image Placeholder">
      </ng-container>
      <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched && !classReference.highlightReceivingDropList"
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
    ':not(.cloze-context) :not(img).list-item {padding: 10px;}',
    '.cloze-context .list-item {padding: 0 5px;}',
    '.cloze-context .list-item span {margin-bottom: 3px;}',
    '.only-one-item .list-item {height: 100%; display: flex; align-items: center; justify-content: center;}',
    'img.list-item {align-self: start;}',
    '.errors {border: 2px solid #f44336 !important;}',
    '.error-message {font-size: 75%; position: absolute; margin-left: 3px;}',
    '.list-item:active {cursor: grabbing;}',
    '.cdk-drag-preview {border-radius: 5px; box-shadow: 2px 2px 5px black;}',
    '.cdk-drop-list-dragging .cdk-drag {transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);}',
    '.highlight-receiver.cdk-drop-list-receiving {padding: 3px; border: 2px solid;}',
    '.cdk-drag-placeholder {background: #ccc; border: dotted 3px #999; min-height: 25px; min-width: 25px;}',
    '.cdk-drag-placeholder {transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);}'
  ]
})
export class DropListComponent extends FormElementComponent implements OnInit {
  @Input() elementModel!: DropListElement;
  @Input() clozeContext: boolean = false;
  static dragAndDropComponents: { [id: string]: DropListComponent } = {};

  classReference = DropListComponent;
  static highlightReceivingDropList = false;

  ngOnInit() {
    super.ngOnInit();
    DropListComponent.dragAndDropComponents[this.elementModel.id] = this;
  }

  dragStart(event: CdkDragStart) {
    DropListComponent.setHighlighting(event.source.dropContainer.data.elementModel.highlightReceivingDropList);
    document.body.classList.add('dragging-active');
  }

  dragEnd() {
    DropListComponent.setHighlighting(false);
    document.body.classList.remove('dragging-active');
  }

  static setHighlighting(showHighlight: boolean) {
    DropListComponent.highlightReceivingDropList = showHighlight;
  }

  drop(event: CdkDragDrop<any>) {
    console.log('drop', event);
    // console.log('drop2 listComponent', ng.getComponent(this.listComponent));
    if (DropListComponent.isReorderDrop(event)) {
      console.log('reorder');
      moveItemInArray(event.container.data.elementFormControl.value, event.previousIndex, event.currentIndex);
      event.container.data.updateFormvalue();
      return;
    }
    if (DropListComponent.isPutBack(event)) {
      console.log('put back');
      event.previousContainer.data.elementFormControl.value.splice(event.previousIndex, 1);
      event.previousContainer.data.updateFormvalue();
      return;
    }

    if (DropListComponent.isReplace(event)) {
      console.log('replace');
      DropListComponent.moveBackToOrigin(event);
    }

    if (DropListComponent.isCopyDrop(event)) {
      console.log('copy drop');
      copyArrayItem(event.previousContainer.data.elementFormControl.value, event.container.data.elementFormControl.value, event.previousIndex, event.currentIndex);
    } else {
      console.log('transfer drop');
      DropListComponent.transferItem(event.previousContainer, event.container, event.previousIndex, event.currentIndex);
    }
    event.previousContainer.data.updateFormvalue();
    event.container.data.updateFormvalue();
  }

  static transferItem(previousContainer: CdkDropList, newContainer: CdkDropList, previousIndex: number, newIndex: number): void {
    transferArrayItem(
      previousContainer.data.elementFormControl.value,
      newContainer.data.elementFormControl.value,
      previousIndex,
      newIndex
    );
  }

  static moveBackToOrigin(event: CdkDragDrop<any>): void {
    console.log('moveBackToOrigin', event);
    const originComponent = DropListComponent.dragAndDropComponents[event.container.data.elementFormControl.value[0].originListID];
    const isIDAlreadyPresentInOrigin = DropListComponent.isItemIDAlreadyPresent(event.container.data.elementFormControl.value[0].id,originComponent.elementFormControl.value);
    if (!originComponent.elementModel.copyOnDrop || !isIDAlreadyPresentInOrigin) {
      DropListComponent.addElementToList(originComponent, event.container.data.elementFormControl.value[0]);
    }
    DropListComponent.removeElementFromList(event.container.data, 0);
  }

  static addElementToList(listComponent: DropListComponent, element: DragNDropValueObject): void {
    const targetIndex = element.originListIndex;
    if (targetIndex) {
      listComponent.elementFormControl.value.splice(
        Math.min(listComponent.elementFormControl.value.length, element.originListIndex || 0),
        0,
        element
      );
    } else {
      listComponent.elementFormControl.value.push(element);
    }
    listComponent.elementFormControl.setValue(listComponent.elementFormControl.value);
  }

  static removeElementFromList(listComponent: DropListComponent, index: number): void {
    listComponent.elementFormControl.value.splice(index, 1);
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

  validDropPredicate = (drag: CdkDrag, drop: CdkDropList): boolean => {
    console.log('valid?', drop);
    return (!drop.data.elementModel.onlyOneItem || drop.data.elementFormControl.value.length < 1 ||
      drop.data.elementModel.allowReplacement);
  };

  // isIDPresentAndNoReturning(): boolean {
  //   return DropListComponent.isItemIDAlreadyPresent(DropListComponent.draggedElement?.id as string, this.elementFormControl.value) &&
  //     !(this.elementModel.deleteDroppedItemWithSameID);
  // }
  //
  // isOnlyOneItemAndNoReplacingOrReturning(): boolean {
  //   return this.elementModel.onlyOneItem && this.viewModel.length > 0 &&
  //     !((this.viewModel[0].returnToOriginOnReplacement && !this.elementModel.isSortList) ||
  //       (this.elementModel.deleteDroppedItemWithSameID &&
  //         DropListComponent.draggedElement?.id === this.viewModel[0].id));
  // }

  static isItemIDAlreadyPresent(itemID: string, valueList: DragNDropValueObject[]): boolean {
    const listValueIDs = valueList.map((valueValue: DragNDropValueObject) => valueValue.id);
    return listValueIDs.includes(itemID);
  }
}
