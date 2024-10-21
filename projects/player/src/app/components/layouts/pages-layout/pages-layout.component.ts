import {
  AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit
} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Page } from 'common/models/page';
import { NavigationService } from 'player/src/app/services/navigation.service';
import { PagingMode, VopPageNavigationCommand } from 'player/modules/verona/models/verona';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { PageChangeService } from 'common/services/page-change.service';
import { IsVisibleIndex } from 'player/src/app/models/is-visible-index.interface';
import { HasNextPagePipe } from 'player/src/app/pipes/has-next-page.pipe';
import { HasPreviousPagePipe } from 'player/src/app/pipes/has-previous-page.pipe';
import { NativeEventService } from '../../../services/native-event.service';

@Component({
  selector: 'aspect-pages-layout',
  templateUrl: './pages-layout.component.html',
  styleUrls: ['./pages-layout.component.scss']
})

export class PagesLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() pages!: Page[];
  @Input() isVisibleIndexPages: BehaviorSubject<IsVisibleIndex[]> = new BehaviorSubject<IsVisibleIndex[]>([]);
  @Input() scrollPageMode!: PagingMode;
  @Input() alwaysVisiblePage!: Page | null;
  @Input() scrollPages!: Page[];
  @Input() hasScrollPages!: boolean;
  @Input() alwaysVisiblePagePosition!: 'top' | 'bottom' | 'left' | 'right';
  @Input() isPresentedPagesComplete!: boolean;
  @Input() showUnitNavNext!: boolean;
  @Input() sectionNumbering!: { enableSectionNumbering: boolean, sectionNumberingPosition: 'left' | 'above' };

  selectedIndex: number = 0;
  selectIndex: Subject<number> = new Subject();
  layoutAlignment: 'row' | 'column' = 'row';
  hidePageLabels: boolean = true;
  tabHeaderHeight: number = 0;
  isSnapBlocked: boolean = false;

  maxWidth: { alwaysVisiblePage: number, scrollPages: number, allPages: number } =
    { alwaysVisiblePage: 0, scrollPages: 0, allPages: 0 };

  aspectRatioRow: { alwaysVisiblePage: number, scrollPages: number } =
    { alwaysVisiblePage: 0, scrollPages: 0 };

  aspectRatioColumn: { alwaysVisiblePage: number, scrollPages: number } =
    { alwaysVisiblePage: 0, scrollPages: 0 };

  minHeight: { alwaysVisiblePage: number, scrollPages: number } =
    { alwaysVisiblePage: 0, scrollPages: 0 };

  containerMaxWidth: { alwaysVisiblePage: string, scrollPages: string } =
    { alwaysVisiblePage: '0px', scrollPages: '0px' };

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private nativeEventService: NativeEventService,
    private changeDetectorRef: ChangeDetectorRef,
    private navigationService: NavigationService,
    private veronaSubscriptionService: VeronaSubscriptionService,
    protected pageChangeService: PageChangeService
  ) {
  }

  ngOnInit(): void {
    this.selectIndex
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((selectedIndex: number): void => this.setSelectedIndex(selectedIndex));
    this.navigationService.pageIndex
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((pageIndex: number): void => this.selectIndex.next(pageIndex));
    this.veronaSubscriptionService.vopPageNavigationCommand
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((message: VopPageNavigationCommand): void => this.selectIndex.next(Number(message.target)));
    this.initLayout();
  }

  ngAfterViewInit(): void {
    this.calculateCenterPositionInRowLayout();
  }

  setSelectedIndex(selectedIndex: number): void {
    this.selectedIndex = selectedIndex;
    window.dispatchEvent(new Event('resize'));
  }

  private calculateCenterPositionInRowLayout(): void {
    if (this.alwaysVisiblePage &&
      this.alwaysVisiblePage.hasMaxWidth &&
      this.layoutAlignment === 'row') {
      this.nativeEventService.resize.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((windowWidth: number): void => this.calculateMargin(windowWidth));
      this.calculateMargin(window.innerWidth);
    }
  }

  private calculateMargin(windowWidth:number): void {
    if (this.alwaysVisiblePage) {
      if (windowWidth > this.maxWidth.alwaysVisiblePage + this.maxWidth.scrollPages) {
        const margin = (windowWidth - (
          this.maxWidth.alwaysVisiblePage +
          this.maxWidth.scrollPages
        )) / 2;
        this.aspectRatioRow.alwaysVisiblePage = (100 / windowWidth) * (margin + this.maxWidth.alwaysVisiblePage);
      } else {
        let pageWidth = (this.alwaysVisiblePage.alwaysVisibleAspectRatio / 100) * windowWidth;
        pageWidth = pageWidth > this.maxWidth.alwaysVisiblePage ? this.maxWidth.alwaysVisiblePage : pageWidth;
        this.aspectRatioRow.alwaysVisiblePage = (pageWidth / windowWidth) * 100;
      }
      this.aspectRatioRow.scrollPages = 100 - this.aspectRatioRow.alwaysVisiblePage;
      this.changeDetectorRef.detectChanges();
    }
  }

  private initLayout(): void {
    this.setLayoutAlignment();
    this.calculatePagesMaxWidth();
    this.calculatePagesAspectRatio();
    this.calculatePagesContainerMaxWidth();
    this.calculatePageMinHeight();
  }

  private setLayoutAlignment(): void {
    this.layoutAlignment = (this.alwaysVisiblePagePosition === 'left' || this.alwaysVisiblePagePosition === 'right') ?
      'row' : 'column';
  }

  private calculatePagesContainerMaxWidth(): void {
    this.containerMaxWidth.alwaysVisiblePage = this.getContainerMaxWidth(
      !(this.alwaysVisiblePage?.hasMaxWidth),
      this.maxWidth.alwaysVisiblePage
    );
    this.containerMaxWidth.scrollPages = this.getContainerMaxWidth(
      this.scrollPages.findIndex((page: Page): boolean => !page.hasMaxWidth) > -1,
      this.maxWidth.scrollPages
    );
  }

  private calculatePagesAspectRatio(): void {
    this.aspectRatioRow.alwaysVisiblePage = this.getAspectRatio('row', 0);
    this.aspectRatioRow.scrollPages = this.getAspectRatio('row', 100);

    this.aspectRatioColumn.alwaysVisiblePage = this.getAspectRatio('column', 0);
    this.aspectRatioColumn.scrollPages = this.getAspectRatio('column', 100);
  }

  private calculatePagesMaxWidth(): void {
    this.maxWidth.alwaysVisiblePage = PagesLayoutComponent.getAbsolutePageWidth(this.alwaysVisiblePage);
    this.maxWidth.scrollPages = this.getScrollPagesWidth();
    this.maxWidth.allPages = Math.max(this.maxWidth.alwaysVisiblePage, this.maxWidth.scrollPages);
  }

  private getContainerMaxWidth(condition: boolean, maxWidth: number): string {
    if (condition) {
      return '100%';
    }
    return this.layoutAlignment === 'row' ? `${maxWidth}px` : `${this.maxWidth.allPages}px`;
  }

  private getAspectRatio(alignment: string, offset: number): number {
    return this.alwaysVisiblePage && this.hasScrollPages && this.layoutAlignment === alignment ?
      Math.abs(this.alwaysVisiblePage.alwaysVisibleAspectRatio - offset) : 100;
  }

  private getScrollPagesWidth(): number {
    return this.hasScrollPages ?
      Math.max(...this.scrollPages.map((page: Page): number => PagesLayoutComponent.getAbsolutePageWidth(page))) : 0;
  }

  private static getAbsolutePageWidth = (page: Page | null): number => ((page) ? 2 * page.margin + page.maxWidth : 0);

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  scrollToNextPage(): void {
    const index = HasNextPagePipe
      .getNextPageIndex(this.selectedIndex, this.isVisibleIndexPages.value);
    // Timeout 200: Make sure that a possible concat-scroll-browser-action is completed
    if (index !== null) setTimeout(() => this.selectIndex.next(index), 200);
  }

  setNextSelectedIndex(): void {
    const index = HasNextPagePipe
      .getNextPageIndex(this.selectedIndex, this.isVisibleIndexPages.value);
    if (index !== null) this.selectIndex.next(index);
  }

  setPreviousSelectedIndex(): void {
    const index = HasPreviousPagePipe
      .getPreviousPageIndex(this.selectedIndex, this.isVisibleIndexPages.value);
    if (index !== null) this.selectIndex.next(index);
  }

  setIsVisibleIndexPages(changedPage: IsVisibleIndex): void {
    const isVisibleIndexPages = this.isVisibleIndexPages.value.map(element => element);
    let page = isVisibleIndexPages
      .find(element => element.index === changedPage.index);
    if (!page) {
      page = changedPage;
      isVisibleIndexPages.push(page);
    }
    page.isVisible = changedPage.isVisible;
    this.isVisibleIndexPages.next(isVisibleIndexPages);
  }

  onScrollingEnded(): void {
    setTimeout(() => { this.isSnapBlocked = false; }, 100);
  }

  private calculatePageMinHeight(): void {
    if (this.alwaysVisiblePage) {
      this.minHeight.alwaysVisiblePage =
        this.layoutAlignment === 'row' ? 100 : this.alwaysVisiblePage.alwaysVisibleAspectRatio;
      this.minHeight.scrollPages =
        this.layoutAlignment === 'row' ? 100 : 100 - this.alwaysVisiblePage.alwaysVisibleAspectRatio;
    } else {
      this.minHeight.scrollPages = 100;
    }
  }

  onAnimationDone(delay: number): void {
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => this.pageChangeService.pageChanged.emit(), delay);
  }
}
