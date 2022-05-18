import {
  AfterViewInit, Component, OnInit, ViewChild, ViewContainerRef
} from '@angular/core';
import { UnitStateService } from '../../../services/unit-state.service';
import { ElementGroupDirective } from '../../../directives/element-group.directive';
import { ElementComponent } from 'common/directives/element-component.directive';

@Component({
  selector: 'aspect-base-group-element',
  templateUrl: './base-group-element.component.html',
  styleUrls: ['./base-group-element.component.scss']
})
export class BaseGroupElementComponent extends ElementGroupDirective implements OnInit, AfterViewInit {
  @ViewChild('elementComponentContainer',
    { read: ViewContainerRef, static: true }) private elementComponentContainer!: ViewContainerRef;

  baseElementComponent!: ElementComponent;

  constructor(public unitStateService: UnitStateService) {
    super();
  }

  ngOnInit(): void {
    this.baseElementComponent =
      this.elementComponentContainer.createComponent(this.elementModel.getComponentFactory()).instance;
    this.baseElementComponent.elementModel = this.elementModel;
  }

  ngAfterViewInit(): void {
    this.registerAtUnitStateService(this.elementModel.id, null, this.baseElementComponent, this.pageIndex);
  }
}
