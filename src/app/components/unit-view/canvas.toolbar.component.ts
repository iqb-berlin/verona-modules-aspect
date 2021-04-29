import { Component } from '@angular/core';

@Component({
  selector: 'app-canvas-toolbar',
  template: `
    <div class="canvas-toolbar">
      Ausrichtung
      <button>
        <mat-icon>format_align_left</mat-icon>
      </button>
      <button>
        <mat-icon>format_align_right</mat-icon>
      </button>
      <button>
        <mat-icon>vertical_align_top</mat-icon>
      </button>
      <button>
        <mat-icon>vertical_align_bottom</mat-icon>
      </button>
    </div>
    `,
  styles: [
    '.canvas-toolbar {background-color: #696969; color: white}',
    '.canvas-toolbar button {margin: 5px;}',
    '.canvas-toolbar button mat-icon {height: 15px; width: 25px; font-size: 17px}'
  ]
})
export class CanvasToolbarComponent {

}
