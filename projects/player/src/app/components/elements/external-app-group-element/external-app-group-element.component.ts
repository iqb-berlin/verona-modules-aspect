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
import { GeometryValue, GeometryVariable, ValueChangeElement } from 'common/interfaces';

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
      this.elementModel.alias,
      ElementModelElementCodeMappingService.mapToElementCodeValue(
        this.appDefinition,
        this.elementModel.type
      ),
      this.elementComponent,
      this.pageIndex);
    this.registerGeometryVariables();
  }

  private registerGeometryVariables(): void {
    (this.elementModel as GeometryElement).trackedVariables
      .forEach(variableName => this.registerGeometryVariable(variableName));
  }

  private registerGeometryVariable(variableName: string): void {
    this.unitStateService.registerElementCode(
      (this.elementModel as GeometryElement).getGeometryVariableId(variableName),
      (this.elementModel as GeometryElement).getGeometryVariableAlias(variableName),
      null
    );
  }

  private changeGeometryVariableValue(variable: GeometryVariable): void {
    this.unitStateService.changeElementCodeValue({
      id: (this.elementModel as GeometryElement).getGeometryVariableId(variable.id),
      value: ElementModelElementCodeMappingService
        .mapToElementCodeValue(variable.value, 'geometry-variable')
    });
  }

  private changeGeometryVariableValues(variables: GeometryVariable[]): void {
    variables.forEach(variable => this.changeGeometryVariableValue(variable));
  }

  changeElementCodeValue(value: ValueChangeElement): void {
    this.unitStateService.changeElementCodeValue({
      id: value.id,
      value: ElementModelElementCodeMappingService
        .mapToElementCodeValue((value.value as GeometryValue).appDefinition, this.elementModel.type)
    });
    this.changeGeometryVariableValues((value.value as GeometryValue).variables);
  }
}
