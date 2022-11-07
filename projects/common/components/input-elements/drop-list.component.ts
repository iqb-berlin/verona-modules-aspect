// eslint-disable-next-line max-classes-per-file
import {
  AfterViewInit,
  Component, ElementRef, Input, OnDestroy, OnInit, Pipe, PipeTransform, ViewChild
} from '@angular/core';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { DragNDropValueObject } from 'common/models/elements/element';
import { FormElementComponent } from '../../directives/form-element-component.directive';

@Component({
  selector: 'aspect-drop-list',
  template: `
    <div class="list" [id]="elementModel.id"
         [fxLayout]="elementModel.orientation | droplistLayout"
         [fxLayoutAlign]="elementModel.orientation |  droplistLayoutAlign"
         [ngClass]="{ 'vertical-orientation' : elementModel.orientation === 'vertical',
                      'horizontal-orientation' : elementModel.orientation === 'horizontal',
                      'clozeContext': clozeContext}"
         [style.min-height.px]="elementModel.position?.useMinHeight ? elementModel.height : undefined"
         [style.color]="elementModel.styling.fontColor"
         [style.font-family]="elementModel.styling.font"
         [style.font-size.px]="elementModel.styling.fontSize"
         [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
         [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
         [style.backgroundColor]="elementModel.styling.backgroundColor"
         [class.errors]="elementFormControl.errors && elementFormControl.touched"
         [style.outline-color]="elementModel.highlightReceivingDropListColor"
         [class.highlight-valid-drop]="highlightValidDrop"
         [class.highlight-as-receiver]="highlightAsReceiver"
         (drop)="drop($event)" (dragenter)="dragEnterList($event)" (dragleave)="dragLeaveList($event)"
         (dragover)="$event.preventDefault()">
      <ng-container *ngFor="let dropListValueElement of viewModel let index = index;">
        <div class="list-item"
             draggable="true"
             (dragstart)="dragStart($event, dropListValueElement, index)" (dragend)="dragEnd($event)"
             (dragenter)="dragEnterItem($event)"
             [class.show-as-placeholder]="showAsPlaceholder && placeHolderIndex === index"
             [class.show-as-hidden]="hidePlaceholder && placeHolderIndex === index"
             [style.pointer-events]="dragging && elementModel.isSortList === false ? 'none' : ''"
             [style.background-color]="elementModel.styling.itemBackgroundColor">
          <span>{{dropListValueElement.text}}</span>
        </div>
        <img *ngIf="dropListValueElement.imgSrc"
             class="list-item"
             [src]="dropListValueElement.imgSrc | safeResourceUrl" alt="Image Placeholder"
             draggable="true" [id]="dropListValueElement.id"
             (dragstart)="dragStart($event, dropListValueElement, index)" (dragend)="dragEnd($event)"
             [style.object-fit]="'scale-down'">
      </ng-container>
    </div>
    <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched"
               class="error-message">
      {{elementFormControl.errors | errorTransform: elementModel}}
    </mat-error>
  `,
  styles: [
    '.list {width: 100%; height: 100%; background-color: rgb(244, 244, 242); padding: 3px;}',
    ':not(.clozeContext) .list-item {border-radius: 5px; padding: 10px;}',
    '.vertical-orientation .list-item:not(:last-child) {margin-bottom: 5px;}',
    '.horizontal-orientation .list-item:not(:last-child) {margin-right: 5px;}',
    '.errors {outline: 2px solid #f44336 !important;}',
    '.list-item {cursor: grab;}',
    '.list-item:active {cursor: grabbing}',
    '.show-as-placeholder {opacity: 0.5 !important; pointer-events: none;}',
    '.highlight-valid-drop {background-color: lightblue !important;}',
    '.highlight-as-receiver {outline: 2px solid;}',
    '.show-as-hidden {visibility: hidden;}'
  ]
})
export class DropListComponent extends FormElementComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() elementModel!: DropListElement;
  @Input() clozeContext: boolean = false;
  @ViewChild('placeholder') placeholder!: ElementRef<HTMLElement>;
  static dragAndDropComponents: { [id: string]: DropListComponent } = {};

  viewModel: DragNDropValueObject[] = [];
  placeHolderIndex?: number;
  highlightAsReceiver = false;

  dragging = false;

  showAsPlaceholder = false;
  hidePlaceholder = false;
  highlightValidDrop = false;

  static draggedElement?: DragNDropValueObject;
  static sourceList?: DropListComponent;

  ngOnInit() {
    super.ngOnInit();
    this.viewModel = [...this.elementFormControl.value];
  }

  ngAfterViewInit() {
    DropListComponent.dragAndDropComponents[this.elementModel.id] = this;
  }

  dragStart(dragEvent: DragEvent,
            dropListValueElement: DragNDropValueObject,
            sourceListIndex: number) {
    if (dragEvent.dataTransfer) {
      dragEvent.dataTransfer.effectAllowed = 'copyMove';
      dragEvent.dataTransfer.setDragImage(
        DropListComponent.createDragImage(dragEvent.target as Node, dropListValueElement.id), 0, 0);
    }

    DropListComponent.draggedElement = dropListValueElement;
    DropListComponent.sourceList = this;
    this.placeHolderIndex = sourceListIndex;
    if (this.elementModel.isSortList) {
      this.showAsPlaceholder = true;
    } else {
      this.hidePlaceholder = true;
      this.highlightValidDrop = true;
    }

    Object.entries(DropListComponent.dragAndDropComponents)
      .forEach(([, value]) => {
        value.dragging = true;
      });

    if (this.elementModel.highlightReceivingDropList) {
      this.highlightAsReceiver = true;
      this.elementModel.connectedTo.forEach(connectedDropListID => {
        DropListComponent.dragAndDropComponents[connectedDropListID].highlightAsReceiver = true;
      });
    }
  }

  static createDragImage(baseElement: Node, baseID: string): HTMLElement {
    const dragImage: HTMLElement = baseElement.cloneNode(true) as HTMLElement;
    dragImage.id = `${baseID}-dragimage`;
    dragImage.style.display = 'inline-block';
    document.body.appendChild(dragImage);
    return dragImage;
  }

  dragEnterItem(event: DragEvent) {
    event.preventDefault();

    if (this.elementModel.isSortList && DropListComponent.sourceList === this) {
      const sourceIndex: number = this.placeHolderIndex as number;
      const targetIndex: number = Array.from((event.target as any).parentNode.children).indexOf(event.target);
      const removedElement = this.viewModel.splice(sourceIndex, 1)[0];
      this.viewModel.splice(targetIndex, 0, removedElement);
      this.placeHolderIndex = targetIndex;
    }
  }

  dragEnterList(event: DragEvent) {
    event.preventDefault();

    if (!this.elementModel.isSortList) {
      this.highlightValidDrop = true;
    } else if (DropListComponent.sourceList !== this) {
      this.viewModel.push(DropListComponent.draggedElement as DragNDropValueObject);
      const sourceList = DropListComponent.sourceList as DropListComponent;
      sourceList.viewModel.splice(sourceList.placeHolderIndex as number, 1);
      sourceList.elementFormControl.setValue(sourceList.viewModel);
      sourceList.placeHolderIndex = undefined;
      DropListComponent.sourceList = this;
      this.placeHolderIndex = this.viewModel.length > 0 ? this.viewModel.length - 1 : 0;
    }
  }

  dragLeaveList(event: DragEvent) {
    event.preventDefault();
    this.highlightValidDrop = false;
  }

  drop(event: DragEvent) {
    event.preventDefault();

    if (DropListComponent.sourceList === this && this.elementModel.isSortList) {
      this.elementFormControl.setValue(this.viewModel);
    } else if (this.isDropAllowed((DropListComponent.sourceList as DropListComponent).elementModel.connectedTo)) {
      const presentValueIDs = this.elementFormControl.value
        .map((valueValue: DragNDropValueObject) => valueValue.id);
      if (!presentValueIDs.includes(DropListComponent.draggedElement?.id)) {
        this.viewModel.push(DropListComponent.draggedElement as DragNDropValueObject);
        this.elementFormControl.setValue(this.viewModel);
        if (!DropListComponent.sourceList?.elementModel.copyOnDrop) {
          DropListComponent.sourceList?.viewModel.splice(this.placeHolderIndex as number, 1);
          DropListComponent.sourceList?.elementFormControl.setValue(DropListComponent.sourceList.viewModel);
        }
      }
    } else {
      console.log('Not an allowed target list');
    }
    this.dragEnd();
  }

  isDropAllowed(connectedDropLists: string[]): boolean {
    return (connectedDropLists as string[]).includes(this.elementModel.id) &&
           !(this.elementModel.onlyOneItem && this.elementModel.value.length > 0);
    // TODO presentValueIDs?
  }

  dragEnd(event?: DragEvent) {
    event?.preventDefault();

    Object.entries(DropListComponent.dragAndDropComponents)
      .forEach(([, value]) => {
        value.highlightAsReceiver = false;
        value.dragging = false;
        value.highlightValidDrop = false;
      });
    if (DropListComponent.sourceList) DropListComponent.sourceList.placeHolderIndex = undefined;
    this.placeHolderIndex = undefined;

    document.getElementById(`${DropListComponent.draggedElement?.id}-dragimage`)?.remove();
  }

  ngOnDestroy(): void {
    delete DropListComponent.dragAndDropComponents[this.elementModel.id];
  }
}

@Pipe({
  name: 'droplistLayout'
})
export class DropListLayoutPipe implements PipeTransform {
  transform(orientation: string): string {
    switch (orientation) {
      case 'horizontal':
        return 'row';
      case 'vertical':
        return 'column';
      case 'flex':
        return 'row wrap';
      default:
        throw Error(`droplist orientation invalid: ${orientation}`);
    }
  }
}

@Pipe({
  name: 'droplistLayoutAlign'
})
export class DropListLayoutAlignPipe implements PipeTransform {
  transform(orientation: string): string {
    switch (orientation) {
      case 'horizontal':
        return 'start start';
      case 'vertical':
        return 'start stretch';
      case 'flex':
        return 'space-around center';
      default:
        throw Error(`droplist orientation invalid: ${orientation}`);
    }
  }
}
