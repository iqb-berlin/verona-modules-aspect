import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { Measurement } from 'common/interfaces';

@Component({
  selector: 'aspect-size-input-panel',
  standalone: true,
  imports: [
    NgIf,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    TranslateModule
  ],
  template: `
    <mat-form-field [style.width.%]="40">
      <mat-label>{{label}}</mat-label>
      <input matInput type="number" [disabled]="disabled"
             [(ngModel)]="value"
             (change)="valueUpdated.emit(getCombinedString())">
    </mat-form-field>
    <mat-form-field [style.width.%]="60">
      <mat-label>Einheit</mat-label>
      <mat-select [disabled]="disabled"
                  [(ngModel)]="unit"
                  (selectionChange)="valueUpdated.emit(getCombinedString())">
        <mat-option *ngIf="allowedUnits.includes('fr')"
                    value="fr">{{'section-menu.fraction' | translate }}</mat-option>
        <mat-option *ngIf="allowedUnits.includes('px')"
                    value="px">{{'section-menu.pixel' | translate }}</mat-option>
        <mat-option *ngIf="allowedUnits.includes('%')"
                    value="%">{{'section-menu.percent' | translate }}</mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styles: [
    ':host {display: flex; flex-direction: row;}'
  ]
})
export class SizeInputPanelComponent {
  @Input() label!: string;
  @Input() value!: number;
  @Input() unit!: string;
  @Input() allowedUnits!: string[];
  @Input() disabled!: boolean;
  @Output() valueUpdated = new EventEmitter<Measurement>();

  getCombinedString(): { value: number; unit: string } {
    this.value = this.value ? this.value : 0;
    return { value: this.value, unit: this.unit };
  }
}
