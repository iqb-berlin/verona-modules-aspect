import { Component, OnDestroy, OnInit } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { NativeEventService } from './services/native-event.service';
import { MetaDataService } from './services/meta-data.service';
import { WakeLockService } from './services/wake-lock.service';

@Component({
  selector: 'aspect-player',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  isStandalone: boolean;

  private ngUnsubscribe = new Subject<void>();

  constructor(private translateService: TranslateService,
              private nativeEventService: NativeEventService,
              private veronaPostService: VeronaPostService,
              private metaDataService: MetaDataService,
              private wakeLockService: WakeLockService) {
    this.isStandalone = window === window.parent;
  }

  ngOnInit(): void {
    this.setLocales();
    this.wakeLockService.start();
    this.veronaPostService.sendReadyNotification(this.metaDataService.playerMetadata);
    this.nativeEventService.focus
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(isFocused => this.veronaPostService
        .sendVopWindowFocusChangedNotification(isFocused));
  }

  private setLocales(): void {
    this.translateService.addLangs(['de']);
    this.translateService.setDefaultLang('de');
    registerLocaleData(localeDe);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
