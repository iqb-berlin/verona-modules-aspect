import {
  Component, HostListener, OnDestroy, OnInit
} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { NativeEventService } from './services/native-event.service';
import { MetaDataService } from './services/meta-data.service';

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
              private metaDataService: MetaDataService) {
    this.isStandalone = window === window.parent;
  }

  ngOnInit(): void {
    this.setLocales();
    this.veronaPostService.sendReadyNotification(this.metaDataService.playerMetadata);
    this.nativeEventService.focus
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(isFocused => this.veronaPostService
        .sendVopWindowFocusChangedNotification(isFocused));
  }

  /** Trial for #1082: iPadOS 26 draws the caret once the layout around a focused field changes, as
     opening the keypad does. Giving the field a layer of its own for one frame is that nudge. */
  // eslint-disable-next-line class-methods-use-this
  @HostListener('document:focusin', ['$event'])
  onFocusIn(event: FocusEvent): void {
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
    requestAnimationFrame(() => {
      field.style.willChange = 'transform';
      requestAnimationFrame(() => field.style.removeProperty('will-change'));
    });
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
