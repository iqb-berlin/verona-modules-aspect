import {
  Component, ComponentRef, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import {
  AsyncPipe, JsonPipe, NgForOf, NgIf
} from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UIElement } from 'common/models/elements/element';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import {
  BehaviorSubject, firstValueFrom, of, Subject, switchMap
} from 'rxjs';
import { GeometryComponent } from 'common/components/geometry/geometry.component';
import { takeUntil } from 'rxjs/operators';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { GeometryVariable } from 'common/interfaces';

@Component({
  selector: 'aspect-geometry-props',
  imports: [
    NgIf,
    NgForOf,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    TranslateModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule,
    AsyncPipe,
    JsonPipe
  ],
  template: `
    <mat-form-field matTooltip="{{'propertiesPanel.appDefinition' | translate }}"
                    appearance="fill">
      <mat-label>{{ 'propertiesPanel.appDefinition' | translate }}</mat-label>
      <input matInput disabled
             [value]="$any(combinedProperties.appDefinition)"
             (input)="updateModel.emit({ property: 'appDefinition', value: $any($event.target).value })">
      <button mat-icon-button matSuffix (click)="showGeogebraAppDefDialog()">
        <mat-icon>edit</mat-icon>
      </button>
    </mat-form-field>

    <mat-checkbox *ngIf="unitService.expertMode" [checked]="$any(combinedProperties.showResetIcon)"
                  (change)="updateModel.emit({ property: 'showResetIcon', value: $event.checked })">
      {{ 'propertiesPanel.showResetIcon' | translate }}
    </mat-checkbox>
    <mat-checkbox *ngIf="unitService.expertMode" [checked]="$any(combinedProperties.enableUndoRedo)"
                  (change)="updateModel.emit({ property: 'enableUndoRedo', value: $event.checked })">
      {{ 'propertiesPanel.enableUndoRedo' | translate }}
    </mat-checkbox>
    <mat-checkbox *ngIf="unitService.expertMode" [checked]="$any(combinedProperties.enableShiftDragZoom)"
                  (change)="updateModel.emit({ property: 'enableShiftDragZoom', value: $event.checked })">
      {{ 'propertiesPanel.enableShiftDragZoom' | translate }}
    </mat-checkbox>
    <mat-checkbox *ngIf="unitService.expertMode" [checked]="$any(combinedProperties.showZoomButtons)"
                  (change)="updateModel.emit({ property: 'showZoomButtons', value: $event.checked })">
      {{ 'propertiesPanel.showZoomButtons' | translate }}
    </mat-checkbox>
    <mat-checkbox *ngIf="unitService.expertMode" [checked]="$any(combinedProperties.showFullscreenButton)"
                  (change)="updateModel.emit({ property: 'showFullscreenButton', value: $event.checked })">
      {{ 'propertiesPanel.showFullscreenButton' | translate }}
    </mat-checkbox>
    <mat-checkbox *ngIf="unitService.expertMode" [checked]="$any(combinedProperties.showToolbar)"
                  (change)="updateModel.emit({ property: 'showToolbar', value: $event.checked })">
      {{ 'propertiesPanel.showToolbar' | translate }}
    </mat-checkbox>
    <mat-form-field *ngIf="unitService.expertMode"
                    [style.width.px]="260"
                    matTooltip="{{'propertiesPanel.customToolbarHelp' | translate }}"
                    appearance="fill">
      <mat-label>{{ 'propertiesPanel.customToolbar' | translate }}</mat-label>
      <input matInput [disabled]="!combinedProperties.showToolbar"
             [value]="$any(combinedProperties.customToolbar)"
             (input)="updateModel.emit({ property: 'customToolbar', value: $any($event.target).value })">
    </mat-form-field>

    <mat-form-field class="wide-form-field" appearance="fill">
      <mat-label>{{ 'propertiesPanel.trackedVariables' | translate }}</mat-label>
      <mat-select multiple [ngModel]="combinedProperties.trackedVariables"
                  (ngModelChange)="setGeometryVariables($event)"
                  [compareWith]="compareGeometryVariables">
        <mat-select-trigger>
          {{ 'propertiesPanel.trackedVariables' | translate }} ({{ $any(combinedProperties.trackedVariables).length }})
        </mat-select-trigger>
        {{(geometryObjects | async) | json }}
        <mat-option *ngFor="let variable of geometryObjects | async" [value]="variable">

          {{ variable.id }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `
})
export class GeometryPropsComponent implements OnInit, OnDestroy {
  @Input() combinedProperties!: UIElement;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | null | GeometryVariable[] }>();

  geometryObjects: BehaviorSubject<GeometryVariable[]> = new BehaviorSubject<GeometryVariable[]>([]);
  private ngUnsubscribe = new Subject<void>();

  constructor(public unitService: UnitService,
              public selectionService: SelectionService,
              public dialogService: DialogService) { }

  ngOnInit(): void {
    this.initGeometryListener();
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
}
