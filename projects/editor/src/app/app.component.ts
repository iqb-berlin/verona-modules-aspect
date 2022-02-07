import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { VeronaAPIService, VoeStartCommand } from './services/verona-api.service';
import { UnitService } from './services/unit.service';

@Component({
  selector: 'editor-aspect',
  template: `
    <div fxLayout="column" class="mainView">
      <app-toolbar *ngIf="isStandalone()"></app-toolbar>
      <app-unit-view fxFlex></app-unit-view>
    </div>
    `,
  styles: [
    '.mainView {height: 100%;}'
  ]
})
export class AppComponent implements OnInit {
  isStandalone = (): boolean => window === window.parent;

  constructor(private unitService: UnitService,
              private translateService: TranslateService,
              private veronaApiService: VeronaAPIService) {
    translateService.addLangs(['de']);
    translateService.setDefaultLang('de');
  }

  ngOnInit(): void {
    this.veronaApiService.voeStartCommand
      .subscribe((message: VoeStartCommand): void => {
        this.unitService.loadUnitDefinition(message.unitDefinition);
      });
    this.veronaApiService.voeGetDefinitionRequest
      .subscribe(() => {
        this.veronaApiService.sendVoeDefinitionChangedNotification(JSON.stringify(this.unitService.unit));
      });

    this.veronaApiService.sendVoeReadyNotification();
    registerLocaleData(localeDe);
  }
}
