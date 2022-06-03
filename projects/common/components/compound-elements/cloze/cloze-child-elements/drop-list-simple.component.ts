import { Component, Input } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import {
  CdkDrag, CdkDropList, moveItemInArray, transferArrayItem
} from '@angular/cdk/drag-drop';
import { FormElementComponent } from 'common/directives/form-element-component.directive';
import { DropListSimpleElement } from
  'common/models/elements/compound-elements/cloze/cloze-child-elements/drop-list-simple';
import { DragNDropValueObject } from 'common/models/elements/element';

@Component({
  selector: 'aspect-drop-list-simple',
  template: `
    <div class="list-container">
        <!-- Border width is a workaround to enable/disable the Material cdk-drop-list-receiving class style.-->
      <div class="list"
           [class.dropList-highlight]="elementModel.highlightReceivingDropList"
           [style.border-color]="elementModel.highlightReceivingDropListColor"
           [style.border-width.px]="elementModel.highlightReceivingDropList ? 2 : 0"
           [style.color]="elementModel.styling.fontColor"
           [style.font-family]="elementModel.styling.font"
           [style.font-size.px]="elementModel.styling.fontSize"
           [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
           [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
           [style.backgroundColor]="elementModel.styling.backgroundColor"
           cdkDropList
           [id]="elementModel.id"
           [cdkDropListData]="this"
           [cdkDropListConnectedTo]="elementModel.connectedTo"
           [cdkDropListEnterPredicate]="onlyOneItemPredicate"
           (cdkDropListDropped)="drop($event)">
        <ng-container *ngIf="!parentForm">
            <ng-container *ngFor="let dropListValueElement of $any(elementModel.value)">
                <ng-container [ngTemplateOutlet]="dropObject"
                              [ngTemplateOutletContext]="{ $implicit: dropListValueElement }">
                </ng-container>
            </ng-container>
        </ng-container>

        <ng-container *ngIf="parentForm">
            <ng-container *ngFor="let value of elementFormControl.value">
                <ng-container [ngTemplateOutlet]="dropObject" [ngTemplateOutletContext]="{ $implicit: value }">
                </ng-container>
            </ng-container>
        </ng-container>

        <ng-template #dropObject let-value>
          <div class="item"
               [style.background-color]="elementModel.styling.itemBackgroundColor"
               cdkDrag [cdkDragData]="{ element: value }"
               (cdkDragStarted)=dragStart() (cdkDragEnded)="dragEnd()">
            <div *cdkDragPreview
                 [style.font-size.px]="elementModel.styling.fontSize"
                 [style.background-color]="elementModel.styling.itemBackgroundColor">
              {{value.stringValue}}
            </div>
            <div class="drag-placeholder" *cdkDragPlaceholder
                 [style.min-height.px]="elementModel.styling.fontSize">
            </div>
            {{value.stringValue}}
          </div>
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
    '.list {width: 100%; height: 100%; border-radius: 5px}',
    '.item {border-radius: 5px; padding: 0 5px; height: 100%; text-align: center;}',
    '.item:not(:last-child) {margin-bottom: 5px;}',
    '.error-message {font-size: 75%; margin-top: 10px;}',
    '.cdk-drag-preview {padding: 8px 20px; border-radius: 10px}',
    '.drag-placeholder {background-color: lightgrey; border: dotted 3px #999;}',
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
        moveItemInArray(event.container.data.elementFormControl.value as unknown as DragNDropValueObject[],
          event.previousIndex, event.currentIndex);
        this.elementFormControl.setValue(
          (event.container.data.elementFormControl.value as DragNDropValueObject[])
        );
      } else {
        transferArrayItem(
          event.previousContainer.data.elementFormControl.value as unknown as DragNDropValueObject[],
          event.container.data.elementFormControl.value as unknown as DragNDropValueObject[],
          event.previousIndex,
          event.currentIndex
        );
        event.previousContainer.data.elementFormControl.setValue(
          (event.previousContainer.data.elementFormControl.value as DragNDropValueObject[])
        );
      }
      this.elementFormControl.setValue(
        (event.container.data.elementFormControl.value as DragNDropValueObject[])
      );
    }
  }

  onlyOneItemPredicate = (drag: CdkDrag, drop: CdkDropList): boolean => (
    drop.data.elementFormControl.value.length < 1
  );
}
