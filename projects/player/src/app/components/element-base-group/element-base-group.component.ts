import {
  AfterViewInit, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef
} from '@angular/core';
import { UnitStateService } from '../../services/unit-state.service';
import { ElementGroupDirective } from '../../directives/element-group.directive';
import { ElementFactory } from '../../../../../common/util/element.factory';
import { ElementComponent } from "../../../../../common/directives/element-component.directive";

@Component({
  selector: 'aspect-element-base-group',
  templateUrl: './element-base-group.component.html',
  styleUrls: ['./element-base-group.component.scss']
})
export class ElementBaseGroupComponent extends ElementGroupDirective implements OnInit, AfterViewInit {
  @ViewChild('elementComponentContainer',
    { read: ViewContainerRef, static: true }) private elementComponentContainer!: ViewContainerRef;

  baseElementComponent!: ElementComponent;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    public unitStateService: UnitStateService
  ) {
    super();
  }

  ngOnInit(): void {
    const elementComponentFactory = ElementFactory.getComponentFactory(this.elementModel.type, this.componentFactoryResolver);
    this.baseElementComponent = this.elementComponentContainer.createComponent(elementComponentFactory).instance;
    this.baseElementComponent.elementModel = this.elementModel;
  }

  ngAfterViewInit(): void {
    console.log(this.baseElementComponent.domElement);
    this.registerAtUnitStateService(this.elementModel.id, null, this.baseElementComponent, this.pageIndex);
  }
}
