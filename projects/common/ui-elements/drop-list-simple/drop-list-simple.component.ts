import { Component, Input } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import {
  CdkDrag, CdkDropList, moveItemInArray, transferArrayItem
} from '@angular/cdk/drag-drop';
import { DropListSimpleElement } from './drop-list-simple';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { DragNDropValueObject } from '../../models/uI-element';

@Component({
  selector: 'app-drop-list-simple',
  template: `
    <div class="list-container">
      <!-- Border width is a workaround to enable/disable the Material cdk-drop-list-receiving-->
      <!-- class style.-->
      <div class="list"
           [style.height.px]="elementModel.height"
           [style.width.px]="elementModel.width"
           [class.dropList-highlight]="elementModel.highlightReceivingDropList"
           [style.border-color]="elementModel.highlightReceivingDropListColor"
           [style.border-width.px]="elementModel.highlightReceivingDropList ? 2 : 0"
           [style.color]="elementModel.fontProps.fontColor"
           [style.font-family]="elementModel.fontProps.font"
           [style.font-size.px]="elementModel.fontProps.fontSize"
           [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
           [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''"
           [style.backgroundColor]="elementModel.surfaceProps.backgroundColor"
           cdkDropList
           [id]="elementModel.id"
           [cdkDropListData]="this"
           [cdkDropListConnectedTo]="elementModel.connectedTo"
           [cdkDropListEnterPredicate]="onlyOneItemPredicate"
           (cdkDropListDropped)="drop($event)">
        <div class="item" *ngFor="let value of $any(elementModel.value)"
             [style.line-height.px]="elementModel.height - 4"
             [style.background-color]="elementModel.itemBackgroundColor"
             cdkDrag (cdkDragStarted)=dragStart() (cdkDragEnded)="dragEnd()">
          <div *cdkDragPreview
               [style.font-size.px]="elementModel.fontProps.fontSize"
               [style.background-color]="elementModel.itemBackgroundColor">
            {{value.stringValue}}
          </div>
          <div class="drag-placeholder" *cdkDragPlaceholder [style.min-height.px]="elementModel.fontProps.fontSize">
          </div>
          {{value.stringValue}}
        </div>
      </div>
      <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched"
                 class="error-message">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
    </div>
  `,
  styles: [
    '.list-container {display: flex; flex-direction: column; width: 100%; height: 100%;}',
    '.list {width: 100%; height: 100%; border-radius: 5px}',
    '.item {border-radius: 5px; padding: 0 5px; height: 100%; text-align: center;}',
    '.item:not(:last-child) {margin-bottom: 5px;}',
    '.error-message {font-size: 75%; margin-top: 10px;}',
    '.cdk-drag-preview {padding: 8px 20px; border-radius: 10px}',
    '.drag-placeholder {background-color: lightgrey; border: dotted 3px #999; padding: 10px;}',
    '.drag-placeholder {transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);}',
    '.cdk-drag-animating {transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);}',

    '.dropList-highlight.cdk-drop-list-receiving {border: solid;}',
    '.dropList-highlight.cdk-drop-list-dragging {border: solid;}'
  ]
})
export class DropListSimpleComponent extends FormElementComponent {
  @Input() elementModel!: DropListSimpleElement;

  bodyElement: HTMLElement = document.body;

  dragStart(): void {
    this.bodyElement.classList.add('inheritCursors');
    this.bodyElement.style.cursor = 'grabbing';
  }

  dragEnd(): void {
    this.bodyElement.classList.remove('inheritCursors');
    this.bodyElement.style.cursor = 'unset';
  }

  drop(event: CdkDragDrop<DropListSimpleComponent>): void {
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
    drop.data.elementModel.value.length < 1 // TODO test?
  );
}
