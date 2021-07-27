import {
  Component, EventEmitter, OnDestroy, OnInit, Output
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnitService } from '../../../../unit.service';
import { UnitPageSection } from '../../../../../../../common/unit';

@Component({
  selector: 'app-canvas-section-toolbar',
  template: `
    <div class="canvas-section-toolbar" fxLayout="row">
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

      <div fxLayout="column">
        <label for="breite">Breite</label>
        <input type="number" id="width" [(ngModel)]="section.width">
      </div>
      <div fxLayout="column">
        <label>Höhe</label>
        <input type="number" id="height" [(ngModel)]="section.height">
      </div>
      <div fxLayout="column">
        <label for="bg-color">Hintergrundfarbe</label>
        <input type="text" id="bg-color" [(ngModel)]="section.backgroundColor">
      </div>
    </div>
    `,
  styles: [
    '.canvas-section-toolbar {background-color: #9c9c9c; color: white; padding-left: 10px; font-size: large}',
    '.canvas-section-toolbar {align-items: center;}',
    '.canvas-section-toolbar button {margin: 5px;}',
    '.canvas-section-toolbar mat-checkbox {margin-left: 15px; margin-right: 60px}',
    '.canvas-section-toolbar input {width: 150px}'
  ]
})
export class CanvasSectionToolbarComponent implements OnInit, OnDestroy {
  @Output() sectionEditMode = new EventEmitter<boolean>();
  section!: UnitPageSection;
  editMode: boolean = false;

  private ngUnsubscribe = new Subject<void>();

  constructor(public unitService: UnitService) { }

  ngOnInit(): void {
    this.unitService.selectedPageSectionIndex
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.section = this.unitService.getSelectedPageSection();
      });
  }

  toggleEditMode(checked: boolean): void {
    this.editMode = checked;
    this.sectionEditMode.emit(checked);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
