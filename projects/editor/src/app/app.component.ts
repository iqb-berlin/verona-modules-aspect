import { Component } from '@angular/core';

@Component({
  selector: 'editor-aspect',
  template: `
    <div fxLayout="column">
      <app-toolbar></app-toolbar>
      <app-unit-view></app-unit-view>
    </div>
    `
})
export class AppComponent {
  title = 'verona-editor-aspect';
}
