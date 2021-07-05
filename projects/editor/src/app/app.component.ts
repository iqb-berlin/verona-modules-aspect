import { Component } from '@angular/core';

@Component({
  selector: 'editor-aspect',
  template: `
    <div fxLayout="column" class="mainView">
      <app-toolbar></app-toolbar>
      <app-unit-view fxFlex></app-unit-view>
    </div>
    `,
  styles: [
    '.mainView {height: 100%;}'
  ]
})
export class AppComponent {
  title = 'verona-editor-aspect';
}
