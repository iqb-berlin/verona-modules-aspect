import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div fxLayout="column">
      <app-toolbar></app-toolbar>
      <div fxLayout="row">
        <app-ui-element-toolbox fxFlex="20"></app-ui-element-toolbox>
        <app-unit-view fxFlex="60">
        </app-unit-view>
        <app-properties fxFlex="20"></app-properties>
      </div>
    </div>
    `
})
export class AppComponent {
  title = 'verona-editor-aspect';
}
