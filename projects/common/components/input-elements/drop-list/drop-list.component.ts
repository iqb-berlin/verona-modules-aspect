import {
  Component, Input, OnInit,
  ComponentRef, ElementRef,
  ChangeDetectorRef,
  ViewChildren, QueryList
} from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { DragEvent, DragStartEvent } from 'common/components/input-elements/drop-list/draggable.directive';
import { FormElementComponent } from 'common/directives/form-element-component.directive';
import { DragNDropValueObject } from 'common/interfaces';
import { DragImageComponent } from './drag-image.component';
import { DragOperatorService } from './drag-operator.service';

@Component({
  selector: 'aspect-drop-list',
  template: `
    <span *ngIf="clozeContext" [style.width.px]="0">&nbsp;</span>
    <!-- TODO testen, ob touchstart keine Probleme macht -->
    <div class="drop-list" id="{{elementModel.alias}}" #droplist
         [class.cloze-context]="clozeContext"
         [class.hovered]="!elementModel.isSortList && isHovered"
         [class.isHighlighted]="isHighlighted"
         [class.column]="elementModel.orientation === 'vertical'"
         [class.row]="elementModel.orientation === 'horizontal'"
         [class.float]="elementModel.orientation === 'flex'"
         [style.outline-color]="elementModel.highlightReceivingDropListColor"
         [style.border-color]="elementModel.highlightReceivingDropListColor"
         [style.color]="elementModel.styling.fontColor"
         [style.font-size.px]="elementModel.styling.fontSize"
         [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
         [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
         [style.background-color]="elementModel.styling.backgroundColor"
         (touchstart)="elementFormControl.markAsTouched()"
         (mouseenter)="dragOpService.isDragActive && dragEnter()"
         (mouseleave)="dragOpService.isDragActive && dragLeave()"
         (click)="elementFormControl.markAsTouched()">
      <div *ngFor="let item of viewModel; let i = index;" class="list-item-wrapper">
        <div *ngIf="!clozeContext && elementModel.showNumbering" class="numbering">
          {{ i + (elementModel.startNumberingAtZero ? 0 : 1) }}.
        </div>
        <div class="drop-list-item" [class.image-item]="item.imgSrc"
             #listItem
             aspect-draggable data-aspect-draggable="true"
             (dragStart)="dragStart($event, item, i, this)"
             (dragMove)="dragMove($event)"
             (dragEnd)="dragEnd()"
             (mouseenter)="dragOpService.isDragActive && listItemDragEnter(i)"
             [style.color]="elementModel.styling.fontColor"
             [style.font-size.px]="elementModel.styling.fontSize"
             [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
             [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
             [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
             [style.background-color]="elementModel.styling.itemBackgroundColor"
             [class.read-only]="elementModel.readOnly">
          <aspect-text-image-panel [label]="item"></aspect-text-image-panel>
        </div>
      </div>
    <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched"
               class="error-message">
      {{elementFormControl.errors | errorTransform: elementModel}}
    </mat-error>
    </div>
  `,
  styleUrls: ['./drop-list.component.css']
})
export class DropListComponent extends FormElementComponent implements OnInit {
  @Input() elementModel!: DropListElement;
  @Input() clozeContext: boolean = false;
  @ViewChildren('listItem') droplistItems: QueryList<ElementRef> | undefined;

  viewModel!: DragNDropValueObject[];
  dragImageRef: ComponentRef<DragImageComponent> | undefined;
  isHovered = false;
  isHighlighted = false;

  constructor(public dragOpService: DragOperatorService, public elementRef: ElementRef,
              public cdr: ChangeDetectorRef, private overlay: Overlay) {
    super(elementRef);
  }

  ngOnInit() {
    super.ngOnInit();
    this.viewModel = this.parentForm ? [...this.elementFormControl.value] : this.elementModel.value;
    this.dragOpService.registerComponent(this);
    this.initDragImageOverlay();
  }

  dragStart(event: DragStartEvent, item: DragNDropValueObject, index: number, sourceListComponent: DropListComponent) {
    if (this.dragOpService.isDragActive) { // Prevent pickung up second element while holding another (2 fingers)
      return;
    }
    this.dragOpService.startDrag(event.sourceElement, sourceListComponent, index, item, event.dragType);
    this.dragImageRef?.instance.initDragPreview(item, event.sourceElement, event.x, event.y);
    document.body.classList.add('dragging-active'); // add class for cursor while dragging
    this.cdr.detectChanges(); // needed for placeholder
  }

  dragMove(e: DragEvent) {
    this.dragImageRef?.instance.setDragPreviewPosition(e.x, e.y);
    if (this.dragOpService.dragOperation?.dragType === 'touch') this.dragOpService.checkHoveredListOrElement(e.x, e.y);
  }

  dragEnter(): void {
    // Workaround for the mouseenter event after reordering, thus triggering a source index reset.
    if (this.dragOpService.isListHovered) return;
    if (!this.dragOpService.isListEligible(this.elementModel.id)) return;
    this.isHovered = true;
    this.dragOpService.setTargetList(this.elementModel.id);
    this.cdr.detectChanges();
  }

  dragLeave(): void {
    this.isHovered = false;
    this.dragOpService.unSetTargetList();
    if (this.elementModel.isSortList) {
      this.refreshViewModel();
    }
    this.cdr.detectChanges();
  }

  dragEnd() {
    this.dragOpService.handleDrop();
    this.dragImageRef?.instance.unsetDragPreview();
    this.dragOpService.endDrag();
    document.body.classList.remove('dragging-active'); // remove class for cursor while dragging
  }

  listItemDragEnter(index: number): void {
    if (!this.elementModel.isSortList) return;
    this.dragOpService.positionSortPlaceholder(index);
  }

  initDragImageOverlay() {
    const overlayRef = this.overlay.create();
    const componentPortal = new ComponentPortal(DragImageComponent);
    this.dragImageRef = overlayRef.attach(componentPortal);
    this.dragImageRef.instance.clozeContext = this.clozeContext;
    this.dragImageRef.instance.styling = this.elementModel.styling;
  }

  refreshViewModel() {
    this.viewModel = [...this.elementFormControl.value];
  }

  updateFormvalue(): void {
    this.elementFormControl.setValue(this.elementFormControl.value);
  }
}
