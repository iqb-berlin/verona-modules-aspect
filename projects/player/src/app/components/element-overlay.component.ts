import {
  Component, ComponentFactory, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UnitUIElement } from '../../../../common/unit';
import { FormElementComponent } from '../../../../common/canvas-element-component.directive';
import * as ComponentUtils from '../../../../common/component-utils';

@Component({
  selector: 'app-element-overlay',
  template: `
      <div [style.position]="'absolute'"
           [style.left.px]="element.xPosition"
           [style.top.px]="element.yPosition">
          <ng-template #elementContainer></ng-template>
      </div>
  `
})
export class ElementOverlayComponent implements OnInit {
  @Input() element!: UnitUIElement;
  @ViewChild('elementContainer', { read: ViewContainerRef, static: true }) private elementContainer!: ViewContainerRef;
  parentForm!: FormGroup;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit(): void {
    const componentFactory: ComponentFactory<FormElementComponent> =
      ComponentUtils.getComponentFactory(this.element.type, this.componentFactoryResolver);
    const childComponent: FormElementComponent =
      this.elementContainer.createComponent(componentFactory).instance;
    childComponent.elementModel = this.element;
    childComponent.parentForm = this.parentForm;
  }
}
