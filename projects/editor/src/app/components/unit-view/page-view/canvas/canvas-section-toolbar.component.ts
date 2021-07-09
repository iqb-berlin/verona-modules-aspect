import {
  Component, EventEmitter, OnInit, Output
} from '@angular/core';
import { UnitService } from '../../../../unit.service';
import { UnitPageSection } from '../../../../../../../common/unit';

@Component({
  selector: 'app-canvas-section-toolbar',
  template: `
    <div class="canvas-section-toolbar">
      Seitenabschnitt
      <button mat-raised-button [disabled]="editMode"
              (click)="unitService.addSection()">
        Hinzufügen
        <mat-icon>add</mat-icon>
      </button>
      <button mat-raised-button [disabled]="editMode"
              (click)="unitService.deleteSection()">
        Entfernen
        <mat-icon>remove</mat-icon>
      </button>
      <mat-checkbox (change)="toggleEditMode($event.checked)">
        Abschnitte verschieben
      </mat-checkbox>

      <mat-form-field>
        <mat-label>Breite</mat-label>
        <input matInput type="number" [(ngModel)]="section.width">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Höhe</mat-label>
        <input matInput type="number" [(ngModel)]="section.height">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Hintergrundfarbe</mat-label>
        <input matInput type="text" [(ngModel)]="section.backgroundColor">
      </mat-form-field>
    </div>
    `,
  styles: [
    '.canvas-section-toolbar {background-color: #9c9c9c; color: white; padding-left: 10px; font-size: large}',
    '.canvas-section-toolbar button {margin: 5px;}',
    '.canvas-section-toolbar mat-checkbox {margin-left: 15px}'
  ]
})
export class CanvasSectionToolbarComponent implements OnInit {
  @Output() sectionEditMode = new EventEmitter<boolean>();
  section!: UnitPageSection;
  editMode: boolean = false;

  constructor(public unitService: UnitService) { }

  ngOnInit(): void {
    this.section = this.unitService.getSelectedPageSection();
  }

  toggleEditMode(checked: boolean): void {
    this.editMode = checked;
    this.sectionEditMode.emit(checked);
  }
}
