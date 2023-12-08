import {
  Component, Input, OnInit,
  ComponentRef, ElementRef,
  ChangeDetectorRef, Renderer2,
  ViewChild, ViewChildren, QueryList
} from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { DragNDropValueObject } from 'common/models/elements/label-interfaces';
import { DragEvent, DragStartEvent } from 'common/components/input-elements/drop-list/draggable.directive';
import { FormElementComponent } from 'common/directives/form-element-component.directive';
import { DragImageComponent } from './drag-image.component';
import { DragOperatorService } from './drag-operator.service';

@Component({
  selector: 'aspect-drop-list',
  template: `
    <div *ngIf="clozeContext" [style.width.px]="0">&nbsp;</div>
    <!-- TODO testen, ob touchstart keine Probleme macht -->
    <div class="drop-list" id="{{elementModel.id}}" #droplist
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
         (click)="elementFormControl.markAsTouched()">
      <div *ngFor="let item of viewModel; let i = index;"
           class="drop-list-item" [class.image-item]="item.imgSrc"
           #listItem
           aspect-draggable data-aspect-draggable="true"
           (dragStart)="dragStart($event, item, i, this)"
           (dragMove)="dragMove($event)"
           (dragEnd)="dragEnd()"
           [style.color]="elementModel.styling.fontColor"
           [style.font-size.px]="elementModel.styling.fontSize"
           [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
           [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
           [style.background-color]="elementModel.styling.itemBackgroundColor">
        <aspect-text-image-panel [label]="item"></aspect-text-image-panel>
      </div>
    <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched"
               class="error-message">
      {{elementFormControl.errors | errorTransform: elementModel}}
    </mat-error>
    </div>
  `,
  styles: [`
    :host {display: flex !important; width: 100%; height: 100%;}
    .drop-list {
      width: 100%; height: 100%;
      display: flex;
      gap: 5px;
      box-sizing: border-box;
      padding: 5px;
      background-color: rgb(244, 244, 242);
      border-radius: 5px;
      cursor: grab;
    }
    .drop-list.row {
      flex-direction: row;
    }
    .drop-list.column {
      flex-direction: column;
    }
    .drop-list.float {
      place-content: center space-around; align-items: center; flex-flow: row wrap;
    }
    .cloze-context.drop-list {padding: 0; color: transparent;}
    .drop-list.hovered {filter: brightness(80%)}
    .drop-list.isHighlighted {
      border: 2px solid;
      padding: 3px;
    }
    .drop-list-item {
      padding: 10px;
      border-radius: 5px;
      cursor: grab;
      transition: all .3s linear;
    }
    .image-item {
      padding: 5px;
    }
    .cloze-context .drop-list-item {
      padding: 0 5px;
      justify-content: center;
    }
    .drop-list-item.show-as-placeholder { /* set via controller */
      background-color: #ccc !important;
      color: transparent !important;
      pointer-events: none;
    }
    .cloze-context .error-message {
      white-space: nowrap;
      font-size: smaller;
    }
    `
  ]
})
export class DropListComponent extends FormElementComponent implements OnInit {
  @Input() elementModel!: DropListElement;
  @Input() clozeContext: boolean = false;
  @ViewChild('droplist') droplistRef: ElementRef | undefined;
  @ViewChildren('listItem') droplistItems: QueryList<ElementRef> | undefined;

  viewModel!: DragNDropValueObject[];
  dragImageRef: ComponentRef<DragImageComponent> | undefined;
  isHovered = false;
  isHighlighted = false;

  private unlistenMouseEnter: (() => void) | undefined;
  private unlistenMouseLeave: (() => void) | undefined;
  private unlistenItemMouseEnter: (() => void)[] = [];

  constructor(public dragOpService: DragOperatorService, public elementRef: ElementRef,
              private renderer2: Renderer2, public cdr: ChangeDetectorRef, private overlay: Overlay) {
    super(elementRef);
  }

  ngOnInit() {
    super.ngOnInit();
    this.viewModel = this.parentForm ? [...this.elementFormControl.value] : this.elementModel.value;
    this.dragOpService.registerComponent(this);
    this.initDragImageOverlay();
  }

  dragStart(event: DragStartEvent, item: DragNDropValueObject, index: number, sourceListComponent: DropListComponent) {
    this.dragOpService.startDrag(event.sourceElement, sourceListComponent, index, item, event.dragType);
    this.dragImageRef?.instance.initDragPreview(item, event.sourceElement, event.x, event.y);
    document.body.classList.add('dragging-active'); // add class for cursor while dragging
    this.cdr.detectChanges(); // needed for placeholder
  }

  dragMove(e: DragEvent) {
    this.dragImageRef?.instance.setDragPreviewPosition(e.x, e.y);
    if (this.dragOpService.dragOperation?.dragType === 'touch') this.dragOpService.checkHovered(e.x, e.y);
  }

  dragEnter(): void {
    this.isHovered = true;
    this.dragOpService.setTargetList(this.elementModel.id);
    this.cdr.detectChanges();
  }

  dragLeave(): void {
    this.isHovered = false;
    this.dragOpService.unSetTargetList();
    if (this.elementModel.isSortList) {
      this.refreshItemsFromForm();
    }
    this.cdr.detectChanges();
  }

  dragEnd() {
    this.dragOpService.handleDrop();
    this.dragImageRef?.instance.unsetDragPreview();
    this.dragOpService.endDrag();
    document.body.classList.remove('dragging-active'); // remove class for cursor while dragging
  }

  listenForHover() {
    this.unlistenMouseEnter = this.renderer2.listen(this.droplistRef?.nativeElement, 'mouseenter', () => {
      this.dragEnter();
    });
    this.unlistenMouseLeave = this.renderer2.listen(this.droplistRef?.nativeElement, 'mouseleave', () => {
      this.dragLeave();
    });

    if (this.elementModel.isSortList) {
      this.droplistItems?.toArray()
        .forEach(listItem => {
          this.unlistenItemMouseEnter.push(
            this.renderer2.listen(listItem.nativeElement, 'mouseenter', (event: MouseEvent) => {
              const targetIndex = Array.from(this.droplistRef?.nativeElement.children).indexOf(event.target);
              this.dragOpService.positionSortPlaceholder(targetIndex);
              this.cdr.detectChanges();
            })
          );
        });
    }
  }

  stopListenForHover() {
    this.unlistenMouseEnter?.();
    this.unlistenMouseLeave?.();
    this.unlistenItemMouseEnter.forEach(listener => listener());
  }

  initDragImageOverlay() {
    const overlayRef = this.overlay.create();
    const componentPortal = new ComponentPortal(DragImageComponent);
    this.dragImageRef = overlayRef.attach(componentPortal);
    this.dragImageRef.instance.clozeContext = this.clozeContext;
    this.dragImageRef.instance.styling = this.elementModel.styling;
  }

  refreshItemsFromForm() {
    this.viewModel = [...this.elementFormControl.value];
  }

  updateFormvalue(): void {
    this.elementFormControl.setValue(this.elementFormControl.value);
  }
}
