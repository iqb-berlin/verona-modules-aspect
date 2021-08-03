import { Component, Input } from '@angular/core';
import { UnitPageSection } from '../../../../../../../common/unit';
import { UnitService } from '../../../../unit.service';

@Component({
  selector: 'app-section-properties',
  template: `
    <div fxLayout="column">
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
                    (change)="unitService.setSectionDynamicPositioning(selectedPageSection, $event.checked)">
        dynamisches Layout
      </mat-checkbox>
      <mat-form-field>
        <mat-label>Grid-Spalten</mat-label>
        <input matInput [(ngModel)]="selectedPageSection.gridColumnSizes">
      </mat-form-field>
    </div>
    <button mat-raised-button
            (click)="unitService.deleteSection()">
      Entfernen
      <mat-icon>remove</mat-icon>
    </button>
  `
})
export class SectionPropertiesComponent {
  @Input() selectedPageSection!: UnitPageSection;

  constructor(public unitService: UnitService) { }
}
