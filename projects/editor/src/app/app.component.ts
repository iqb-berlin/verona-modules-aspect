import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { VeronaAPIService, VoeStartCommand } from './services/verona-api.service';
import { UnitService } from './services/unit.service';

@Component({
  selector: 'aspect-editor',
  template: `
    <div class="mainView fx-column-start-stretch">
      <aspect-toolbar *ngIf="isStandalone"></aspect-toolbar>
      <aspect-unit-view class="fx-flex"></aspect-unit-view>
    </div>
  `,
  styles: [`
    .mainView {
      height: 100%;
    }
    .fx-column-start-stretch {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
    }
    .fx-flex {
      flex: 1 1 0;
      box-sizing: border-box;
    }
  `]
})

export class AppComponent implements OnInit {
  isStandalone = window === window.parent;

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
        this.veronaApiService.sendVoeDefinitionChangedNotification(this.unitService.unit);
      });

    this.veronaApiService.sendVoeReadyNotification();
    registerLocaleData(localeDe);
  }
}
