import {
  Directive, Input, OnChanges, OnDestroy, OnInit, SimpleChanges
} from '@angular/core';
import { PlayerState, ValidPage } from 'player/modules/verona/models/verona';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { LogService } from 'player/modules/logging/services/log.service';
import { IsVisibleIndex } from 'player/src/app/models/is-visible-index.interface';
import { BehaviorSubject, debounceTime, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { NavigationService } from 'player/src/app/services/navigation.service';

@Directive({
  selector: '[aspectPlayerState]',
  standalone: false
})
export class PlayerStateDirective implements OnChanges, OnInit, OnDestroy {
  @Input() isVisibleIndexPages!: BehaviorSubject<IsVisibleIndex[]>;
  @Input() currentPageIndex!: number;

  /**
   * `null` until the pages have reported their visibility, which they do together, within one
   * debounce. No player state is sent before, so that an empty `validPages` tells the host that no
   * page is visible, never that the pages have not been counted yet (#1462).
   */
  private validPages: Record<string, string> | null = null;
  private ngUnsubscribe = new Subject<void>();
  constructor(
    private translateService: TranslateService,
    private veronaPostService: VeronaPostService,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    this.isVisibleIndexPages
      .pipe(
        // An empty list is only the subject's initial value: every unit has a scroll page, and each
        // scroll page reports, hidden or not. A reported page list is never empty.
        filter(isVisibleIndexPages => isVisibleIndexPages.length > 0),
        debounceTime(50),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(isVisibleIndexPages => {
        this.validPages = this.getValidPages(isVisibleIndexPages);
        this.sendVopStateChangedNotification();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentPageIndex) {
      this.navigationService.currentPageIndexChanged.emit(this.currentPageIndex);
      this.sendVopStateChangedNotification();
    }
  }

  private getValidPages(isVisibleIndexPages: IsVisibleIndex[]): Record<string, string> {
    return isVisibleIndexPages
      .reduce(
        (validPages: Record<string, string>, indexPage: IsVisibleIndex) => ({
          ...validPages,
          ...(indexPage.isVisible && {
            [indexPage.index.toString(10)]:
              `${this.translateService.instant('pageIndication', { index: indexPage.index + 1 })}`
          })
        }), {}
      );
  }

  private sendVopStateChangedNotification(): void {
    if (!this.validPages) return;
    const playerState: PlayerState = {
      currentPage: this.currentPageIndex.toString(10),
      validPages: PlayerStateDirective.mapValidPagesToArray(this.validPages)
    };
    LogService.debug('player: sendVopStateChangedNotification', playerState);
    this.veronaPostService.sendVopStateChangedNotification({ playerState });
  }

  private static mapValidPagesToArray(validPages: Record<string, string>): ValidPage[] {
    return Object.keys(validPages).map(key => ({ id: key, label: validPages[key] }));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
