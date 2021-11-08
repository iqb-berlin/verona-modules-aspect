import { Component } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DropListElement } from '../../models/compound-elements/drop-list';
import { FormElementComponent } from '../../form-element-component.directive';

@Component({
  selector: 'app-drop-list',
  template: `
    <!-- TODO width/height 90 to not produce overflow. find better solution. -->
    <div class="list"
         [style.width.%]="90"
         [style.height.%]="90"
         [style.color]="elementModel.fontColor"
         [style.font-family]="elementModel.font"
         [style.font-size.px]="elementModel.fontSize"
         [style.font-weight]="elementModel.bold ? 'bold' : ''"
         [style.font-style]="elementModel.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.underline ? 'underline' : ''"
         [style.backgroundColor]="elementModel.backgroundColor"
         cdkDropList
         [id]="elementModel.id"
         [cdkDropListData]="this"
         [cdkDropListConnectedTo]="elementModel.connectedTo"
         (cdkDropListDropped)="drop($event)">
      <div class="item" *ngFor="let option of elementModel.options" cdkDrag>
        {{option}}
      </div>
    </div>
  `,
  styles: [
    '.list {border: 1px solid; border-radius: 3px}',
    '.item {padding: 10px;}',
    '.item:not(:last-child) {border-bottom: 1px solid;}'
  ]
})
export class DropListComponent extends FormElementComponent {
  elementModel!: DropListElement;

  drop(event: CdkDragDrop<DropListComponent>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data.elementModel.options, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data.elementModel.options,
        event.container.data.elementModel.options,
        event.previousIndex,
        event.currentIndex
      );
      event.previousContainer.data.elementFormControl.setValue(event.previousContainer.data.elementModel.options);
    }
    this.elementFormControl.setValue(event.container.data.elementModel.options);
  }
}
