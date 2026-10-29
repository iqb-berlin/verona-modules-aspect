import {
  AfterViewInit, Component, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { ElementGroupDirective } from 'player/src/app/directives/element-group.directive';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import {
  ElementModelElementCodeMappingService
} from 'player/src/app/services/element-model-element-code-mapping.service';
import { GeometryElement } from 'common/models/elements/geometry';
import { GeometryComponent } from 'common/components/elements/geometry/geometry.component';
import { GeometryValue, GeometryVariable } from 'common/models/geometry-interfaces';
import { ValueChangeElement } from 'common/models/input-element-interfaces';
import { GeometryVariableStateService } from 'player/src/app/services/geometry-variable-state.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Response, ResponseStatusType } from '@iqbspecs/response/response.interface';

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
        this.propagateStatus(elementCode);
      });
  }

  /**
   * Hands the element's status down to its tracked variables. `DISPLAYED` reaches those not yet
   * reached. `VALUE_CHANGED` reaches all that lack it, but only with `recomputedCountsAsChanged` on: the
   * element and its variables are then one answer, worked on as a whole as soon as anything in the
   * drawing has been edited. Without the switch each variable is an answer of its own, worked on when its
   * value changes.
   */
  private propagateStatus(elementCode: Response & { alias: string }): void {
    if (elementCode.id !== this.elementModel.id) return;
    const element = this.elementModel as GeometryElement;
    const takesOver = (variableStatus: ResponseStatusType): boolean => {
      if (elementCode.status === 'DISPLAYED') return variableStatus === 'NOT_REACHED';
      if (elementCode.status === 'VALUE_CHANGED') {
        return element.recomputedCountsAsChanged && variableStatus !== 'VALUE_CHANGED';
      }
      return false;
    };
    element.getAllCleanedTrackedVariables().forEach(variable => {
      const variableCode = this.geometryVariableStateService
        .getElementCodeById(element.getGeometryVariableId(variable.id));
      if (variableCode && takesOver(variableCode.status)) {
        this.geometryVariableStateService.setElementCodeStatus(variableCode.id, elementCode.status);
      }
    });
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

  /**
   * Makes GeoGebra's own values, once the applet has loaded, the ones a variable is compared with. What
   * the unit stores can differ -- it is empty for variables chosen with an editor before 2.11.0
   * (definition 4.10.0) -- and every variable would then count as changed with the first edit, whatever
   * the edit touched.
   */
  takeOverStartValues(variables: GeometryVariable[]): void {
    variables.forEach(variable => this.geometryVariableStateService.setStartValue(
      (this.elementModel as GeometryElement).getGeometryVariableId(variable.id),
      ElementModelElementCodeMappingService.mapToElementCodeValue(variable.value, 'geometry-variable')
    ));
  }

  /**
   * Takes over what the applet reports -- but nothing before the first edit. Until then a report
   * follows a click, a zoom or a change of the view, and what it carries is no answer: GeoGebra rewrites
   * the construction on loading and again afterwards, so even the element's value differs from the one
   * it started with (#990). From the first edit on, every report is taken over, edit or not: undo, redo
   * and hiding an object change the construction without being an edit.
   *
   * The variables come first, so that a status handed down from the element finds their new values.
   */
  changeElementCodeValue(value: ValueChangeElement): void {
    const geometryValue = value.value as GeometryValue;
    const isWorkedOn = this.unitStateService.getElementCodeById(this.elementModel.id)?.status === 'VALUE_CHANGED';
    if (!geometryValue.edited && !isWorkedOn) return;
    this.changeGeometryVariableValues(geometryValue.variables);
    this.unitStateService.changeElementCodeValue({
      id: value.id,
      value: ElementModelElementCodeMappingService
        .mapToElementCodeValue(geometryValue.appDefinition, this.elementModel.type)
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
