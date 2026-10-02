import {
  Component, ComponentRef, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  BehaviorSubject, firstValueFrom, of, Subject, switchMap
} from 'rxjs';
import { GeometryComponent } from 'common/components/elements/geometry/geometry.component';
import { takeUntil } from 'rxjs/operators';
import { UIElement } from 'common/models/elements/element';
import { GeometryProperties } from 'common/models/elements/geometry';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { GeometryVariable } from 'common/models/geometry-interfaces';
import { VariableAlias } from 'common/utils/variable-alias';
import { GeometryVariableNames } from 'editor/src/app/utils/geometry-variable-names';

@Component({
  selector: 'aspect-geometry-props',
  standalone: false,
  templateUrl: './geometry-props.component.html',
  styleUrls: ['./geometry-props.component.scss']
})
export class GeometryPropsComponent implements OnInit, OnDestroy {
  @Input() combinedProperties!: Merged<GeometryProperties>;
  @Output() updateModel =
    new EventEmitter<{
      property: keyof GeometryProperties;
      value: string | number | boolean | null | GeometryVariable[]
    }>();

  /** The objects of the loaded file; `null` while no applet has loaded, when none can be told missing either. */
  geometryObjects = new BehaviorSubject<GeometryVariable[] | null>(null);
  private ngUnsubscribe = new Subject<void>();

  constructor(public unitService: UnitService,
              public selectionService: SelectionService,
              public dialogService: DialogService,
              private messageService: MessageService,
              private translateService: TranslateService) { }

  ngOnInit(): void {
    this.initGeometryListener();
  }

  addTrackedExpectedVariable(event: MatChipInputEvent): void {
    const id = (event.value || '').trim();
    if (!id) return;
    if (!VariableAlias.isValid(id)) {
      this.messageService.showError(this.translateService.instant('idContainsInvalidCharacters'));
      return;
    }
    const variables = [...(this.combinedProperties.trackedExpectedVariables as GeometryVariable[])];
    if (variables.some(v => v.id === id)) return;
    const chosen = [...(this.combinedProperties.trackedVariables ?? []), ...variables];
    if (GeometryVariableNames.findIssue(id, chosen) === 'DUPLICATE_ALIAS') {
      this.messageService
        .showError(this.translateService.instant('propertiesPanel.geometryVariableIssue.DUPLICATE_ALIAS'));
      return;
    }

    variables.push({ id: id, value: '' } as GeometryVariable);
    this.updateModel.emit({
      property: 'trackedExpectedVariables',
      value: variables
    });
    event.chipInput?.clear();
  }

  removeTrackedExpectedVariable(variable: GeometryVariable): void {
    this.updateModel.emit({
      property: 'trackedExpectedVariables',
      value: [...(this.combinedProperties.trackedExpectedVariables as GeometryVariable[])]
        .filter(v => v.id !== variable.id)
    });
  }

  // eslint-disable-next-line class-methods-use-this
  compareGeometryVariables(option: GeometryVariable, value: GeometryVariable) : boolean {
    return option.id === value.id;
  }

  initGeometryListener(): void {
    this.selectionService.selectedElements.pipe(
      switchMap((selectedElements: UIElement[]) => {
        if (selectedElements.length !== 1 ||
          selectedElements[0].type !== 'geometry') {
          return of(false);
        }
        return (this.selectionService.selectedElementComponents[0].childComponent as ComponentRef<GeometryComponent>)
          .instance.isLoaded.asObservable();
      }))
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((isLoaded: boolean) => {
        if (!isLoaded) {
          this.geometryObjects.next(null);
          return;
        }
        this.geometryObjects.next(
          (this.selectionService.selectedElementComponents[0].childComponent as ComponentRef<GeometryComponent>)
            .instance.getGeometryObjects());
      });
  }

  async showGeogebraAppDefDialog() {
    const geogebraInfo = await firstValueFrom(this.dialogService.showGeogebraAppDefinitionDialog());
    // Nothing at all when the dialog is cancelled, so the answer is asked before its content (#1296).
    if (geogebraInfo?.content) {
      this.updateModel.emit({ property: 'appDefinition', value: geogebraInfo.content });
      this.updateModel.emit({ property: 'fileName', value: geogebraInfo.name });
    }
  }

  setGeometryVariables(variables: GeometryVariable[]) {
    this.updateModel.emit({
      property: 'trackedVariables',
      value: variables
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  protected readonly ENTER = ENTER;
  protected readonly COMMA = COMMA;
}
