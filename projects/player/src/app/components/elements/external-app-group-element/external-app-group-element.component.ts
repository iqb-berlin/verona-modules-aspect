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
import { GeoGebraResponse } from 'common/utils/geogebra-response';
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
  /** The answer the host gave back, for the applet to restore. */
  response: string | undefined;

  private ngUnsubscribe = new Subject<void>();

  constructor(public unitStateService: UnitStateService,
              private geometryVariableStateService: GeometryVariableStateService) {
    super();
  }

  /**
   * Takes over whatever answer the host gave back, whatever its status, as the player did before #1650.
   * An element nobody has worked on holds the construction it started with, the unit's own, and restoring
   * that shows the unit's file as it is -- once the unit's file has been replaced, the old construction,
   * as with an answer worked on. The status is not asked: hosts do not all hand it over by its name, the
   * replay of coding-box hands over the number it stores it as.
   */
  ngOnInit(): void {
    const stored = this.unitStateService.getElementCodeById(this.elementModel.id)?.value;
    if (typeof stored === 'string') this.response = stored;

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

  /** Starts out with the construction of the unit's file rather than the whole file (#1650): every state
   * the player sends holds the answer, also before the element has been worked on. A stored answer is
   * kept, so the unit's file is only read for an element that has none. */
  ngAfterViewInit(): void {
    const elementCode = this.unitStateService.getElementCodeById(this.elementModel.id);
    const element = this.elementModel as GeometryElement;
    this.registerAtUnitStateService(
      element.id,
      element.alias,
      elementCode ? elementCode.value : GeoGebraResponse.fromDefinition(element.appDefinition),
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
        .mapToElementCodeValue(geometryValue.response, this.elementModel.type)
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
