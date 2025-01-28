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
  templateUrl: './drop-list.component.html',
  styleUrls: ['./drop-list.component.css']
})
export class DropListComponent extends FormElementComponent implements OnInit {
  @Input() elementModel!: DropListElement;
  @Input() clozeContext: boolean = false;
  @ViewChildren('listItem') droplistItems: QueryList<ElementRef> | undefined;

  // Needed for sortlists, where the displayed items are (temporarily) not the same as the actual form value
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
    this.endDragOperation();
  }

  endDragOperation(): void {
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
