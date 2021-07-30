import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

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
  constructor(private translateService: TranslateService) {
    translateService.addLangs(['de']);
    translateService.setDefaultLang('de');
  }
}
