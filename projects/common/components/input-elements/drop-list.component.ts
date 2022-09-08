import { Component, Input } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import {
  CdkDrag, CdkDropList, moveItemInArray
} from '@angular/cdk/drag-drop';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { DragNDropValueObject } from 'common/models/elements/element';
import { FormElementComponent } from '../../directives/form-element-component.directive';

@Component({
  selector: 'aspect-drop-list',
  template: `
    <div class="list-container" fxLayout="column">
      <!-- Border width is a workaround to enable/disable the Material cdk-drop-list-receiving-->
      <!-- class style.-->
      <!-- min-height for the following div is important for iOS 14!
      iOS 14 is not able to determine the height of the flex container-->
      <div class="list"
           [ngClass]="{ 'align-flex' : elementModel.orientation === 'flex', 'copyOnDrop': elementModel.copyOnDrop }"
           [class.errors]="elementFormControl.errors && elementFormControl.touched"
           [style.min-height.px]="elementModel.position.useMinHeight ? elementModel.height - 6 : null"
           [class.dropList-highlight]="elementModel.highlightReceivingDropList"
           [style.outline-color]="elementModel.highlightReceivingDropListColor"
           [style.color]="elementModel.styling.fontColor"
           [style.font-family]="elementModel.styling.font"
           [style.font-size.px]="elementModel.styling.fontSize"
           [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
           [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
           [style.backgroundColor]="elementModel.styling.backgroundColor"
           [style.display]="elementModel.orientation === 'horizontal' ? 'flex' : ''"
           [style.flex-direction]="elementModel.orientation === 'horizontal' ? 'row' : ''"
           cdkDropList
           [id]="elementModel.id"
           [cdkDropListData]="this"
           [cdkDropListConnectedTo]="elementModel.connectedTo"
           [cdkDropListOrientation]="elementModel.orientation !== 'flex' ? $any(elementModel.orientation) : ''"
           [cdkDropListEnterPredicate]="onlyOneItemPredicate"
           tabindex="0"
           (focusout)="elementFormControl.markAsTouched()"
           (cdkDropListDropped)="drop($event)">

        <ng-container *ngIf="!parentForm">
          <ng-container *ngFor="let dropListValueElement of $any(elementModel.value); let index = index;">
            <ng-container [ngTemplateOutlet]="dropObject"
                          [ngTemplateOutletContext]="{ $implicit: dropListValueElement, index: index }">
            </ng-container>
          </ng-container>
        </ng-container>

        <ng-container *ngIf="parentForm">
          <ng-container *ngFor="let dropListValueElement of elementFormControl.value; let index = index;">
            <ng-container [ngTemplateOutlet]="dropObject"
                          [ngTemplateOutletContext]="{ $implicit: dropListValueElement, index: index }">
            </ng-container>
          </ng-container>
        </ng-container>
        <!--Leave template within the dom to ensure dragNdrop-->
        <ng-template #dropObject let-dropListValueElement let-index="index">
          <div class="item text-item" *ngIf="!dropListValueElement.imgSrc"
               [ngClass]="{ 'vertical-orientation' : elementModel.orientation === 'vertical',
                      'horizontal-orientation' : elementModel.orientation === 'horizontal'}"
               [style.background-color]="elementModel.styling.itemBackgroundColor"
               cdkDrag
               [cdkDragData]="{ element: dropListValueElement, index: index }"
               (cdkDragStarted)=dragStart(index) (cdkDragEnded)="dragEnd()">
            <div *cdkDragPreview
                 [style.font-size.px]="elementModel.styling.fontSize"
                 [style.background-color]="elementModel.styling.itemBackgroundColor">
              {{dropListValueElement.text}}
            </div>
            <div class="drag-placeholder" *cdkDragPlaceholder
                 [style.min-height.px]="elementModel.styling.fontSize">
            </div>
            {{dropListValueElement.text}}
          </div>

          <!-- actual placeholder when item is being dragged from copy-list -->
          <div *ngIf="elementModel.copyOnDrop && draggedItemIndex === index" class="item text-item"
               [style.font-size.px]="elementModel.styling.fontSize"
               [ngClass]="{ 'vertical-orientation' : elementModel.orientation === 'vertical',
                            'horizontal-orientation' : elementModel.orientation === 'horizontal'}"
               [style.background-color]="elementModel.styling.itemBackgroundColor">
            {{dropListValueElement.text}}
          </div>

          <img *ngIf="dropListValueElement.imgSrc"
               [src]="dropListValueElement.imgSrc | safeResourceUrl" alt="Image Placeholder"
               [style.display]="elementModel.orientation === 'flex' ? '' : 'block'"
               class="item"
               [ngClass]="{ 'vertical-orientation' : elementModel.orientation === 'vertical',
                      'horizontal-orientation' : elementModel.orientation === 'horizontal'}"
               cdkDrag [cdkDragData]="{ element: dropListValueElement, index: index }"
               (cdkDragStarted)=dragStart(index) (cdkDragEnded)="dragEnd()"
               [style.object-fit]="'scale-down'">
          <img *ngIf="elementModel.copyOnDrop && draggedItemIndex === index && dropListValueElement.imgSrc"
               [src]="dropListValueElement.imgSrc | safeResourceUrl" alt="Image Placeholder"
               [style.display]="elementModel.orientation === 'flex' ? '' : 'block'"
               class="item"
               [ngClass]="{ 'vertical-orientation' : elementModel.orientation === 'vertical',
                      'horizontal-orientation' : elementModel.orientation === 'horizontal'}"
               [style.object-fit]="'scale-down'">
        </ng-template>
      </div>
      <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched"
                 class="error-message">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
    </div>
  `,
  styles: [
    '.list-container {width: 100%; height: 100%;}',
    '.list {border-radius: 10px; width: calc(100% - 6px);}',
    '.list {height: calc(100% - 6px); margin-top: 3px; margin-left: 3px;}',
    '.text-item {border-radius: 10px; padding: 10px;}',
    '.item {cursor: grab}',
    '.item:active {cursor: grabbing}',
    '.copyOnDrop .item {transform: none !important}',
    '.vertical-orientation.item:not(:last-child) {margin-bottom: 5px;}',
    '.horizontal-orientation.item:not(:last-child) {margin-right: 5px}',
    '.errors {outline: 2px solid #f44336 !important;}',
    '.error-message {font-size: 75%; margin-top: 10px;}', // TODO error message?
    '.cdk-drag-preview {padding: 8px 20px; border-radius: 10px; z-index: 5;}',
    '.drag-placeholder {background-color: lightgrey; border: dotted 3px #999; padding: 10px;}',
    '.drag-placeholder {transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);}',
    '.cdk-drag-animating {transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);}',
    '.dropList-highlight.cdk-drop-list-receiving {outline: solid;}',
    '.dropList-highlight.cdk-drop-list-dragging {outline: solid;}',
    '.align-flex {flex: 1 1 auto; flex-flow: row wrap; display: flex; place-content: center space-around; gap: 10px}',
    ':host .copyOnDrop .cdk-drag-placeholder {position: relative; visibility: hidden; height: 0 !important; min-height: 0 !important;}',
    ':host .copyOnDrop .cdk-drag-placeholder {margin: 0 !important; padding: 0 !important; border: 0;}'
  ]
})
export class DropListComponent extends FormElementComponent {
  @Input() elementModel!: DropListElement;

