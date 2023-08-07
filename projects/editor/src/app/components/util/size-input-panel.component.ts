import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { Measurement } from 'common/models/elements/element';

@Component({
  selector: 'aspect-size-input-panel',
  template: `
    <div class="panel">
      <mat-form-field [style.width.px]="125">
        <mat-label>{{label}}</mat-label>
        <input matInput type="number"
               [(ngModel)]="value"
               (change)="valueUpdated.emit(getCombinedString())">
      </mat-form-field>
      <mat-form-field [style.width.px]="160">
        <mat-label>Einheit</mat-label>
        <mat-select [(ngModel)]="unit"
                    (selectionChange)="valueUpdated.emit(getCombinedString())">
          <mat-option *ngIf="allowedUnits.includes('fr')"
                      value="fr">{{'section-menu.fraction' | translate }}</mat-option>
          <mat-option *ngIf="allowedUnits.includes('px')"
                      value="px">{{'section-menu.pixel' | translate }}</mat-option>
          <mat-option *ngIf="allowedUnits.includes('%')"
                      value="%">{{'section-menu.percent' | translate }}</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
  styles: [
    '.panel {display: flex; flex-direction: row;}'
  ]
})
export class SizeInputPanelComponent {
  @Input() label!: string;
  @Input() value!: number;
  @Input() unit!: string;
  @Input() allowedUnits!: string[];
  @Output() valueUpdated = new EventEmitter<Measurement>();

  getCombinedString(): { value: number; unit: string } {
    this.value = this.value ? this.value : 0;
    return { value: this.value, unit: this.unit };
  }
}
