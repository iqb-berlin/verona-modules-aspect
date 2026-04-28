import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { Subscription } from 'rxjs';
import { VeronaAPIService, StartCommand } from './services/verona-api.service';
import { UnitService } from './services/unit.service';

@Component({
  selector: 'aspect-editor',
  template: `
    <div class="mainView fx-column-start-stretch">
      <aspect-toolbar *ngIf="isStandalone"></aspect-toolbar>
      <aspect-editor-unit-view class="fx-flex"></aspect-editor-unit-view>
    </div>
  `,
  styles: [`
    .mainView {
      height: 100%;
    }
  `],
  standalone: false
})

export class AppComponent implements OnInit, OnDestroy {
  isStandalone = window === window.parent;
  private loadingSubscription: Subscription | undefined;

  constructor(private unitService: UnitService,
              private translateService: TranslateService,
              private veronaApiService: VeronaAPIService) {
    this.translateService.addLangs(['de']);
    this.translateService.setDefaultLang('de');
  }

  ngOnInit(): void {
    this.veronaApiService.startCommand
      .subscribe((message: StartCommand): void => {
        // Unsubscribe from previous loading operation if it exists
        if (this.loadingSubscription) {
          this.loadingSubscription.unsubscribe();
        }

        this.unitService.loadUnitDefinition(message.unitDefinition);
        if (message.editorConfig.role === 'developer') {
          this.unitService.expertMode = false;
          this.unitService.allowExpertMode = false;
        }
      });
    this.veronaApiService.sendReady();
    registerLocaleData(localeDe);
  }

  ngOnDestroy(): void {
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
  }
}
