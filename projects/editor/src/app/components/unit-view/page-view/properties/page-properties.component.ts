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
      <mat-form-field>
        <mat-label>Breite</mat-label>
        <input matInput type="number"
               [value]="selectedPage.width"
               (change)="updateModel('width', $any($event.target).value)">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Randbreite</mat-label>
        <input matInput type="number"
               [value]="selectedPage.margin"
               (change)="updateModel('margin', $any($event.target).value)">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Hintergrundfarbe</mat-label>
        <input matInput type="text"
               [value]="selectedPage.backgroundColor"
               (change)="updateModel('backgroundColor', $any($event.target).value)">
      </mat-form-field>
      <mat-checkbox [disabled]="alwaysVisibleDisabled" [ngModel]="selectedPage.alwaysVisible"
                    (change)="updateModel('alwaysVisible', $any($event.source).checked)">
        Immer angezeigt
      </mat-checkbox>
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
        this.alwaysVisibleDisabled = this.unitService.isPageAlwaysVisibleSet() && !page.alwaysVisible;
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
