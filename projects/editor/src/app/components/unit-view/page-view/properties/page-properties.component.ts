import { Component, Input } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { UnitPage } from '../../../../../../../common/unit';
import { UnitService } from '../../../../unit.service';

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
export class PagePropertiesComponent {
  @Input() selectedPage!: UnitPage;

  constructor(private unitService: UnitService) { }

  setPageAlwaysVisible(event: MatCheckboxChange): void {
    if (!this.unitService.setPageAlwaysVisible(event.checked)) {
      event.source.checked = false;
    }
  }
}
