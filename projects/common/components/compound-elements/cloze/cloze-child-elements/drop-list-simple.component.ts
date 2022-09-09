import { Component, Input } from '@angular/core';
import { CdkDragDrop, CdkDragEnter, CdkDragStart } from '@angular/cdk/drag-drop/drag-events';
import {
  CdkDrag, CdkDropList, moveItemInArray, transferArrayItem
} from '@angular/cdk/drag-drop';
import { FormElementComponent } from 'common/directives/form-element-component.directive';
import { DropListSimpleElement } from
  'common/models/elements/compound-elements/cloze/cloze-child-elements/drop-list-simple';
import { DragNDropValueObject } from 'common/models/elements/element';
import { DropListComponent } from 'common/components/input-elements/drop-list.component';

@Component({
  selector: 'aspect-drop-list-simple',
  template: `
    <div class="list-container">
        <!-- Border width is a workaround to enable/disable the Material cdk-drop-list-receiving class style.-->
      <div class="list"
           [class.errors]="elementFormControl.errors && elementFormControl.touched"
           [class.dropList-highlight]="elementModel.highlightReceivingDropList"
           [style.min-height.px]="elementModel.height"
           [style.border-color]="elementModel.highlightReceivingDropListColor"
           [style.border-width.px]="elementModel.highlightReceivingDropList ? 2 : 0"
           [style.color]="elementModel.styling.fontColor"
           [style.font-family]="elementModel.styling.font"
           [style.font-size.px]="elementModel.styling.fontSize"
           [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
           [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
           [style.backgroundColor]="elementModel.styling.backgroundColor"
           [matTooltip]="elementFormControl.errors && elementFormControl.touched ?
                         (elementFormControl.errors | errorTransform: elementModel) : ''"
           [matTooltipClass]="'error-tooltip'"
           cdkDropList
           [id]="elementModel.id"
           [cdkDropListData]="this"
           [cdkDropListConnectedTo]="elementModel.connectedTo"
           [cdkDropListEnterPredicate]="onlyOneItemPredicate"
           tabindex="0"
           (focusout)="elementFormControl.markAsTouched()"
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
               (cdkDragStarted)="dragStart($event)" (cdkDragEnded)="dragEnd()" (cdkDragEntered)="dragEnter($event)">
            <div *cdkDragPreview
                 [style.font-size.px]="elementModel.styling.fontSize"
                 [style.background-color]="elementModel.styling.itemBackgroundColor">
              {{value.text}}
            </div>
            <div class="drag-placeholder" *cdkDragPlaceholder
                 [style.height.px]="placeHolderHeight">
            </div>
            {{value.text}}
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [
    '.list-container {display: flex; flex-direction: column; width: 100%; height: 100%;}',
    '.list {width: 100%; height: 100%; border-radius: 5px}',
    '.item {border-radius: 5px; padding: 0 5px; height: 100%; text-align: center;}',
    '.item:not(:last-child) {margin-bottom: 5px;}',
    '.item:active {cursor: grabbing}',
    '.errors {box-sizing: border-box; border: 2px solid #f44336 !important;}',
    '.error-message {font-size: 75%; margin-top: 10px;}',
    '.cdk-drag-preview {padding: 8px 20px; border-radius: 10px; box-shadow: 2px 2px 1px black;}',
    '.drag-placeholder {box-sizing: border-box; border-radius: 5px; background-color: lightgrey; border: dotted 3px #999;}',
    '.drag-placeholder {transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);}',
    '.cdk-drag-animating {transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);}',

    '.dropList-highlight.cdk-drop-list-receiving {border: solid;}',
    '.dropList-highlight.cdk-drop-list-dragging {border: solid;}'
  ]
})
export class DropListSimpleComponent extends FormElementComponent {
  @Input() elementModel!: DropListSimpleElement;
  placeHolderHeight: number = 50;

  bodyElement: HTMLElement = document.body;

  dragStart(event: CdkDragStart<DropListSimpleComponent>): void {
    const containerHeight = event.source.dropContainer.data.elementRef.nativeElement.offsetHeight;
    this.placeHolderHeight = event.source.dropContainer.data instanceof DropListSimpleComponent ? containerHeight - 2 : 50;
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
          event.previousIndex,
          event.currentIndex);
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

  dragEnter(event: CdkDragEnter<DropListSimpleComponent | DropListComponent, { element: DragNDropValueObject }>) {
    const presentValueIDs = event.container.data.elementFormControl.value
      .map((value: DragNDropValueObject) => value.id);
    const itemCountOffset = presentValueIDs.includes(event.item.data.element.id) ? 1 : 0;
    const containerHeight = event.container.data.elementRef.nativeElement.offsetHeight;
    const itemsCount = presentValueIDs.length - itemCountOffset;
    const condition = event.container.data instanceof DropListSimpleComponent || !itemsCount;
    this.placeHolderHeight = condition ? containerHeight - 2 : 50;
  }

  onlyOneItemPredicate = (drag: CdkDrag, drop: CdkDropList): boolean => (
    drop.data.elementFormControl.value.length < 1
  );
}
