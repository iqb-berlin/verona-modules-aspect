import {
  Component, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UnitUIElement } from '../../../../common/unit';
import * as ComponentUtils from '../../../../common/component-utils';
import { FormElementComponent } from '../../../../common/form-element-component.directive';

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
    const componentFactory = ComponentUtils.getComponentFactory(this.element.type, this.componentFactoryResolver);
    const childComponent = this.elementContainer.createComponent(componentFactory).instance;
    childComponent.elementModel = this.element;

    if (childComponent instanceof FormElementComponent) {
      childComponent.parentForm = this.parentForm;
    }
  }
}
