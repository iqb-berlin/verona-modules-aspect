import { Component, Input } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import {
  CdkDrag, CdkDropList, moveItemInArray, transferArrayItem, copyArrayItem
} from '@angular/cdk/drag-drop';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { DragNDropValueObject, DropListElement } from '../../interfaces/elements';

@Component({
  selector: 'aspect-drop-list',
  template: `
    <div class="list-container">
      <!-- Border width is a workaround to enable/disable the Material cdk-drop-list-receiving-->
      <!-- class style.-->
      <!-- min-height for the following div is important for iOS 14!
      iOS 14 is not able to determine the height of the flex container-->
      <div class="list"
           [ngClass]="{ 'align-flex' : elementModel.orientation === 'flex', 'copyOnDrop': elementModel.copyOnDrop }"
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
           cdkDropList cdkDropListSortingDisabled
           [id]="elementModel.id"
           [cdkDropListData]="this"
           [cdkDropListConnectedTo]="elementModel.connectedTo"
           [cdkDropListOrientation]="elementModel.orientation !== 'flex' ? $any(elementModel.orientation) : ''"
           [cdkDropListEnterPredicate]="onlyOneItemPredicate"
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
          <div class="item text-item" *ngIf="!dropListValueElement.imgSrcValue" cdkDrag
               [ngClass]="{ 'vertical-orientation' : elementModel.orientation === 'vertical',
                      'horizontal-orientation' : elementModel.orientation === 'horizontal'}"
               [style.background-color]="elementModel.styling.itemBackgroundColor"
               [cdkDragData]="dropListValueElement"
               (cdkDragStarted)=dragStart(index) (cdkDragEnded)="dragEnd()">
            <div *cdkDragPreview
                 [style.font-size.px]="elementModel.styling.fontSize"
                 [style.background-color]="elementModel.styling.itemBackgroundColor">
                {{dropListValueElement.stringValue}}
            </div>
            <div class="drag-placeholder" *cdkDragPlaceholder
                 [style.min-height.px]="elementModel.styling.fontSize">
            </div>
            {{dropListValueElement.stringValue}}
          </div>

          <!-- actual placeholder when item is being dragged from copy-list -->
          <div *ngIf="draggedItemIndex === index" class="item text-item"
               [style.font-size.px]="elementModel.styling.fontSize"
               [ngClass]="{ 'vertical-orientation' : elementModel.orientation === 'vertical',
                            'horizontal-orientation' : elementModel.orientation === 'horizontal'}"
               [style.background-color]="elementModel.styling.itemBackgroundColor">
            {{dropListValueElement.stringValue}}
          </div>

          <img *ngIf="dropListValueElement.imgSrcValue"
               [src]="dropListValueElement.imgSrcValue | safeResourceUrl" alt="Image Placeholder"
               [style.display]="elementModel.orientation === 'flex' ? '' : 'block'"
               class="item"
               [ngClass]="{ 'vertical-orientation' : elementModel.orientation === 'vertical',
                      'horizontal-orientation' : elementModel.orientation === 'horizontal'}"
               cdkDrag (cdkDragStarted)=dragStart(index) (cdkDragEnded)="dragEnd()"
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
    '.list-container {display: flex; flex-direction: column; width: 100%; height: 100%;}',
    '.list {border-radius: 10px; width: calc(100% - 6px); height: calc(100% - 6px); margin-top: 3px; margin-left: 3px;}',
    '.text-item {border-radius: 10px; padding: 10px;}',
    '.item {cursor: grab}',
    '.item:active {cursor: grabbing}',
    '.vertical-orientation.item:not(:last-child) {margin-bottom: 5px;}',
    '.horizontal-orientation.item:not(:last-child) {margin-right: 5px}',
    '.error-message {font-size: 75%; margin-top: 10px;}',
    '.cdk-drag-preview {padding: 8px 20px; border-radius: 10px}',
    '.drag-placeholder {background-color: lightgrey; border: dotted 3px #999; padding: 10px;}',
    '.drag-placeholder {transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);}',
    '.cdk-drag-animating {transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);}',

    '.dropList-highlight.cdk-drop-list-receiving {outline: solid;}',
    '.dropList-highlight.cdk-drop-list-dragging {outline: solid;}',

    '.align-flex {flex: 1 1 auto; flex-flow: row wrap; display: flex; place-content: center space-around; gap: 10px}',
    ':host .copyOnDrop .cdk-drag-placeholder {display: none;}'
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
    if (!this.elementModel.readOnly) {
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data.elementFormControl.value as unknown as DragNDropValueObject[],
          event.previousIndex, event.currentIndex);
      } else {
        const presentValueIDs = event.container.data.elementFormControl.value
          .map((value2: DragNDropValueObject) => value2.id);
        if (!presentValueIDs.includes(event.item.data.id)) {
          if (event.previousContainer.data.elementModel.copyOnDrop) {
            copyArrayItem(
              event.previousContainer.data.elementFormControl.value as unknown as DragNDropValueObject[],
              event.container.data.elementFormControl.value as unknown as DragNDropValueObject[],
              event.previousIndex,
              event.currentIndex
            );
          } else {
            transferArrayItem(
              event.previousContainer.data.elementFormControl.value as unknown as DragNDropValueObject[],
              event.container.data.elementFormControl.value as unknown as DragNDropValueObject[],
              event.previousIndex,
              event.currentIndex
            );
          }
          event.previousContainer.data.elementFormControl.setValue(
            (event.previousContainer.data.elementFormControl.value as DragNDropValueObject[])
          );
        }

      }
      this.elementFormControl.setValue(
        (event.container.data.elementFormControl.value as DragNDropValueObject[])
      );
    }
  }

  onlyOneItemPredicate = (drag: CdkDrag, drop: CdkDropList): boolean => (
    !drop.data.elementModel.onlyOneItem || drop.data.elementFormControl.value.length < 1
  );
}
