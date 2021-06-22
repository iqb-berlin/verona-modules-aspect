import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-canvas-section-toolbar',
  template: `
    <div class="canvas-section-toolbar">
      Seitenabschnitte
      <button mat-raised-button [disabled]="editMode"
              (click)="addSection.emit()">
        Hinzufügen
        <mat-icon>add</mat-icon>
      </button>
      <button mat-raised-button [disabled]="editMode"
              (click)="removeSection.emit()">
        Entfernen
        <mat-icon>remove</mat-icon>
      </button>
      <mat-checkbox (change)="toggleEditMode($event.checked)">
        Abschnitte verschieben
      </mat-checkbox>
    </div>
    `,
  styles: [
    '.canvas-section-toolbar {background-color: #9c9c9c; color: white; padding-left: 10px; font-size: large}',
    '.canvas-section-toolbar button {margin: 5px;}',
    '.canvas-section-toolbar mat-checkbox {margin-left: 15px}'
  ]
})
export class CanvasSectionToolbarComponent {
  @Output() addSection = new EventEmitter();
  @Output() removeSection = new EventEmitter();
  @Output() sectionEditMode = new EventEmitter<boolean>();
  editMode: boolean = false;

  toggleEditMode(checked: boolean): void {
    this.editMode = checked;
    this.sectionEditMode.emit(checked);
  }
}
