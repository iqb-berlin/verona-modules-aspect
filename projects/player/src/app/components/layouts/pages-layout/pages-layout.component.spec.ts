import { ChangeDetectorRef, EventEmitter } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject, Subject } from 'rxjs';
import { Page } from 'common/models/page';
import { PageChangeService } from 'common/services/page-change.service';
import { VopPageNavigationCommand } from 'player/modules/verona/models/verona';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { IsVisibleIndex } from 'player/src/app/models/is-visible-index.interface';
import { NativeEventService } from 'player/src/app/services/native-event.service';
import { NavigationService } from 'player/src/app/services/navigation.service';
import {
  PageScrollButtonComponent
} from 'player/src/app/components/page-scroll-button/page-scroll-button.component';
import { PagesLayoutComponent } from './pages-layout.component';

/*
 * The component is instantiated directly instead of through a fixture: the tests cover its
 * layout calculations and navigation handling, and its template would otherwise require the
 * whole page rendering stack (tabs, scroll buttons, pages) to be mocked.
 */
describe('PagesLayoutComponent', () => {
  let component: PagesLayoutComponent;
  let pageIndex: Subject<number>;
  let vopPageNavigationCommand: Subject<VopPageNavigationCommand>;
  let resize: Subject<number>;
  let pageChangeService: { pageChanged: EventEmitter<void> };

  const createPage = (properties: Partial<Page> = {}): Page => {
    const page = new Page();
    Object.assign(page, properties);
    return page;
  };

  const initComponent = (properties: Partial<PagesLayoutComponent> = {}): void => {
    component.scrollPages = [];
    component.pages = [];
    component.alwaysVisiblePage = null;
    component.alwaysVisiblePagePosition = 'left';
    component.isVisibleIndexPages = new BehaviorSubject<IsVisibleIndex[]>([]);
    Object.assign(component, properties);
    component.ngOnInit();
    component.ngAfterViewInit();
  };

  beforeEach(() => {
    pageIndex = new Subject<number>();
    vopPageNavigationCommand = new Subject<VopPageNavigationCommand>();
    resize = new Subject<number>();
    pageChangeService = { pageChanged: new EventEmitter<void>() };

    component = new PagesLayoutComponent(
      { resize: resize.asObservable() } as NativeEventService,
      { detectChanges: () => {} } as ChangeDetectorRef,
      { pageIndex: pageIndex.asObservable() } as NavigationService,
      { vopPageNavigationCommand: vopPageNavigationCommand.asObservable() } as VeronaSubscriptionService,
      pageChangeService as PageChangeService
    );
    component.selectIndex = new Subject<number>();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    initComponent();

    expect(component).toBeTruthy();
  });

  it('should start at the first page', () => {
    initComponent();

    expect(component.selectedIndex).toBe(0);
  });

  it('should select the page requested by the navigation service', () => {
    initComponent();

    pageIndex.next(2);

    expect(component.selectedIndex).toBe(2);
  });

  it('should select the page requested by the host', () => {
    initComponent();

    vopPageNavigationCommand.next({ target: '3' } as VopPageNavigationCommand);

    expect(component.selectedIndex).toBe(3);
  });

  it('should stop reacting on navigation requests after destruction', () => {
    initComponent();

    component.ngOnDestroy();
    pageIndex.next(2);

    expect(component.selectedIndex).toBe(0);
  });

  /* Turning a page starts by undoing the scrolled state: the scroll container is one for all
     pages, so without this the next page opens at the height the last one was left at (#1081). */
  it('should put the scroll container back to the top before selecting the page', () => {
    const scrollToTop = vi.fn();
    initComponent({ scrollPageMode: 'separate' });
    component.scrollPagesContainer = { scrollToTop } as unknown as PageScrollButtonComponent;

    component.selectIndex.next(1);

    expect(scrollToTop).toHaveBeenCalled();
    expect(component.selectedIndex).toBe(1);
  });

  it('should put the scroll container back to the top in the buttons mode', () => {
    const scrollToTop = vi.fn();
    initComponent({ scrollPageMode: 'buttons' });
    component.scrollPagesContainer = { scrollToTop } as unknown as PageScrollButtonComponent;

    component.selectIndex.next(1);

    expect(scrollToTop).toHaveBeenCalled();
  });

  /* The concat modes scroll the new page into view themselves, see ScrollToIndexDirective. */
  it('should leave the scroll position alone in the concat modes', () => {
    const scrollToTop = vi.fn();
    initComponent({ scrollPageMode: 'concat-scroll' });
    component.scrollPagesContainer = { scrollToTop } as unknown as PageScrollButtonComponent;

    component.selectIndex.next(1);

    expect(scrollToTop).not.toHaveBeenCalled();
  });

  it('should align the layout in a row for a left or right always visible page', () => {
    initComponent({ alwaysVisiblePagePosition: 'left' });
    expect(component.layoutAlignment).toBe('row');

    initComponent({ alwaysVisiblePagePosition: 'right' });
    expect(component.layoutAlignment).toBe('row');
  });

  it('should align the layout in a column for a top or bottom always visible page', () => {
    initComponent({ alwaysVisiblePagePosition: 'top' });
    expect(component.layoutAlignment).toBe('column');

    initComponent({ alwaysVisiblePagePosition: 'bottom' });
    expect(component.layoutAlignment).toBe('column');
  });

  it('should calculate the page widths including their margins', () => {
    initComponent({
      alwaysVisiblePage: createPage({ maxWidth: 400, margin: 10 }),
      scrollPages: [createPage({ maxWidth: 600, margin: 20 }), createPage({ maxWidth: 500, margin: 20 })],
      hasScrollPages: true
    });

    expect(component.maxWidth.alwaysVisiblePage).toBe(420);
    expect(component.maxWidth.scrollPages).toBe(640);
    expect(component.maxWidth.allPages).toBe(640);
  });

  it('should split the width according to the aspect ratio of the always visible page', () => {
    initComponent({
      alwaysVisiblePage: createPage({ alwaysVisibleAspectRatio: 30 }),
      scrollPages: [createPage()],
      hasScrollPages: true,
      alwaysVisiblePagePosition: 'left'
    });

    expect(component.aspectRatioRow.alwaysVisiblePage).toBe(30);
    expect(component.aspectRatioRow.scrollPages).toBe(70);
    expect(component.aspectRatioColumn.alwaysVisiblePage).toBe(100);
  });

  it('should give the whole width to the scroll pages without an always visible page', () => {
    initComponent({ scrollPages: [createPage()], hasScrollPages: true });

    expect(component.aspectRatioRow.scrollPages).toBe(100);
    expect(component.minHeight.scrollPages).toBe(100);
  });

  it('should let a page without maximum width fill the container', () => {
    initComponent({
      alwaysVisiblePage: createPage({ hasMaxWidth: false }),
      scrollPages: [createPage({ hasMaxWidth: false })],
      hasScrollPages: true
    });

    expect(component.containerMaxWidth.alwaysVisiblePage).toBe('100%');
    expect(component.containerMaxWidth.scrollPages).toBe('100%');
  });

  it('should limit the container to the page width in a row layout', () => {
    initComponent({
      alwaysVisiblePage: createPage({ maxWidth: 400, margin: 0 }),
      scrollPages: [createPage({ maxWidth: 600, margin: 0 })],
      hasScrollPages: true,
      alwaysVisiblePagePosition: 'left'
    });

    expect(component.containerMaxWidth.alwaysVisiblePage).toBe('400px');
    expect(component.containerMaxWidth.scrollPages).toBe('600px');
  });

  it('should limit the container to the widest page in a column layout', () => {
    initComponent({
      alwaysVisiblePage: createPage({ maxWidth: 400, margin: 0 }),
      scrollPages: [createPage({ maxWidth: 600, margin: 0 })],
      hasScrollPages: true,
      alwaysVisiblePagePosition: 'top'
    });

    expect(component.containerMaxWidth.alwaysVisiblePage).toBe('600px');
    expect(component.containerMaxWidth.scrollPages).toBe('600px');
  });

  it('should split the height in a column layout', () => {
    initComponent({
      alwaysVisiblePage: createPage({ alwaysVisibleAspectRatio: 40 }),
      scrollPages: [createPage()],
      hasScrollPages: true,
      alwaysVisiblePagePosition: 'top'
    });

    expect(component.minHeight.alwaysVisiblePage).toBe(40);
    expect(component.minHeight.scrollPages).toBe(60);
  });

  it('should add the visibility of a page', () => {
    initComponent();

    component.setIsVisibleIndexPages({ index: 1, isVisible: true });

    expect(component.isVisibleIndexPages.value).toEqual([{ index: 1, isVisible: true }]);
  });

  it('should update the visibility of an already known page', () => {
    initComponent();
    component.setIsVisibleIndexPages({ index: 1, isVisible: true });

    component.setIsVisibleIndexPages({ index: 1, isVisible: false });

    expect(component.isVisibleIndexPages.value).toEqual([{ index: 1, isVisible: false }]);
  });

  it('should select the next visible page', () => {
    initComponent();
    component.isVisibleIndexPages.next([
      { index: 0, isVisible: true },
      { index: 1, isVisible: false },
      { index: 2, isVisible: true }
    ]);

    component.setNextSelectedIndex();

    expect(component.selectedIndex).toBe(2);
  });

  it('should keep the page when there is no next visible page', () => {
    initComponent();
    component.isVisibleIndexPages.next([{ index: 0, isVisible: true }]);

    component.setNextSelectedIndex();

    expect(component.selectedIndex).toBe(0);
  });

  it('should select the previous visible page', () => {
    initComponent();
    component.isVisibleIndexPages.next([
      { index: 0, isVisible: true },
      { index: 1, isVisible: true }
    ]);
    component.setSelectedIndex(1);

    component.setPreviousSelectedIndex();

    expect(component.selectedIndex).toBe(0);
  });

  it('should scroll to the next page after the browser scrolling is done', fakeAsync(() => {
    initComponent();
    component.isVisibleIndexPages.next([
      { index: 0, isVisible: true },
      { index: 1, isVisible: true }
    ]);

    component.scrollToNextPage();
    expect(component.selectedIndex).toBe(0);
    tick(200);

    expect(component.selectedIndex).toBe(1);
  }));

  /*
   * The order is the one the pages actually report in: a page whose section carries a visibility
   * rule reports one tick earlier than a page without one, so page 2 arrives first (#1383).
   */
  it('should scroll to the nearest next page when the pages arrived out of order', fakeAsync(() => {
    initComponent();
    component.isVisibleIndexPages.next([
      { index: 2, isVisible: true },
      { index: 0, isVisible: true },
      { index: 1, isVisible: true }
    ]);

    component.scrollToNextPage();
    tick(200);

    expect(component.selectedIndex).toBe(1);
  }));

  it('should select the nearest previous page when the pages arrived out of order', () => {
    initComponent();
    component.isVisibleIndexPages.next([
      { index: 1, isVisible: true },
      { index: 0, isVisible: true },
      { index: 2, isVisible: true }
    ]);
    component.setSelectedIndex(2);

    component.setPreviousSelectedIndex();

    expect(component.selectedIndex).toBe(1);
  });

  it('should unblock the snap mode shortly after the scrolling ended', fakeAsync(() => {
    initComponent();
    component.isSnapBlocked = true;

    component.onScrollingEnded();
    tick(100);

    expect(component.isSnapBlocked).toBe(false);
  }));

  it('should announce a page change after the animation', fakeAsync(() => {
    initComponent();
    let pageChangedCount = 0;
    pageChangeService.pageChanged.subscribe(() => { pageChangedCount += 1; });

    component.onAnimationDone(300);
    expect(pageChangedCount).toBe(0);
    tick(300);

    expect(pageChangedCount).toBe(1);
  }));

  it('should center the pages in a window that is wider than both pages', () => {
    initComponent({
      alwaysVisiblePage: createPage({ maxWidth: 100, margin: 0, alwaysVisibleAspectRatio: 50 }),
      scrollPages: [createPage({ maxWidth: 300, margin: 0 })],
      hasScrollPages: true,
      alwaysVisiblePagePosition: 'left'
    });

    /* Window 1000, pages 100 + 300: the margin of 300 goes to the always visible page. */
    resize.next(1000);

    expect(component.aspectRatioRow.alwaysVisiblePage).toBe(40);
    expect(component.aspectRatioRow.scrollPages).toBe(60);
  });

  it('should keep the aspect ratio in a window that is narrower than both pages', () => {
    initComponent({
      alwaysVisiblePage: createPage({ maxWidth: 100, margin: 0, alwaysVisibleAspectRatio: 50 }),
      scrollPages: [createPage({ maxWidth: 300, margin: 0 })],
      hasScrollPages: true,
      alwaysVisiblePagePosition: 'left'
    });

    resize.next(200);

    expect(component.aspectRatioRow.alwaysVisiblePage).toBe(50);
    expect(component.aspectRatioRow.scrollPages).toBe(50);
  });

  it('should not react on resizing in a column layout', () => {
    initComponent({
      alwaysVisiblePage: createPage({ maxWidth: 100, margin: 0, alwaysVisibleAspectRatio: 50 }),
      scrollPages: [createPage({ maxWidth: 300, margin: 0 })],
      hasScrollPages: true,
      alwaysVisiblePagePosition: 'top'
    });
    const aspectRatioAfterInit = component.aspectRatioRow.alwaysVisiblePage;

    resize.next(1000);

    expect(component.aspectRatioRow.alwaysVisiblePage).toBe(aspectRatioAfterInit);
  });
});
