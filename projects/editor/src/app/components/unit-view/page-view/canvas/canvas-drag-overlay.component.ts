import {
  Component, OnInit, Input, Output,
  EventEmitter,
  ComponentFactoryResolver,
  ViewChild, ViewContainerRef
} from '@angular/core';
import { UnitUIElement } from '../../../../../../../common/unit';
import { CanvasElementComponent } from '../../../../../../../common/canvas-element-component.directive';
import * as ComponentUtils from '../../../../../../../common/component-utils';

@Component({
  selector: 'app-canvas-drag-overlay',
  template: `
    <div cdkDrag [cdkDragData]="this.element" (click)="click($event)"
         [ngStyle]="style">
      <ng-template #elementContainer></ng-template>
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
  private childComponent!: CanvasElementComponent;
  _selected = false;
  style: Record<string, string> = {};

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit(): void {
    this.updateStyle();
    const componentFactory = ComponentUtils.getComponentFactory(this.element.type, this.componentFactoryResolver);
    this.childComponent = this.elementContainer.createComponent(componentFactory).instance;
    this.childComponent.elementModel = this.element;
  }

  set selected(newValue: boolean) {
    this._selected = newValue;
    this.updateStyle();
  }

  updateStyle(): void {
    this.style = {
      border: this._selected ? '2px solid' : '',
      width: `${this.element.width}px`,
      height: `${this.element.height}px`,
      left: `${this.element.xPosition.toString()}px`,
      top: `${this.element.yPosition.toString()}px`
    };
    this.childComponent?.updateStyle();
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
