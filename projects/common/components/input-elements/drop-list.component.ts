import { Component, Input } from '@angular/core';
import {
  CdkDrag, CdkDragDrop, CdkDragEnd, CdkDragStart, CdkDropList, moveItemInArray, transferArrayItem
} from '@angular/cdk/drag-drop';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { DragNDropValueObject } from 'common/models/elements/element';
import { FormElementComponent } from '../../directives/form-element-component.directive';

@Component({
  selector: 'aspect-drop-list',
  template: `
    <!--         [style.min-height.px]="elementModel.position?.useMinHeight || clozeContext ? elementModel.height : undefined"-->
    <div class="list" [id]="elementModel.id"
         tabindex="0"
         [class.cloze-context]="clozeContext"
         [class.vertical-orientation]="elementModel.orientation === 'vertical'"
         [class.horizontal-orientation]="elementModel.orientation === 'horizontal'"
         [class.floating-orientation]="elementModel.orientation === 'flex'"
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
         [class.errors]="elementFormControl.errors && elementFormControl.touched"
         (focusout)="elementFormControl.markAsTouched()">
      <ng-container *ngFor="let dropListValueElement of elementModel.value let index = index;">
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
                 [style.background-color]="elementModel.styling.itemBackgroundColor">
              <span>{{dropListValueElement.text}}</span>
            </div>
          </ng-template>
        </div>
        <img *ngIf="dropListValueElement.imgSrc"
             class="list-item" cdkDrag
             [src]="dropListValueElement.imgSrc | safeResourceUrl" alt="Image Placeholder">
      </ng-container>
    </div>
    <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched"
               class="error-message" [style.bottom.px]="clozeContext ? -1 : 3"
               [class.cloze-context-error-messag]="clozeContext">
      {{elementFormControl.errors | errorTransform: elementModel}}
    </mat-error>
  `,
  styles: [
    '.list {width: 100%; height: 100%; background-color: rgb(244, 244, 242); border-radius: 5px;}',
    '.list {display: flex; gap: 5px; box-sizing: border-box; padding: 5px}',
    '.list.vertical-orientation {flex-direction: column;}',
    '.list.horizontal-orientation {flex-direction: row;}',
    '.list.floating-orientation {place-content: center space-around; align-items: center; flex-flow: row wrap;}',
    '.list-item {border-radius: 5px;}',
    ':not(.cloze-context) .list-item {padding: 10px;}',
    '.cloze-context .list-item {padding: 0 5px;}',
    '.cloze-context.list {padding: 0;}',
    'img.list-item {align-self: start;}',
    '.errors {border: 2px solid #f44336 !important;}',
    '.error-message {font-size: 75%; margin-top: 10px; margin-left: 5px; position: absolute; pointer-events: none;}',
    '.cloze-context-error-message {padding: 0 !important;}',
    '.list-item {cursor: grab;}',
    '.list-item:active {cursor: grabbing;}',

    '.cdk-drag-preview {border-radius: 5px; box-shadow: 2px 2px 5px black; padding: 10px;}',

    '.cdk-drop-list-dragging .cdk-drag {transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);}',
    '.highlight-receiver.cdk-drop-list-receiving {padding: 3px; border: 2px solid;}',
    '.cdk-drag-placeholder {background: #ccc; border: dotted 3px #999; min-height: 25px; min-width: 25px;}',
    '.cdk-drag-placeholder {transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);}'
  ]
})
export class DropListComponent extends FormElementComponent {
  @Input() elementModel!: DropListElement;
  @Input() clozeContext: boolean = false;

  classReference = DropListComponent;
  static highlightReceivingDropList = false;

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
    if (DropListComponent.isReorderDrop(event)) {
      moveItemInArray(event.container.data.elementModel.value, event.previousIndex, event.currentIndex);
      event.container.data.updateFormvalue();
    } else if (DropListComponent.isCopyDrop(event)) {
      event.container.data.elementModel.value.push(
        event.previousContainer.data.elementModel.value[event.previousIndex]);
      event.container.data.updateFormvalue();
    } else if (DropListComponent.isPutBack(event)) {
      event.previousContainer.data.elementModel.value.splice(event.previousIndex, 1);
      event.previousContainer.data.updateFormvalue();
    } else {
      transferArrayItem(
        event.previousContainer.data.elementModel.value,
        event.container.data.elementModel.value,
        event.previousIndex,
        event.currentIndex
      );
      event.previousContainer.data.updateFormvalue();
      event.container.data.updateFormvalue();
    }
  }

  static isReorderDrop(event: CdkDragDrop<any>): boolean {
    return event.previousContainer === event.container;
  }

  static isCopyDrop(event: CdkDragDrop<any>): boolean {
    return event.previousContainer.data.elementModel.copyOnDrop;
  }

  static isPutBack(event: CdkDragDrop<any>): boolean {
    return event.container.data.elementModel.copyOnDrop &&
      DropListComponent.isItemIDAlreadyPresent(event.item.data.id, event.container.data.elementModel.value);
  }

  updateFormvalue(): void {
    this.elementFormControl.setValue(this.elementModel.value);
  }

  validDropPredicate = (drag: CdkDrag, drop: CdkDropList): boolean => {
    return (!drop.data.elementModel.onlyOneItem || drop.data.elementModel.value.length < 1);// &&
      // (!DropListComponent.isItemIDAlreadyPresent(drag.data.id, drop.data.value));
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
