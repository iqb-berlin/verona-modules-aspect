import {
  AfterViewInit, Component, OnInit, ViewChild
} from '@angular/core';
import { ElementGroupDirective } from 'player/src/app/directives/element-group.directive';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import {
  ElementModelElementCodeMappingService
} from 'player/src/app/services/element-model-element-code-mapping.service';
import { GeometryElement } from 'common/models/elements/geometry/geometry';
import { GeometryComponent } from 'common/components/geometry/geometry.component';
import { ValueChangeElement } from 'common/models/elements/element';

@Component({
  selector: 'aspect-external-app-group-element',
  templateUrl: './external-app-group-element.component.html'
})
export class ExternalAppGroupElementComponent extends ElementGroupDirective implements OnInit, AfterViewInit {
  @ViewChild('elementComponent') elementComponent!: GeometryComponent;
  GeometryElement!: GeometryElement;
  appDefinition: string = '';

  constructor(public unitStateService: UnitStateService,
              private elementModelElementCodeMappingService: ElementModelElementCodeMappingService) {
    super();
  }

  ngOnInit(): void {
    this.appDefinition = this.elementModelElementCodeMappingService.mapToElementModelValue(
      this.unitStateService.getElementCodeById(this.elementModel.id)?.value, this.elementModel
    ) as string;
  }

  ngAfterViewInit(): void {
    this.registerAtUnitStateService(
      this.elementModel.id,
      ElementModelElementCodeMappingService.mapToElementCodeValue(
        this.appDefinition,
        this.elementModel.type
      ),
      this.elementComponent,
      this.pageIndex);
  }

  changeElementCodeValue(value: ValueChangeElement): void {
    this.unitStateService.changeElementCodeValue({
      id: value.id,
      value: ElementModelElementCodeMappingService
        .mapToElementCodeValue(value.value, this.elementModel.type)
    });
  }
}
