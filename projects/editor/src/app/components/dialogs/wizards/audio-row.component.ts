import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'aspect-editor-wizard-audio',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatIconModule,
    FormsModule
  ],
  template: `
    <audio controls [src]=src [style.opacity]="src ? 1 : 0.5"></audio>
    <button mat-fab color="primary"
            [matTooltip]="'Medienquelle ändern'" [matTooltipPosition]="'right'"
            (click)="changeMediaSrc.emit()">
      <mat-icon>upload_file</mat-icon>
    </button>
    <mat-form-field appearance="outline">
      <mat-label>Maximale Abspielhäufigkeit</mat-label>
      <input matInput type="number" min="1" [(ngModel)]="maxRuns">
    </mat-form-field>
  `,
  styles: `
    :host {display: flex; flex-direction: row; justify-content: space-around;}
    audio {align-self: center; margin-bottom: 20px;}
  `
})
export class AudioRowComponent {
  @Input() src: string | undefined;
  @Input() maxRuns!: number;
  @Output() maxRunsChange = new EventEmitter<number>();
  @Output() changeMediaSrc = new EventEmitter();
}
