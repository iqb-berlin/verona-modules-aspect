import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-canvas-toolbar',
  template: `
    <div class="canvas-toolbar">
      Ausrichtung
      <button (click)="align('left')">
        <mat-icon>align_horizontal_left</mat-icon>
      </button>
      <button (click)="align('right')">
        <mat-icon>align_horizontal_right</mat-icon>
      </button>
      <button (click)="align('top')">
        <mat-icon>align_vertical_top</mat-icon>
      </button>
      <button (click)="align('bottom')">
        <mat-icon>align_vertical_bottom</mat-icon>
      </button>
    </div>
    `,
  styles: [
    '.canvas-toolbar {background-color: #696969; color: white; padding-left: 10px}',
    '.canvas-toolbar button {margin: 5px;}',
    '.canvas-toolbar button mat-icon {height: 20px; width: 25px; font-size: 17px}'
  ]
})
export class CanvasToolbarComponent {
  @Output() alignElements = new EventEmitter<'left' | 'right' | 'top' | 'bottom'>(); // TODO enum

  align(direction: 'left' | 'right' | 'top' | 'bottom'): void {
    this.alignElements.emit(direction);
  }
}
