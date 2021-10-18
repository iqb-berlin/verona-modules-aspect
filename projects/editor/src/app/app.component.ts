import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { VeronaAPIService } from './verona-api.service';
import { UnitService } from './unit.service';

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
  editorConfig!: Record<string, any>;
  isStandalone = (): boolean => window === window.parent;

  constructor(private unitService: UnitService,
              private translateService: TranslateService,
              private veronaApiService: VeronaAPIService) {
    translateService.addLangs(['de']);
    translateService.setDefaultLang('de');
  }

  ngOnInit(): void {
    this.veronaApiService.voeStartCommand
      .subscribe((message: Record<string, any>): void => {
        this.unitService.loadUnitDefinition(message.unitDefinition);
      });
    this.veronaApiService.voeGetDefinitionRequest
      .subscribe(() => {
        this.veronaApiService.sendVoeDefinitionChangedNotification(this.unitService.getUnitAsJSON());
      });

    this.veronaApiService.sendVoeReadyNotification();
  }
}
