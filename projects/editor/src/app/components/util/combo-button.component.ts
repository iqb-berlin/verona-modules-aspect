import {
  Component, ElementRef, EventEmitter, Input, Output, ViewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgForOf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'aspect-combo-button',
  standalone: true,
  imports: [
    NgForOf,
    MatButtonModule,
    MatTooltipModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <div class="wrapper">
      <button class="apply-button" mat-button [matTooltip]="tooltip"
              [style.background-color]="inputType === 'list' && isActive ? 'lightgrey' : 'unset'"
              (click)="applySelection.emit()">
        <mat-icon>{{icon}}</mat-icon>
      </button>

      <input matInput type="color" #colorInput hidden
             (input)="selectionChanged.emit($any($event.target).value); applySelection.emit()">

      <mat-select panelClass="select-overlay"
                  (click)="onClickSelect($event)">
        <mat-option *ngFor="let value of availableValues"
                    (click)="selectValue(value)">{{value}}</mat-option>
      </mat-select>
    </div>
  `,
  styles: [`
    .wrapper {
      display: flex;
      flex-direction: row;
    }
    .apply-button {
      min-width: unset;
    }
    .apply-button .mat-icon {
      margin-right: 0;
    }
    mat-select {
      display: flex;
    }
    mat-select:hover {
      background-color: WhiteSmoke;
    }
  `
  ]
})
export class ComboButtonComponent {
  @Input() inputType!: 'color' | 'list';
  @Input() selectedValue!: string;
  @Input() availableValues: string[] | undefined;
  @Input() tooltip!: string;
  @Input() icon!: string;
  @Input() isActive: boolean = false;
  @Output() applySelection = new EventEmitter<void>();
  @Output() selectionChanged = new EventEmitter<string>();

  @ViewChild('colorInput') colorInput!: ElementRef<HTMLInputElement>;

  selectValue(value: string) {
    this.selectionChanged.emit(value);
  }

  onClickSelect(event: MouseEvent) {
    if (this.inputType === 'color') {
      event.preventDefault();
      event.stopPropagation();
      this.colorInput.nativeElement.click();
    }
  }
}
