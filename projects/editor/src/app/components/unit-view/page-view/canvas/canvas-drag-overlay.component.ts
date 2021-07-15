import {
  Component, OnInit, Input, Output, EventEmitter, ComponentFactoryResolver, ViewChild, ViewContainerRef
} from '@angular/core';
import { UnitUIElement } from '../../../../../../../common/unit';
import { FormElementComponent } from '../../../../../../../common/form-element-component.directive';
import * as ComponentUtils from '../../../../../../../common/component-utils';

@Component({
  selector: 'app-canvas-drag-overlay',
  template: `
<!--    Needs extra div because styling can interfere with drag and drop-->
    <div cdkDrag [cdkDragData]="this.element"
         [cdkDragDisabled]="!_selected"
         (click)="click($event)">
      <div [ngStyle]="style"
           [style.position]="'absolute'"
           [style.border]="_selected ? '2px solid' : ''"
           [style.width.px]="element.width"
           [style.height.px]="element.height"
           [style.left.px]="element.xPosition"
           [style.top.px]="element.yPosition"
           [style.z-index]="element.zIndex">
<!--        <button cdkDrag cdkDragHandle></button>-->
        <ng-template #elementContainer></ng-template>
      </div>
    </div>
    `,
  styles: [
    'div {position: absolute}'
  ]
})
export class CanvasDragOverlayComponent implements OnInit {
  @Input() element!: UnitUIElement;
  @Output() elementSelected = new EventEmitter<{
    componentElement: CanvasDragOverlayComponent,
    multiSelect: boolean }>();

  @ViewChild('elementContainer', { read: ViewContainerRef, static: true }) private elementContainer!: ViewContainerRef;
  private childComponent!: FormElementComponent;
  _selected = false;
  style: Record<string, string> = {};

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit(): void {
    const componentFactory = ComponentUtils.getComponentFactory(this.element.type, this.componentFactoryResolver);
    this.childComponent = this.elementContainer.createComponent(componentFactory).instance;
    this.childComponent.elementModel = this.element;
  }

  set selected(newValue: boolean) {
    this._selected = newValue;
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
}
