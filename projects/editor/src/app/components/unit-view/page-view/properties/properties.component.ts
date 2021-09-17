import { Component } from '@angular/core';

@Component({
  selector: 'app-properties',
  template: `
    <mat-accordion multi>
      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>Seitenabschnitt</mat-panel-title>
        </mat-expansion-panel-header>
        <app-section-properties></app-section-properties>
      </mat-expansion-panel>
      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>Element</mat-panel-title>
        </mat-expansion-panel-header>
        <app-element-properties></app-element-properties>
      </mat-expansion-panel>
    </mat-accordion>
  `,
  styles: [
    'mat-expansion-panel-header {font-size: larger}',
    'mat-expansion-panel {font-size: large;}'
  ]
})
export class PropertiesComponent { }
