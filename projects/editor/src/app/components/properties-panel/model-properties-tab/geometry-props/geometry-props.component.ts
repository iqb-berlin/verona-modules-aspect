import {
  Component, ComponentRef, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  AsyncPipe, NgForOf, NgIf
} from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UIElement } from 'common/models/elements/element';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import {
  MatChipsModule, MatChipGrid, MatChipInput, MatChipInputEvent, MatChipRow
} from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  BehaviorSubject, firstValueFrom, of, Subject, switchMap
} from 'rxjs';
import { GeometryComponent } from 'common/components/external-app-group-elements/geometry/geometry.component';
import { takeUntil } from 'rxjs/operators';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { GeometryVariable } from 'common/models/geometry-interfaces';
import { VariableAlias } from 'common/utils/variable-alias';

@Component({
  selector: 'aspect-geometry-props',
  imports: [
    NgIf,
    NgForOf,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTooltipModule,
    TranslateModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule,
    AsyncPipe,
    MatChipGrid,
    MatChipRow,
    MatChipInput
  ],
  templateUrl: './geometry-props.component.html'
})
export class GeometryPropsComponent implements OnInit, OnDestroy {
  @Input() combinedProperties!: UIElement;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | null | GeometryVariable[] }>();

  geometryObjects: BehaviorSubject<GeometryVariable[]> = new BehaviorSubject<GeometryVariable[]>([]);
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
        if (!isLoaded) return;
        this.geometryObjects.next(
          (this.selectionService.selectedElementComponents[0].childComponent as ComponentRef<GeometryComponent>)
            .instance.getGeometryObjects());
      });
  }

  async showGeogebraAppDefDialog() {
    const geogebraInfo = await firstValueFrom(this.dialogService.showGeogebraAppDefinitionDialog());
    if (geogebraInfo.content) {
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
