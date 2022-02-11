import { Component, Input } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import {
  CdkDrag, CdkDropList, moveItemInArray, transferArrayItem
} from '@angular/cdk/drag-drop';
import { DropListElement } from './drop-list';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { DragNDropValueObject } from '../../models/uI-element';

@Component({
  selector: 'aspect-drop-list',
  template: `
    <div class="element-content-wrapper">
      <!-- Border width is a workaround to enable/disable the Material cdk-drop-list-receiving-->
      <!-- class style.-->
      <div class="list"
           [style.width]="elementModel.positionProps.fixedSize ? elementModel.width + 'px' : '100%'"
           [style.height]="elementModel.positionProps.fixedSize ? elementModel.height + 'px' : '100%'"
           [class.center-content]="elementModel.positionProps.dynamicPositioning &&
                                    elementModel.positionProps.fixedSize"
           [ngClass]="{ 'align-flex' : elementModel.orientation === 'flex' }"
           [class.dropList-highlight]="elementModel.highlightReceivingDropList"
           [style.outline-color]="elementModel.highlightReceivingDropListColor"
           [style.color]="elementModel.fontProps.fontColor"
           [style.font-family]="elementModel.fontProps.font"
           [style.font-size.px]="elementModel.fontProps.fontSize"
           [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
           [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''"
           [style.backgroundColor]="elementModel.surfaceProps.backgroundColor"
           [style.display]="elementModel.orientation === 'horizontal' ? 'flex' : ''"
           [style.flex-direction]="elementModel.orientation === 'horizontal' ? 'row' : ''"
           cdkDropList
           [id]="elementModel.id"
           [cdkDropListData]="this"
           [cdkDropListConnectedTo]="elementModel.connectedTo"
           [cdkDropListOrientation]="elementModel.orientation !== 'flex' ? $any(elementModel.orientation) : ''"
           [cdkDropListEnterPredicate]="onlyOneItemPredicate"
           (cdkDropListDropped)="drop($event)">
        <ng-container *ngFor="let value of $any(elementModel.value)">
          <div class="item text-item" *ngIf="!value.imgSrcValue" cdkDrag
               [ngClass]="{ 'vertical-orientation' : elementModel.orientation === 'vertical',
                            'horizontal-orientation' : elementModel.orientation === 'horizontal'}"
               [style.background-color]="elementModel.itemBackgroundColor"
               (cdkDragStarted)=dragStart() (cdkDragEnded)="dragEnd()">
            <div *cdkDragPreview
                 [style.font-size.px]="elementModel.fontProps.fontSize"
                 [style.background-color]="elementModel.itemBackgroundColor">
              {{value.stringValue}}
            </div>
            <div class="drag-placeholder" *cdkDragPlaceholder [style.min-height.px]="elementModel.fontProps.fontSize">
            </div>
            {{value.stringValue}}
          </div>
          <img *ngIf="value.imgSrcValue"
               [src]="value.imgSrcValue | safeResourceUrl" alt="Image Placeholder"
               [style.display]="elementModel.orientation === 'flex' ? '' : 'block'"
               class="item"
               [ngClass]="{ 'vertical-orientation' : elementModel.orientation === 'vertical',
                            'horizontal-orientation' : elementModel.orientation === 'horizontal'}"
               cdkDrag (cdkDragStarted)=dragStart() (cdkDragEnded)="dragEnd()"
               [style.object-fit]="'scale-down'">
        </ng-container>
      </div>
      <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched"
                 class="error-message">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
    </div>
  `,
  styles: [
    '.list {border-radius: 10px; margin-bottom: 3px;}', // extra margin to reserve for outline
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

    '.align-flex {flex: 1 1 auto; flex-flow: row wrap; display: flex; place-content: center space-around; gap: 10px}'
  ]
})
export class DropListComponent extends FormElementComponent {
  @Input() elementModel!: DropListElement;

  bodyElement: HTMLElement = document.body;

  dragStart(): void {
    this.bodyElement.classList.add('inheritCursors');
    this.bodyElement.style.cursor = 'grabbing';
  }

  dragEnd(): void {
    this.bodyElement.classList.remove('inheritCursors');
    this.bodyElement.style.cursor = 'unset';
  }

  drop(event: CdkDragDrop<DropListComponent>): void {
    if (!this.elementModel.readOnly) {
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data.elementModel.value as unknown as DragNDropValueObject[],
          event.previousIndex, event.currentIndex);
      } else {
        transferArrayItem(
          event.previousContainer.data.elementModel.value as unknown as DragNDropValueObject[],
          event.container.data.elementModel.value as unknown as DragNDropValueObject[],
          event.previousIndex,
          event.currentIndex
        );
        event.previousContainer.data.elementFormControl.setValue(
          (event.previousContainer.data.elementModel.value as DragNDropValueObject[])
            .map((valueObject: DragNDropValueObject) => valueObject.id)
        );
      }
      this.elementFormControl.setValue(
        (event.container.data.elementModel.value as DragNDropValueObject[])
          .map((valueObject: DragNDropValueObject) => valueObject.id)
      );
    }
  }

  onlyOneItemPredicate = (drag: CdkDrag, drop: CdkDropList): boolean => (
    !drop.data.elementModel.onlyOneItem || drop.data.elementModel.value.length < 1
  );
}
