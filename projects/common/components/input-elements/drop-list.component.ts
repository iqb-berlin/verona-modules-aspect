import {
  Component, Input, OnInit, Pipe, PipeTransform
} from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { DragNDropValueObject } from 'common/models/elements/element';
import { FormElementComponent } from '../../directives/form-element-component.directive';

@Component({
  selector: 'aspect-drop-list',
  template: `
<!--         [fxLayout]="elementModel.orientation | droplistLayout"-->
<!--         [fxLayoutAlign]="elementModel.orientation |  droplistLayoutAlign"-->
<!--         [class.vertical-orientation]="elementModel.orientation === 'vertical'"-->
<!--         [class.horizontal-orientation]="elementModel.orientation === 'horizontal'"-->
<!--         [class.only-one-item]="elementModel.onlyOneItem"-->
<!--         [style.min-height.px]="elementModel.position?.useMinHeight || clozeContext ? elementModel.height : undefined"-->
<!--         [style.border-color]="elementModel.highlightReceivingDropListColor"-->
<!--         tabindex="0"-->

    <div class="list" [id]="elementModel.id"
         [class.cloze-context]="clozeContext"
         [class.vertical-orientation]="elementModel.orientation === 'vertical'"
         [class.horizontal-orientation]="elementModel.orientation === 'horizontal'"
         [class.floating-orientation]="elementModel.orientation === 'flex'"
         cdkDropList
         [cdkDropListData]="this" [cdkDropListConnectedTo]="elementModel.connectedTo"
         [cdkDropListEnterPredicate]="onlyOneItemPredicate"
         (cdkDropListDropped)="drop($event)"
         [style.color]="elementModel.styling.fontColor"
         [style.font-family]="elementModel.styling.font"
         [style.font-size.px]="elementModel.styling.fontSize"
         [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
         [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
         [style.backgroundColor]="elementModel.styling.backgroundColor"
         [class.errors]="elementFormControl.errors && elementFormControl.touched"
         (focusout)="elementFormControl.markAsTouched()">
      <ng-container *ngFor="let dropListValueElement of elementModel.value let index = index;">
<!--             fxLayout="row"-->
<!--             [fxLayoutAlign]="elementModel.onlyOneItem ? (clozeContext ? 'center center' : 'start center') : 'none'"-->
        <div *ngIf="!dropListValueElement.imgSrc"
             class="list-item" cdkDrag
             [style.background-color]="elementModel.styling.itemBackgroundColor">
          <span>{{dropListValueElement.text}}</span>
          <div class="example-custom-placeholder" *cdkDragPlaceholder></div>
          <ng-template cdkDragPreview [matchSize]="true">
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
    // '.list {padding: 2px; display: flex; gap: 5px;}',
    '.list {display: flex; gap: 5px; box-sizing: border-box; padding: 5px}',
    '.list.vertical-orientation {flex-direction: column;}',
    '.list.horizontal-orientation {flex-direction: row;}',
    '.list.floating-orientation {place-content: center space-around; align-items: center; flex-flow: row wrap;}',
    // '.cloze-context.list {place-content: stretch; align-items: stretch;}',
    '.list-item {border-radius: 5px;}',
    // '.list-item {margin: 2px; border-radius: 5px;}',
    ':not(.cloze-context) .list-item {padding: 10px;}',
    '.cloze-context .list-item {padding: 0 5px;}',
    // '.cloze-context .list {padding: 0 5px;}',
    // '.cloze-context .list-item {padding: 0 5px; line-height: 1.2;}',
    // '.only-one-item.cloze-context .list-item {padding: 0;}',
    // '.only-one-item.cloze-context .list-item {padding: 0;}',
    // '.only-one-item:not(.cloze-context) .list-item {padding: 0 10px;}',
    // '.only-one-item .list-item {height: 100%; min-height: 100%; min-width: 100%; width: 100%; line-height: 1.2;}',
    // 'img.list-item {align-self: start; padding: 2px !important;}',
    'img.list-item {align-self: start;}',
    // '.vertical-orientation .list-item:not(:last-child) {margin-bottom: 5px;}',
    // '.horizontal-orientation .list-item:not(:last-child) {margin-right: 5px;}',
    // '.errors {border: 2px solid #f44336 !important;}',
    // '.error-message {font-size: 75%; margin-top: 10px; margin-left: 5px; position: absolute; pointer-events: none;}',
    // '.cloze-context-error-message {padding: 0 !important;}',
    // '.list-item {cursor: grab;}',
    // '.list-item:active {cursor: grabbing;}',

    '.cdk-drag-preview {border-radius: 5px; box-shadow: 2px 2px 5px black;}',

    '.cdk-drop-list-dragging .cdk-drag {transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);}',
    '.cdk-drop-list-receiving {background-color: cadetblue !important;}',
    // '.cdk-drop-list-receiving {border: 2px solid;}',
    // '.cdk-drop-list-receiving .list-item {margin: 0;}'
    '.example-custom-placeholder {background: #ccc; border: dotted 3px #999; min-height: 20px;}'
  ]
})
export class DropListComponent extends FormElementComponent {
  @Input() elementModel!: DropListElement;
  @Input() clozeContext: boolean = false;
  // viewModel: DragNDropValueObject[] = [];

  // ngOnInit() {
  //   super.ngOnInit();
  //   this.viewModel = [...this.elementFormControl.value];
  // }

  drop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data.elementModel.value, event.previousIndex, event.currentIndex);
      event.container.data.updateFormvalue();
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

  updateFormvalue(): void {
    this.elementFormControl.setValue(this.elementModel.value);
  }

  onlyOneItemPredicate = (drag: CdkDrag, drop: CdkDropList): boolean => (
    !drop.data.elementModel.onlyOneItem || drop.data.elementModel.value.length < 1
  );
}
