import {
  Component, Input, OnDestroy, OnInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnitPageSection } from '../../../../../../../common/unit';
import { UnitService } from '../../../../unit.service';

@Component({
  selector: 'app-section-properties',
  template: `
    <div *ngIf="selectedPageSection" fxLayout="column">
      <mat-form-field>
        <mat-label>Breite</mat-label>
        <input matInput type="number" [(ngModel)]="selectedPageSection.width">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Höhe</mat-label>
        <input matInput type="number" [(ngModel)]="selectedPageSection.height">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Hintergrundfarbe</mat-label>
        <input matInput type="text" [(ngModel)]="selectedPageSection.backgroundColor">
      </mat-form-field>
      <mat-checkbox [checked]="selectedPageSection.dynamicPositioning"
                    (change)="unitService.setSectionDynamicPositioning($event.checked)">
        dynamisches Layout
      </mat-checkbox>
      <mat-form-field>
        <mat-label>Grid-Spalten</mat-label>
        <input matInput [(ngModel)]="selectedPageSection.gridColumnSizes">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Grid-Zeilen</mat-label>
        <input matInput [(ngModel)]="selectedPageSection.gridRowSizes">
      </mat-form-field>
    </div>
    <button mat-raised-button
            (click)="unitService.deleteSelectedSection()">
      Entfernen
      <mat-icon>remove</mat-icon>
    </button>
  `
})
export class SectionPropertiesComponent implements OnInit, OnDestroy {
  selectedPageSection!: UnitPageSection;
  private ngUnsubscribe = new Subject<void>();

  constructor(public unitService: UnitService) { }

  ngOnInit(): void {
    this.unitService.selectedPageSection
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((pageSection: UnitPageSection) => {
        this.selectedPageSection = pageSection;
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
