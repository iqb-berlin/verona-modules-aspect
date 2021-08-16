import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { VeronaAPIService } from './verona-api.service';

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
export class AppComponent implements OnInit {
  constructor(private translateService: TranslateService,
              private veronaApiService: VeronaAPIService) {
    translateService.addLangs(['de']);
    translateService.setDefaultLang('de');
  }

  ngOnInit(): void {
    this.veronaApiService.sendVoeReadyNotification();
  }
}
