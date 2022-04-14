import {
  AfterViewInit, ChangeDetectorRef,
  Component, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { NativeEventService } from '../../services/native-event.service';
import { PlayerConfig } from '../../models/verona';
import { Page } from 'common/interfaces/unit';

@Component({
  selector: '[aspect-layout-pages]',
  templateUrl: './layout-pages.component.html',
  styleUrls: ['./layout-pages.component.css']
})

export class LayoutPagesComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() pages!: Page[];
  @Input() selectedIndex!: number;
  @Input() selectIndex!: Subject<number>;
  @Input() playerConfig!: PlayerConfig;

  @Output() selectedIndexChange = new EventEmitter<number>();
  @Output() validPagesDetermined = new EventEmitter<Record<string, string>>();

  private ngUnsubscribe = new Subject<void>();

  scrollPagesIndices!: number[];
  scrollPages!: Page[];
  hasScrollPages!: boolean;
  alwaysVisiblePage!: Page | undefined;
  alwaysVisibleUnitPageIndex!: number;
  alwaysVisiblePagePosition!: 'top' | 'bottom' | 'left' | 'right' ;
  layoutAlignment!: 'row' | 'column';
  scrollPageMode!: 'separate' | 'concat-scroll' | 'concat-scroll-snap';
  hidePageLabels: boolean = true;
  tabHeaderHeight: number = 0;

  maxWidth: { alwaysVisiblePage: number, scrollPages: number, allPages: number } =
  { alwaysVisiblePage: 0, scrollPages: 0, allPages: 0 };

  aspectRatioRow: { alwaysVisiblePage: number, scrollPages: number } =
  { alwaysVisiblePage: 0, scrollPages: 0 };

  aspectRatioColumn: { alwaysVisiblePage: number, scrollPages: number } =
  { alwaysVisiblePage: 0, scrollPages: 0 };

  containerMaxWidth: { alwaysVisiblePage: string, scrollPages: string } =
  { alwaysVisiblePage: '0px', scrollPages: '0px' };

  constructor(
    private translateService: TranslateService,
    private nativeEventService: NativeEventService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.initPages();
    this.initLayout();
    this.selectIndex
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((selectedIndex: number): void => { this.selectedIndex = selectedIndex; });
  }

  ngAfterViewInit(): void {
    if (this.alwaysVisiblePage &&
      this.alwaysVisiblePage.hasMaxWidth &&
      this.layoutAlignment === 'row') {
      this.nativeEventService.resize.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((windowWidth: number): void => this.calculateMargin(windowWidth));
      this.calculateMargin(window.innerWidth);
    }
  }

  onSelectedIndexChange(selectedIndex: number): void {
    this.selectedIndexChange.emit(selectedIndex);
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

  private initPages(): void {
    this.alwaysVisibleUnitPageIndex = this.pages.findIndex((page: Page): boolean => page.alwaysVisible);
    this.alwaysVisiblePage = this.pages[this.alwaysVisibleUnitPageIndex];
    this.scrollPages = this.pages.filter((page: Page): boolean => !page.alwaysVisible);
    this.hasScrollPages = this.scrollPages?.length > 0;
    this.scrollPagesIndices = this.scrollPages.map(
      (scrollPage: Page): number => this.pages.indexOf(scrollPage)
    );
    this.validPagesDetermined
      .emit(this.scrollPages.reduce(
        (validPages: Record<string, string>, page: Page, index: number) => ({
          ...validPages,
          [index.toString(10)]: `${this.translateService.instant(
            'pageIndication', { index: index + 1 }
          )}`
        }), {}
      ));
  }

  private initLayout(): void {
    this.alwaysVisiblePagePosition = this.alwaysVisiblePage?.alwaysVisiblePagePosition ?
      this.alwaysVisiblePage.alwaysVisiblePagePosition : 'left';
    this.layoutAlignment = (this.alwaysVisiblePagePosition === 'left' || this.alwaysVisiblePagePosition === 'right') ?
      'row' : 'column';
    this.scrollPageMode = this.playerConfig.pagingMode ? this.playerConfig.pagingMode : 'separate';

    this.maxWidth.alwaysVisiblePage = this.getAbsolutePageWidth(this.alwaysVisiblePage);
    this.maxWidth.scrollPages = this.getScrollPagesWidth();
    this.maxWidth.allPages = Math.max(this.maxWidth.alwaysVisiblePage, this.maxWidth.scrollPages);

    this.aspectRatioRow.alwaysVisiblePage = this.getAspectRatio('row', 0);
    this.aspectRatioRow.scrollPages = this.getAspectRatio('row', 100);
    this.aspectRatioColumn.alwaysVisiblePage = this.getAspectRatio('column', 0);
    this.aspectRatioColumn.scrollPages = this.getAspectRatio('column', 100);

    this.containerMaxWidth.alwaysVisiblePage = this.getContainerMaxWidth(
      !(this.alwaysVisiblePage?.hasMaxWidth),
      this.maxWidth.alwaysVisiblePage
    );
    this.containerMaxWidth.scrollPages = this.getContainerMaxWidth(
      this.scrollPages.findIndex((page: Page): boolean => !page.hasMaxWidth) > -1,
      this.maxWidth.scrollPages
    );
  }

  private getContainerMaxWidth(condition: boolean, maxWidth: number): string {
    if (condition) {
      return '100%';
    }
    return this.layoutAlignment === 'row' ? `${maxWidth}px` : `${this.maxWidth.allPages}px`;
  }

  private getAspectRatio(alignment: string, offset: number) : number {
    return this.alwaysVisiblePage && this.hasScrollPages && this.layoutAlignment === alignment ?
      Math.abs(this.alwaysVisiblePage.alwaysVisibleAspectRatio - offset) : 100;
  }

  private getScrollPagesWidth(): number {
    return this.hasScrollPages ?
      Math.max(...this.scrollPages.map((page: Page): number => this.getAbsolutePageWidth(page))) : 0;
  }

  private getAbsolutePageWidth = (page: Page | undefined): number => ((page) ? 2 * page.margin + page.maxWidth : 0);

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
