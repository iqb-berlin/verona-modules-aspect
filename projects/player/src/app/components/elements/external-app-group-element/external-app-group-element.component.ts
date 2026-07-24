import {
  AfterViewInit, Component, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { ElementGroupDirective } from 'player/src/app/directives/element-group.directive';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import {
  ElementModelElementCodeMappingService
} from 'player/src/app/services/element-model-element-code-mapping.service';
import { GeometryElement } from 'common/models/elements/external-app-group-elements/geometry';
import { GeometryComponent } from 'common/components/external-app-group-elements/geometry/geometry.component';
import { GeometryValue, GeometryVariable } from 'common/models/geometry-interfaces';
import { ValueChangeElement } from 'common/models/input-element-interfaces';
import { GeometryVariableStateService } from 'player/src/app/services/geometry-variable-state.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Response, ResponseStatusType } from '@iqb/responses';

@Component({
  selector: 'aspect-external-app-group-element',
  templateUrl: './external-app-group-element.component.html',
  standalone: false
})
export class ExternalAppGroupElementComponent
  extends ElementGroupDirective implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('elementComponent') elementComponent!: GeometryComponent;
  GeometryElement!: GeometryElement;
  appDefinition: string = '';

  private ngUnsubscribe = new Subject<void>();

  constructor(public unitStateService: UnitStateService,
              private geometryVariableStateService: GeometryVariableStateService,
              private elementModelElementCodeMappingService: ElementModelElementCodeMappingService) {
    super();
  }

  ngOnInit(): void {
    this.appDefinition = this.elementModelElementCodeMappingService.mapToElementModelValue(
      this.unitStateService.getElementCodeById(this.elementModel.id)?.value, this.elementModel
    ) as string;

    this.subscribeToParentStateChanges();
  }

  private subscribeToParentStateChanges(): void {
    this.unitStateService.elementCodeChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(elementCode => {
        this.propagateDisplayedStatus(elementCode);
      });
  }

  private propagateDisplayedStatus(elementCode: Response & { alias: string }): void {
    if (elementCode.id === this.elementModel.id && elementCode.status === 'DISPLAYED') {
      (this.elementModel as GeometryElement).getAllCleanedTrackedVariables().forEach(variable => {
        const varId = (this.elementModel as GeometryElement).getGeometryVariableId(variable.id);
        if (this.geometryVariableStateService.isElementCodeRegistered(varId)) {
          const variableCode = this.geometryVariableStateService.getElementCodeById(varId);
          if (variableCode && variableCode.status === 'NOT_REACHED') {
            this.geometryVariableStateService.setElementCodeStatus(varId, 'DISPLAYED');
          }
        }
      });
    }
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
    const parentStatus = this.unitStateService.getElementCodeById(this.elementModel.id)?.status ?? 'NOT_REACHED';
    (this.elementModel as GeometryElement).getAllCleanedTrackedVariables()
      .forEach(variable => this.registerGeometryVariable(variable, parentStatus));
  }

  private registerGeometryVariable(variable: GeometryVariable, status: ResponseStatusType): void {
    this.geometryVariableStateService.registerElementCode(
      (this.elementModel as GeometryElement).getGeometryVariableId(variable.id),
      (this.elementModel as GeometryElement).getGeometryVariableAlias(variable.id),
      variable.value,
      status
    );
  }

  private changeGeometryVariableValue(variable: GeometryVariable): void {
    const varId = (this.elementModel as GeometryElement).getGeometryVariableId(variable.id);
    if (!this.geometryVariableStateService.isElementCodeRegistered(varId)) {
      const parentStatus = this.unitStateService.getElementCodeById(this.elementModel.id)?.status ?? 'NOT_REACHED';
      this.registerGeometryVariable(variable, parentStatus);
    }
    this.geometryVariableStateService.changeElementCodeValue({
      id: varId,
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

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
