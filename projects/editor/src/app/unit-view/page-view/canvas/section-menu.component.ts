import {
  Component, OnInit, OnDestroy, Input, Output, EventEmitter,
  ViewChild, ElementRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnitService } from '../../../unit.service';
import { DialogService } from '../../../dialog.service';
import { SelectionService } from '../../../selection.service';
import { Section } from '../../../../../../common/models/section';

@Component({
  selector: 'app-section-menu',
  template: `
    <button mat-mini-fab [matMenuTriggerFor]="heightMenu">
      <mat-icon>height</mat-icon>
    </button>
    <mat-menu #heightMenu="matMenu" class="layoutMenu" xPosition="before">
      <mat-form-field appearance="fill">
        <mat-label>Höhe</mat-label>
        <input matInput type="number"
               [value]="$any(section.height)"
               (click)="$any($event).stopPropagation()"
               (change)="updateModel('height', $any($event.target).value)">
      </mat-form-field>
    </mat-menu>
    <button mat-mini-fab
            (click)="openColorPicker()">
      <mat-icon>palette</mat-icon>
    </button>
    <input #colorPicker type="color" [style.display]="'none'"
           [value]="$any(section.backgroundColor)"
           (change)="updateModel('backgroundColor', $any($event.target).value)">

    <button mat-mini-fab [matMenuTriggerFor]="layoutMenu">
      <mat-icon>space_dashboard</mat-icon>
    </button>
    <mat-menu #layoutMenu="matMenu" class="layoutMenu" xPosition="before">
      <mat-checkbox class="menuItem" [checked]="section.dynamicPositioning"
                    (click)="$any($event).stopPropagation()"
                    (change)="updateModel('dynamicPositioning', $event.checked)">
        dynamisches Layout
      </mat-checkbox>
      <div *ngIf="section.dynamicPositioning">
        Spalten
        <div class="size-group">
          <mat-form-field>
            <mat-label>Anzahl</mat-label>
            <input matInput type="number"
                   [value]="$any(section.gridColumnSizes.split(' ').length)"
                   (click)="$any($event).stopPropagation()"
                   (change)="modifySizeArray('gridColumnSizes', $any($event).target.value)">
          </mat-form-field>
          <mat-checkbox class="menuItem" [checked]="section.autoColumnSize"
                        (click)="$any($event).stopPropagation()"
                        (change)="updateModel('autoColumnSize', $event.checked)">
            dynamische Breite
          </mat-checkbox>
          <ng-container *ngIf="!section.autoColumnSize">
            <div *ngFor="let size of columnSizes ; let i = index" class="size-inputs" fxLayout="row">
              <mat-form-field>
                <mat-label>Breite {{i + 1}}</mat-label>
                <input matInput type="number"
                       [value]="size.value"
                       (click)="$any($event).stopPropagation()"
                       (change)="changeGridSize('gridColumnSizes', i, false, $any($event).target.value)">
              </mat-form-field>
              <mat-select [value]="size.unit"
                          (click)="$any($event).stopPropagation()"
                          (selectionChange)="changeGridSize('gridColumnSizes', i, true, $event.value)">
                <mat-option value="fr">Anteile</mat-option>
                <mat-option value="px">Bildpunkte</mat-option>
              </mat-select>
            </div>
          </ng-container>
        </div>
        Zeilen
        <div class="size-group">
          <mat-form-field>
            <mat-label>Anzahl</mat-label>
            <input matInput type="number"
                   [value]="$any(section.gridRowSizes.split(' ').length)"
                   (click)="$any($event).stopPropagation()"
                   (change)="modifySizeArray('gridRowSizes', $any($event).target.value)">
          </mat-form-field>
          <mat-checkbox class="menuItem" [checked]="section.autoRowSize"
                        (click)="$any($event).stopPropagation()"
                        (change)="updateModel('autoRowSize', $event.checked)">
            dynamische Höhe
          </mat-checkbox>
          <ng-container *ngIf="!section.autoRowSize">
            <div *ngFor="let size of rowSizes ; let i = index" class="size-inputs" fxLayout="row">
              <mat-form-field>
                <mat-label>Höhe {{i + 1}}</mat-label>
                <input matInput type="number"
                       [value]="size.value"
                       (click)="$any($event).stopPropagation()"
                       (change)="changeGridSize('gridRowSizes', i, false, $any($event).target.value)">
              </mat-form-field>
              <mat-select [value]="size.unit"
                          (click)="$any($event).stopPropagation()"
                          (selectionChange)="changeGridSize('gridRowSizes', i, true, $event.value)">
                <mat-option value="fr">Anteile</mat-option>
                <mat-option value="px">Bildpunkte</mat-option>
              </mat-select>
            </div>
          </ng-container>
        </div>
      </div>
    </mat-menu>

    <button *ngIf="allowMoveUp" mat-mini-fab
            (click)="this.moveSection.emit('up')">
      <mat-icon>north</mat-icon>
    </button>
    <button *ngIf="allowMoveDown" mat-mini-fab
            (click)="this.moveSection.emit('down')">
      <mat-icon>south</mat-icon>
    </button>
    <button mat-mini-fab
            (click)="duplicateSection.emit()">
      <mat-icon>content_copy</mat-icon>
    </button>
    <button *ngIf="allowDelete" mat-mini-fab
            (click)="deleteSection()">
      <mat-icon>clear</mat-icon>
    </button>
  `,
  styles: [
    '::ng-deep .layoutMenu .size-inputs .mat-form-field-infix {width: 65px}',
    '.size-group {background-color: #f5f5f5; margin: 0 0 15px 0}',
    '::ng-deep .layoutMenu .size-group mat-select {padding-top: 24px; padding-left: 15px;}',
    '::ng-deep .layoutMenu {width: 200px; padding: 0 15px}'
  ]
})
export class SectionMenuComponent implements OnInit, OnDestroy {
  @Input() section!: Section;
  @Input() sectionIndex!: number;
  @Input() allowMoveUp!: boolean;
  @Input() allowMoveDown!: boolean;
  @Input() allowDelete!: boolean;
  @Output() moveSection = new EventEmitter<'up' | 'down'>();
  @Output() duplicateSection = new EventEmitter();

