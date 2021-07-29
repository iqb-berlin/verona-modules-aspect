import {
  Component, OnInit, OnDestroy, Input, Output,
  EventEmitter,
  ComponentFactoryResolver, ViewChild, ViewContainerRef, HostListener
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CdkDragMove } from '@angular/cdk/drag-drop';
import { UnitUIElement } from '../../../../../../../common/unit';
import * as ComponentUtils from '../../../../../../../common/component-utils';
import { UnitService } from '../../../../unit.service';
import { ValueChangeElement } from '../../../../../../../common/form';
import { ElementComponent } from '../../../../../../../common/element-component.directive';
import { FormElementComponent } from '../../../../../../../common/form-element-component.directive';

@Component({
  selector: 'app-canvas-drag-overlay',
  template: `
    <!--    Needs extra div because styling can interfere with drag and drop-->
    <div class="draggable-element" [class.draggable-element-selected]="selected"
         cdkDrag [cdkDragData]="this.element" [cdkDragDisabled]="!selected"
         (click)="click($event)"
         (dblclick)="openEditDialog()">
      <div [style.position]="'absolute'"
           [style.border]="selected ? '2px solid' : ''"
           [style.width.px]="element.width"
           [style.height.px]="element.height"
           [style.left.px]="element.xPosition"
           [style.top.px]="element.yPosition"
           [style.z-index]="element.zIndex">
        <!-- Element only for resizing   -->
        <!-- Extra droplist is needed to keep parent component droplist from handling the drop event. -->
        <!-- Also for cursor styling. -->
        <div cdkDropList class="test" *ngIf="selected"
             [style.width.%]="100"
             [style.height.%]="100">
          <div class="resizeHandle"
               cdkDrag (cdkDragStarted)="dragStart()" (cdkDragMoved)="resizeElement($event)"
               [style.right.px]="-1"
               [style.bottom.px]="-7"
               [style.z-index]="5">
            <mat-icon>aspect_ratio</mat-icon>
            <div *cdkDragPlaceholder></div>
          </div>
        </div>
        <ng-template #elementContainer></ng-template>
      </div>
    </div>
  `,
  styles: [
    'div {position: absolute}',
    '.draggable-element-selected {cursor: grab}',
    '.draggable-element-selected:active {cursor: grabbing}',
    '.draggable-element-selected .resizeHandle {cursor: nwse-resize}',
    '.test.cdk-drop-list-dragging {cursor: nwse-resize}'
  ]
})
export class CanvasDragOverlayComponent implements OnInit, OnDestroy {
  @Input() element!: UnitUIElement;
  @Output() elementSelected = new EventEmitter<{
    componentElement: CanvasDragOverlayComponent,
    multiSelect: boolean }>();

  @ViewChild('elementContainer', { read: ViewContainerRef, static: true }) private elementContainer!: ViewContainerRef;

  selected = false;
  private oldX: number = 0;
  private oldY: number = 0;
  private childComponent!: ElementComponent;
  private ngUnsubscribe = new Subject<void>();

  constructor(private unitService: UnitService,
              private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit(): void {
    const componentFactory = ComponentUtils.getComponentFactory(this.element.type, this.componentFactoryResolver);
    this.childComponent = this.elementContainer.createComponent(componentFactory).instance;
    this.childComponent.elementModel = this.element;
    if (this.childComponent instanceof FormElementComponent) {
      this.childComponent.formValueChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((changeElement: ValueChangeElement) => {
          this.unitService.updateElementProperty(this.element, 'value', changeElement.values[1]);
        });

      this.unitService.elementPropertyUpdated
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          (this.childComponent as FormElementComponent).updateFormValue(
            this.element.value as string | number | boolean | undefined
          );
        });
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!(event.target as Element).tagName.includes('input'.toUpperCase()) &&
      !(event.target as Element).tagName.includes('textarea'.toUpperCase()) &&
      event.key === 'Delete') {
      this.unitService.deleteElement(this.element);
    }
  }

  setSelected(newValue: boolean): void {
    this.selected = newValue;
  }

  click(event: MouseEvent): void {
    if (event.shiftKey) {
      this.elementSelected.emit({
        componentElement: this, multiSelect: true
      });
    } else {
      this.elementSelected.emit({
        componentElement: this, multiSelect: false
      });
    }
  }

  dragStart(): void {
    this.oldX = this.element.width;
    this.oldY = this.element.height;
  }

  resizeElement(event: CdkDragMove): void {
    this.unitService.updateElementProperty(this.element, 'width', Math.max(this.oldX + event.distance.x, 0));
    this.unitService.updateElementProperty(this.element, 'height', Math.max(this.oldY + event.distance.y, 0));
  }

  openEditDialog(): void {
    this.unitService.showDefaultEditDialog(this.element);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
