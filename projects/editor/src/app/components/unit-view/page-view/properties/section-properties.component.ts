import {
  Component, OnDestroy, OnInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { UnitPage, UnitPageSection } from '../../../../../../../common/unit';
import { UnitService } from '../../../../unit.service';
import { SelectionService } from '../../../../selection.service';
import { MessageService } from '../../../../../../../common/message.service';

// TODO besseres Layout for grid Spalten und Zeilen. Versuch auskommentiert, weil buggy.

@Component({
  selector: 'app-section-properties',
  template: `
    <div *ngIf="selectedPageSection" fxLayout="column">
      <mat-form-field appearance="fill">
        <mat-label>Breite</mat-label>
        <input matInput type="number"
               [value]="$any(selectedPageSection.width)"
               (change)="updateModel('width', $any($event.target).value)">
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Höhe</mat-label>
        <input matInput type="number"
               [value]="$any(selectedPageSection.height)"
               (change)="updateModel('height', $any($event.target).value)">
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Hintergrundfarbe</mat-label>
        <input matInput type="text"
               [value]="$any(selectedPageSection.backgroundColor)"
               (change)="updateModel('backgroundColor', $any($event.target).value)">
      </mat-form-field>
      <mat-checkbox [checked]="selectedPageSection.dynamicPositioning"
                    (change)="updateModel('dynamicPositioning', $event.checked)">
        dynamisches Layout
      </mat-checkbox>

      <ng-container *ngIf="selectedPageSection.dynamicPositioning">
<!--        <div class="size-group">-->
<!--          <mat-form-field>-->
<!--            <mat-label>Anzahl Spalten</mat-label>-->
<!--            <input matInput type="number"-->
<!--                   [value]="$any(selectedPageSection.gridColumnSizes.split(' ').length)"-->
<!--                   (change)="modifySizeArray('gridColumnSizes', $any($event).target.value)">-->
<!--          </mat-form-field>-->
<!--          <div *ngFor="let size of selectedPageSection.gridColumnSizes.split(' ') ; let i = index" fxLayout="row">-->
<!--            <mat-form-field>-->
<!--              <mat-label>Breite {{i + 1}}</mat-label>-->
<!--              {{size}}-->
<!--              {{size.slice(0, -2)}}-->
<!--              <input matInput type="number"-->
<!--                     [value]="size.slice(0, -2)"-->
<!--                     (change)="changeGridSize('gridColumnSizes', i, $any($event).target.value)">-->
<!--            </mat-form-field>-->
<!--            <mat-select [value]="selectedPageSection.gridColumnSizes.split(' ')[i].slice(-2)">-->
<!--              <mat-option value="fr">Bruchteile</mat-option>-->
<!--              <mat-option value="px">Bildpunkte</mat-option>-->
<!--            </mat-select>-->
<!--          </div>-->
<!--        </div>-->

        <div class="size-group">
          <mat-form-field>
            <mat-label>Anzahl Spalten</mat-label>
            <input matInput type="number"
                   [value]="$any(selectedPageSection.gridColumnSizes.split(' ').length)"
                   (change)="modifySizeArray('gridColumnSizes', $any($event).target.value)">
          </mat-form-field>
          <div class="grid-sizes">
            <mat-form-field *ngFor="let size of selectedPageSection.gridColumnSizes.split(' '); let i = index">
              <mat-label>Breite {{i + 1}}</mat-label>
              <input matInput
                     [value]="size">
            </mat-form-field>
          </div>
        </div>

        <div class="size-group">
          <mat-form-field>
            <mat-label>Anzahl Zeilen</mat-label>
            <input matInput type="number"
                   [value]="$any(selectedPageSection.gridRowSizes.split(' ').length)"
                   (change)="modifySizeArray('gridRowSizes', $any($event).target.value)">
          </mat-form-field>
          <div class="grid-sizes">
            <mat-form-field *ngFor="let size of selectedPageSection.gridRowSizes.split(' '); let i = index">
              <mat-label>Höhe {{i + 1}}</mat-label>
              <input matInput
                     [value]="size">
            </mat-form-field>
          </div>
        </div>

<!--        <mat-form-field appearance="fill">-->
<!--          <mat-label>Grid-Spalten</mat-label>-->
<!--          <input matInput [(ngModel)]="selectedPageSection.gridColumnSizes">-->
<!--        </mat-form-field>-->
<!--        <mat-form-field appearance="fill">-->
<!--          <mat-label>Grid-Zeilen</mat-label>-->
<!--          <input matInput [(ngModel)]="selectedPageSection.gridRowSizes">-->
<!--        </mat-form-field>-->
      </ng-container>

    </div>
    <button mat-raised-button
            (click)="unitService.deleteSection(selectedPageSection)">
      Entfernen
      <mat-icon>remove</mat-icon>
    </button>
  `,
  styles: [
    '::ng-deep app-section-properties .grid-sizes .mat-form-field-infix {width: 80px}',
    '.size-group {background-color: #f5f5f5; margin: 15px 0}'
  ]
})
export class SectionPropertiesComponent implements OnInit, OnDestroy {
  selectedPageSection!: UnitPageSection;
  private ngUnsubscribe = new Subject<void>();

  constructor(public selectionService: SelectionService,
              public unitService: UnitService,
              protected messageService: MessageService) { }

  ngOnInit(): void {
    this.selectionService.selectedPageSection
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((pageSection: UnitPageSection) => {
        this.selectedPageSection = pageSection;
      });
  }

  updateModel(property: string, value: string | number | boolean): void {
    let selectedPage: UnitPage;
    this.selectionService.selectedPage
      .pipe(take(1))
      .subscribe(_selectedPage => {
        selectedPage = _selectedPage;
      })
      .unsubscribe();

    if (property === 'width' && value > selectedPage!.width) {
      this.messageService.showError('Darf nicht breiter als die Seite sein.');
    } else {
      this.unitService.updateSectionProperty(this.selectedPageSection, property, value);
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

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
    this.selectedPageSection[property] = newArray.join(' ');
  }

  // changeGridSize(property: string, index: number, newSize: string): void {
  //   // console.log('changeGridSize', property, index, newSize);
  //   const oldSizesAsArray = property === 'gridColumnSizes' ?
  //     this.selectedPageSection.gridColumnSizes.split(' ') :
  //     this.selectedPageSection.gridRowSizes.split(' ');
  //
  //   oldSizesAsArray[index] = newSize + oldSizesAsArray[index].slice(-2);
  //
  //   this.unitService.updateSectionProperty(this.selectedPageSection, property, oldSizesAsArray.join(' '));
  // }
}
