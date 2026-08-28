import {
  Component, Input, OnDestroy, OnInit,
  ComponentRef, ElementRef,
  ChangeDetectorRef,
  ViewChildren, QueryList
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DropListElement } from 'common/models/elements/drop-list';
import { DragEvent, DragStartEvent } from 'common/directives/draggable.directive';
import { FormElementComponent } from 'common/directives/form-element-component.directive';
import { DragNDropValueObject } from 'common/models/label-interfaces';
import { DragImageComponent } from 'common/components/drag-image/drag-image.component';
import { DragOperatorService } from 'common/services/drag-operator.service';
import { AudioPlayerService } from 'common/services/audio-player.service';

@Component({
  selector: 'aspect-drop-list',
  templateUrl: './drop-list.component.html',
  styleUrls: ['./drop-list.component.scss'],
  standalone: false
})
export class DropListComponent extends FormElementComponent implements OnInit, OnDestroy {
  @Input() elementModel!: DropListElement;
  @Input() clozeContext: boolean = false;
  @ViewChildren('listItem') droplistItems: QueryList<ElementRef> | undefined;

  /** Needed for sortlists, where the displayed items are (temporarily) not the same as the actual form value */
  viewModel!: DragNDropValueObject[];
  dragImageRef: ComponentRef<DragImageComponent> | undefined;
  /** Held so that `ngOnDestroy` can dispose it. The overlay lives in the CDK container next to the
      application, not inside this component's view, so it outlives the list unless it is taken down
      here -- and the CDK attaches its portal through `ApplicationRef`, so an abandoned one is also
      change-detected on every tick (#1403). */
  private dragImageOverlayRef: OverlayRef | undefined;
  isHovered = false;
  isHighlighted = false;

  constructor(public dragOpService: DragOperatorService, public elementRef: ElementRef,
              public cdr: ChangeDetectorRef, private overlay: Overlay,
              public audioPlayerService: AudioPlayerService) {
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
    if (this.dragOpService.hoveredListID === this.elementModel.id) return;
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
    this.dragImageOverlayRef = this.overlay.create();
    const componentPortal = new ComponentPortal(DragImageComponent);
    this.dragImageRef = this.dragImageOverlayRef.attach(componentPortal);
    this.dragImageRef.instance.clozeContext = this.clozeContext;
    this.dragImageRef.instance.styling = this.elementModel.styling;
  }

  refreshViewModel() {
    this.viewModel = [...this.elementFormControl.value];
  }

  updateFormvalue(): void {
    this.elementFormControl.setValue(this.elementFormControl.value);
  }

  ngOnDestroy(): void {
    this.dragOpService.unregisterComponent(this);
    this.dragImageOverlayRef?.dispose();
    /* Cleared along with the overlay: every use site guards with `?.`, which a reference to a disposed
       view passes, and the drag image would then run change detection on it. */
    this.dragImageRef = undefined;
  }
}