  @ViewChild('colorPicker') colorPicker!: ElementRef;
  columnSizes: { value: string, unit: string }[] = [];
  rowSizes: { value: string, unit: string }[] = [];
  private ngUnsubscribe = new Subject<void>();

  constructor(public unitService: UnitService,
              private selectionService: SelectionService,
              private dialogService: DialogService) { }

  ngOnInit(): void {
    this.updateGridSizes();
  }

  updateModel(property: string, value: string | number | boolean): void {
    this.unitService.updateSectionProperty(this.section, property, value);
  }

  deleteSection(): void {
    this.dialogService.showConfirmDialog('Abschnitt löschen?')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((result: boolean) => {
        if (result) {
          this.unitService.deleteSection(this.section);
          if (this.sectionIndex === this.selectionService.selectedPageSectionIndex &&
            this.selectionService.selectedPageSectionIndex > 0) {
            this.selectionService.selectedPageSectionIndex -= 1;
          }
        }
      });
  }

  /* Initialize internal array of grid sizes. Where value and unit are put, split up, in an array. */
  private updateGridSizes(): void {
    this.columnSizes = [];
    this.section.gridColumnSizes.split(' ').forEach((size: string) => {
      this.columnSizes.push({ value: size.slice(0, -2), unit: size.slice(-2) });
    });
    this.rowSizes = [];
    this.section.gridRowSizes.split(' ').forEach((size: string) => {
      this.rowSizes.push({ value: size.slice(0, -2), unit: size.slice(-2) });
    });
  }

  /* Add elements to size array. Default value 1fr. */
  modifySizeArray(property: 'gridColumnSizes' | 'gridRowSizes', newLength: number): void {
    const oldSizesAsArray = property === 'gridColumnSizes' ?
      this.section.gridColumnSizes.split(' ') :
      this.section.gridRowSizes.split(' ');

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
      this.section.gridColumnSizes.split(' ') :
      this.section.gridRowSizes.split(' ');

    if (unit) {
      oldSizesAsArray[index] = oldSizesAsArray[index].slice(0, -2) + newValue;
    } else {
      oldSizesAsArray[index] = newValue + oldSizesAsArray[index].slice(-2);
    }

    this.updateModel(property, oldSizesAsArray.join(' '));
    this.updateGridSizes();
  }

  openColorPicker() {
    this.colorPicker.nativeElement.click();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}