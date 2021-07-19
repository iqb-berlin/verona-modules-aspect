import {
  Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, Input, OnInit, ViewChild, ViewContainerRef
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UnitUIElement } from '../../../../common/unit';
import * as ComponentUtils from '../../../../common/component-utils';
import { FormElementComponent } from '../../../../common/form-element-component.directive';
import { ValidationMessageComponent } from './validation-message.component';

@Component({
  selector: 'app-element-overlay',
  template: `
      <div [style.position]="'absolute'"
           [style.left.px]="elementModel.xPosition"
           [style.top.px]="elementModel.yPosition">
          <ng-template #elementComponentContainer></ng-template>
          <ng-template #validationMessageComponentContainer></ng-template>
      </div>
  `
})

export class ElementOverlayComponent implements OnInit {
  @Input() elementModel!: UnitUIElement;
  @ViewChild('elementComponentContainer',
    { read: ViewContainerRef, static: true }) private elementComponentContainer!: ViewContainerRef;

  @ViewChild('validationMessageComponentContainer',
    { read: ViewContainerRef, static: true }) private validationMessageComponentContainer!: ViewContainerRef;

  parentForm!: FormGroup;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit(): void {
    // eslint-disable-next-line max-len
    const elementComponentFactory =
      ComponentUtils.getComponentFactory(this.elementModel.type, this.componentFactoryResolver);
    const elementComponent = this.elementComponentContainer.createComponent(elementComponentFactory).instance;
    elementComponent.elementModel = this.elementModel;

    if (elementComponent instanceof FormElementComponent) {
      elementComponent.parentForm = this.parentForm;

      const validationMessageComponentFactory: ComponentFactory<ValidationMessageComponent> =
        this.componentFactoryResolver.resolveComponentFactory(ValidationMessageComponent);
      const validationMessageComponentRef: ComponentRef<ValidationMessageComponent> =
        this.validationMessageComponentContainer.createComponent(validationMessageComponentFactory);

      validationMessageComponentRef.instance.parentForm = this.parentForm;
      validationMessageComponentRef.instance.elementModel = this.elementModel;
    }
  }
}
