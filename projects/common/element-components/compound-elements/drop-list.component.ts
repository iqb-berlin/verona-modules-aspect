import { Component } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import {
  CdkDrag, CdkDropList, moveItemInArray, transferArrayItem
} from '@angular/cdk/drag-drop';
import { DropListElement } from '../../models/compound-elements/drop-list';
import { FormElementComponent } from '../../form-element-component.directive';

@Component({
  selector: 'app-drop-list',
  template: `
    <div class="list-container">
      <div class="list"
           [style.color]="elementModel.fontColor"
           [style.font-family]="elementModel.font"
           [style.font-size.px]="elementModel.fontSize"
           [style.font-weight]="elementModel.bold ? 'bold' : ''"
           [style.font-style]="elementModel.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.underline ? 'underline' : ''"
           [style.backgroundColor]="elementModel.backgroundColor"
           [style.display]="elementModel.orientation === 'horizontal' ? 'flex' : ''"
           [style.flex-direction]="elementModel.orientation === 'horizontal' ? 'row' : ''"
           cdkDropList
           [id]="elementModel.id"
           [cdkDropListData]="this"
           [cdkDropListConnectedTo]="elementModel.connectedTo"
           [cdkDropListOrientation]="elementModel.orientation"
           [cdkDropListEnterPredicate]="onlyOneItemPredicate"
           (cdkDropListDropped)="drop($event)">
        <div class="item" *ngFor="let value of $any(elementModel.value)" cdkDrag
             [ngClass]="{'vertical-item': elementModel.orientation === 'vertical',
                         'horizontal-item': elementModel.orientation === 'horizontal'}">
          <div *cdkDragPreview>{{value}}</div>
          <div class="drag-placeholder" *cdkDragPlaceholder [style.min-height.px]="elementModel.fontSize"></div>
          {{value}}
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
    '.list {border: 1px solid; border-radius: 3px; width: calc(100% - 2px); height: calc(100% - 2px);}',
    '.item {padding: 10px;}',
    '.error-message {font-size: 75%; margin-top: 10px;}',
    '.vertical-item {border-bottom: 1px solid;}',
    '.horizontal-item {border-right: 1px solid;}',
    '.item:last-child {border: none;}',
    '.cdk-drag-preview {background-color: lightgrey; padding: 8px 20px; border-radius: 3px}',
    '.drag-placeholder {background-color: lightgrey; border: dotted 3px #999; padding: 10px;}',
    '.drag-placeholder {transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);}',
    '.cdk-drag-animating {transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);}'
  ]
})
export class DropListComponent extends FormElementComponent {
  elementModel!: DropListElement;

  drop(event: CdkDragDrop<DropListComponent>): void {
    if (!this.elementModel.readOnly) {
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data.elementModel.value as string[], event.previousIndex, event.currentIndex);
      } else {
        transferArrayItem(
          event.previousContainer.data.elementModel.value as string[],
          event.container.data.elementModel.value as string[],
          event.previousIndex,
          event.currentIndex
        );
        event.previousContainer.data.elementFormControl.setValue(event.previousContainer.data.elementModel.value);
      }
      this.elementFormControl.setValue(event.container.data.elementModel.value);
    }
  }

  onlyOneItemPredicate = (drag: CdkDrag, drop: CdkDropList): boolean => (
    !drop.data.elementModel.onlyOneItem || drop.data.elementModel.value.length < 1
  );
}