  bodyElement: HTMLElement = document.body;
  draggedItemIndex: number | null = null;

  dragStart(itemIndex: number): void {
    this.draggedItemIndex = itemIndex;
    this.bodyElement.classList.add('inheritCursors');
    this.bodyElement.style.cursor = 'grabbing';
  }

  dragEnd(): void {
    this.draggedItemIndex = null;
    this.bodyElement.classList.remove('inheritCursors');
    this.bodyElement.style.cursor = 'unset';
  }

  drop(event: CdkDragDrop<DropListComponent>): void {
    if (event.previousContainer === event.container && !event.container.data.elementModel.copyOnDrop) {
      moveItemInArray(event.container.data.elementFormControl.value as unknown as DragNDropValueObject[],
                      event.previousIndex, event.currentIndex);
      this.elementFormControl.setValue(
        (event.container.data.elementFormControl.value as DragNDropValueObject[])
      );
    } else {
      const presentValueIDs = event.container.data.elementFormControl.value
        .map((value2: DragNDropValueObject) => value2.id);
      if (!presentValueIDs.includes(event.item.data.element.id)) {
        event.container.data.elementFormControl.value.splice(event.currentIndex, 0, event.item.data.element);
        event.container.data.elementFormControl
          .setValue(event.container.data.elementFormControl.value);
      }
      if (!event.previousContainer.data.elementModel.copyOnDrop) {
        event.previousContainer.data.elementFormControl.value.splice(event.item.data.index, 1);
        event.previousContainer.data.elementFormControl.setValue(
          (event.previousContainer.data.elementFormControl.value as DragNDropValueObject[])
        );
      }
    }
  }

  onlyOneItemPredicate = (drag: CdkDrag, drop: CdkDropList): boolean => (
    !drop.data.elementModel.onlyOneItem || drop.data.elementFormControl.value.length < 1
  );
}
