import {
  Component, OnInit, OnDestroy
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnitPage } from '../../../../../../../common/unit';
import { UnitService } from '../../../../unit.service';
import { SelectionService } from '../../../../selection.service';

@Component({
  selector: 'app-page-properties',
  template: `
    <div fxLayout="column">
      <mat-checkbox [checked]="selectedPage.hasMaxWidth"
                    (change)="updateModel('hasMaxWidth', $any($event.source).checked)">
        Maximalbreite setzen
      </mat-checkbox>
      <mat-form-field *ngIf="selectedPage.hasMaxWidth">
        <mat-label>Maximalbreite</mat-label>
        <input matInput type="number"
               [value]="selectedPage.maxWidth"
               (change)="updateModel('maxWidth', $any($event.target).value)">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Randbreite</mat-label>
        <input matInput type="number"
               [value]="selectedPage.margin"
               (change)="updateModel('margin', $any($event.target).value)">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Hintergrundfarbe</mat-label>
        <input matInput type="color"
               [value]="selectedPage.backgroundColor"
               (change)="updateModel('backgroundColor', $any($event.target).value)">
      </mat-form-field>
      <mat-checkbox [disabled]="alwaysVisibleDisabled" [ngModel]="selectedPage.alwaysVisible"
                    (change)="updateModel('alwaysVisible', $any($event.source).checked)">
        Immer angezeigt
      </mat-checkbox>
      <mat-form-field *ngIf="selectedPage.alwaysVisible">
        <mat-label>Seitenverhältnis (in Prozent)</mat-label>
        <input matInput type="number" min="0" max="100"
               [value]="selectedPage.alwaysVisibleAspectRatio"
               (change)="updateModel('alwaysVisibleAspectRatio', $any($event.target).value)">
      </mat-form-field>
    </div>
    `
})
export class PagePropertiesComponent implements OnInit, OnDestroy {
  selectedPage!: UnitPage;
  alwaysVisibleDisabled: boolean = false;
  private ngUnsubscribe = new Subject<void>();

  constructor(public selectionService: SelectionService,
              private unitService: UnitService) { }

  ngOnInit(): void {
    this.selectionService.selectedPage
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((page: UnitPage) => {
        this.selectedPage = page;
        this.alwaysVisibleDisabled = (!this.unitService.isSetPageAlwaysVisibleAllowed() && !page.alwaysVisible);
      });
  }

  updateModel(property: string, value: number | boolean): void {
    this.unitService.updatePageProperty(this.selectedPage, property, value);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
