import {
  Component, OnDestroy, OnInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { UnitPage, UnitPageSection } from '../../../../../../../common/unit';
import { UnitService } from '../../../../unit.service';
import { SelectionService } from '../../../../selection.service';
import { MessageService } from '../../../../../../../common/message.service';

@Component({
  selector: 'app-section-properties',
  template: `
    <div *ngIf="selectedPageSection" fxLayout="column">
      <mat-form-field appearance="fill">
        <mat-label>Höhe</mat-label>
        <input matInput type="number"
               [value]="$any(selectedPageSection.height)"
               (change)="updateModel('height', $any($event.target).value)">
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Hintergrundfarbe</mat-label>
        <input matInput type="color"
               [value]="$any(selectedPageSection.backgroundColor)"
               (change)="updateModel('backgroundColor', $any($event.target).value)">
      </mat-form-field>
      <mat-checkbox [checked]="selectedPageSection.dynamicPositioning"
                    (change)="updateModel('dynamicPositioning', $event.checked)">
        dynamisches Layout
      </mat-checkbox>

      <ng-container *ngIf="selectedPageSection.dynamicPositioning">
        Spalten
        <div class="size-group">
          <mat-form-field>
            <mat-label>Anzahl</mat-label>
            <input matInput type="number"
                   [value]="$any(selectedPageSection.gridColumnSizes.split(' ').length)"
                   (change)="modifySizeArray('gridColumnSizes', $any($event).target.value)">
          </mat-form-field>
          <div *ngFor="let size of columnSizes ; let i = index" class="size-inputs" fxLayout="row">
            <mat-form-field>
              <mat-label>Breite {{i + 1}}</mat-label>
              <input matInput type="number"
                     [value]="size.value"
                     (change)="changeGridSize('gridColumnSizes', i, false, $any($event).target.value)">
            </mat-form-field>
            <mat-select [value]="size.unit"
                        (selectionChange)="changeGridSize('gridColumnSizes', i, true, $event.value)">
              <mat-option value="fr">Bruchteile</mat-option>
              <mat-option value="px">Bildpunkte</mat-option>
            </mat-select>
          </div>
        </div>

        Zeilen
        <div class="size-group">
          <mat-form-field>
            <mat-label>Anzahl</mat-label>
            <input matInput type="number"
                   [value]="$any(selectedPageSection.gridRowSizes.split(' ').length)"
                   (change)="modifySizeArray('gridRowSizes', $any($event).target.value)">
          </mat-form-field>
          <div *ngFor="let size of rowSizes ; let i = index" class="size-inputs" fxLayout="row">
            <mat-form-field>
              <mat-label>Höhe {{i + 1}}</mat-label>
              <input matInput type="number"
                     [value]="size.value"
                     (change)="changeGridSize('gridRowSizes', i, false, $any($event).target.value)">
            </mat-form-field>
            <mat-select [value]="size.unit"
                        (selectionChange)="changeGridSize('gridRowSizes', i, true, $event.value)">
              <mat-option value="fr">Bruchteile</mat-option>
              <mat-option value="px">Bildpunkte</mat-option>
            </mat-select>
          </div>
        </div>
      </ng-container>
    </div>
    <button mat-raised-button
            (click)="unitService.deleteSection(selectedPageSection)">
      Entfernen
      <mat-icon>remove</mat-icon>
    </button>
  `,
  styles: [
    '::ng-deep app-section-properties .size-inputs .mat-form-field-infix {width: 100px}',
    '.size-group {background-color: #f5f5f5; margin: 0 0 15px 0}',
    '::ng-deep app-section-properties .size-group mat-select {padding-top: 24px; padding-left: 15px;}'
  ]
})
export class SectionPropertiesComponent implements OnInit, OnDestroy {
  selectedPageSection!: UnitPageSection;
  private ngUnsubscribe = new Subject<void>();

  columnSizes: { value: string, unit: string }[] = [];
  rowSizes: { value: string, unit: string }[] = [];

  constructor(public selectionService: SelectionService,
              public unitService: UnitService,
              protected messageService: MessageService) { }

  ngOnInit(): void {
    this.selectionService.selectedPageSection
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((pageSection: UnitPageSection) => {
        this.selectedPageSection = pageSection;
        this.updateGridSizes();
      });
  }

  /* Initialize internal array of grid sizes. Where value and unit are put, split up, in an array. */
  private updateGridSizes(): void {
    this.columnSizes = [];
    this.selectedPageSection.gridColumnSizes.split(' ').forEach((size: string) => {
      this.columnSizes.push({ value: size.slice(0, -2), unit: size.slice(-2) });
    });
    this.rowSizes = [];
    this.selectedPageSection.gridRowSizes.split(' ').forEach((size: string) => {
      this.rowSizes.push({ value: size.slice(0, -2), unit: size.slice(-2) });
    });
  }

  updateModel(property: string, value: string | number | boolean): void {
    this.unitService.updateSectionProperty(this.selectedPageSection, property, value);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /* Add elements to size array. Default value 1fr. */
  modifySizeArray(property: 'gridColumnSizes' | 'gridRowSizes', newLength: number): void {
    const oldSizesAsArray = property === 'gridColumnSizes' ?
      this.selectedPageSection.gridColumnSizes.split(' ') :
      this.selectedPageSection.gridRowSizes.split(' ');

    let newArray = [];
    if (newLength < oldSizesAsArray.length) {
      newArray = oldSizesAsArray.slice(0, newLength);
    } else {
      newArray.push(
        ...oldSizesAsArray,
        ...Array(newLength - oldSizesAsArray.length).fill('1fr')
      );
    }
    this.updateModel(property, newArray.join(' '));
    this.updateGridSizes();
  }

  /* Replace number or unit is size string. '2fr 1fr' -> '2px 3fr' */
  changeGridSize(property: string, index: number, unit: boolean = false, newValue: string): void {
    const oldSizesAsArray = property === 'gridColumnSizes' ?
      this.selectedPageSection.gridColumnSizes.split(' ') :
      this.selectedPageSection.gridRowSizes.split(' ');

    if (unit) {
      oldSizesAsArray[index] = oldSizesAsArray[index].slice(0, -2) + newValue;
    } else {
      oldSizesAsArray[index] = newValue + oldSizesAsArray[index].slice(-2);
    }

    this.updateModel(property, oldSizesAsArray.join(' '));
    this.updateGridSizes();
  }
}
