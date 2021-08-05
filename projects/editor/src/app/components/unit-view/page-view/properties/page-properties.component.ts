import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { UnitPage } from '../../../../../../../common/unit';
import { UnitService } from '../../../../unit.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-page-properties',
  template: `
    <div fxLayout="column">
      <mat-form-field>
        <mat-label>Breite</mat-label>
        <input matInput type="number" [(ngModel)]="selectedPage.width">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Randbreite</mat-label>
        <input matInput type="number" [(ngModel)]="selectedPage.margin">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Hintergrundfarbe</mat-label>
        <input matInput type="text" [(ngModel)]="selectedPage.backgroundColor">
      </mat-form-field>
      <mat-checkbox [checked]="selectedPage.alwaysVisible"
                    (change)="setPageAlwaysVisible($event)">
        Immer angezeigt
      </mat-checkbox>
    </div>
    `
})
export class PagePropertiesComponent implements OnInit, OnDestroy {
  selectedPage!: UnitPage;
  private ngUnsubscribe = new Subject<void>();

  constructor(private unitService: UnitService) { }

  ngOnInit(): void {
    this.unitService.selectedPage
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((page: UnitPage) => {
        this.selectedPage = page;
      });
  }

  setPageAlwaysVisible(event: MatCheckboxChange): void {
    if (!this.unitService.setPageAlwaysVisible(event.checked)) {
      event.source.checked = false;
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
