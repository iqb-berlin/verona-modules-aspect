import { EventEmitter, SimpleChange } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { IsVisibleIndex } from 'player/src/app/models/is-visible-index.interface';
import { NavigationService } from 'player/src/app/services/navigation.service';
import { PlayerStateDirective } from './player-state.directive';

/*
 * The directive has no template of its own. It is instantiated directly instead of through a
 * host component, so that the debounced page list subscription is set up inside the test's
 * fakeAsync zone and stays visible for tick().
 */
describe('PlayerStateDirective', () => {
  let directive: PlayerStateDirective;
  let isVisibleIndexPages: BehaviorSubject<IsVisibleIndex[]>;
  let veronaPostService: SpyObj<VeronaPostService>;
  let navigationService: { currentPageIndexChanged: EventEmitter<number> };

  const lastPlayerState = () => {
    const calls = veronaPostService.sendVopStateChangedNotification.mock.calls;
    return calls[calls.length - 1][0].playerState;
  };

  const setCurrentPageIndex = (currentPageIndex: number): void => {
    const previousPageIndex = directive.currentPageIndex;
    directive.currentPageIndex = currentPageIndex;
    directive.ngOnChanges({
      currentPageIndex: new SimpleChange(previousPageIndex, currentPageIndex, false)
    });
  };

  const initDirective = (): void => {
    directive.isVisibleIndexPages = isVisibleIndexPages;
    directive.currentPageIndex = 0;
    directive.ngOnInit();
  };

  beforeEach(() => {
    isVisibleIndexPages = new BehaviorSubject<IsVisibleIndex[]>([]);
    veronaPostService = createSpyObj<VeronaPostService>(['sendVopStateChangedNotification']);
    navigationService = { currentPageIndexChanged: new EventEmitter<number>() };

    directive = new PlayerStateDirective(
      { instant: (key: string, params: { index: number }) => `${key}-${params.index}` } as TranslateService,
      veronaPostService,
      navigationService as NavigationService
    );
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should report the visible pages as valid pages', fakeAsync(() => {
    initDirective();

    isVisibleIndexPages.next([
      { index: 0, isVisible: true },
      { index: 1, isVisible: false },
      { index: 2, isVisible: true }
    ]);
    tick(50);

    expect(lastPlayerState()?.validPages).toEqual([
      { id: '0', label: 'pageIndication-1' },
      { id: '2', label: 'pageIndication-3' }
    ]);
    directive.ngOnDestroy();
  }));

  it('should report the current page', fakeAsync(() => {
    initDirective();
    tick(50);

    setCurrentPageIndex(2);

    expect(lastPlayerState()?.currentPage).toBe('2');
    directive.ngOnDestroy();
  }));

  it('should announce a changed page index', fakeAsync(() => {
    initDirective();
    tick(50);
    const changedIndices: number[] = [];
    navigationService.currentPageIndexChanged.subscribe(index => changedIndices.push(index));

    setCurrentPageIndex(1);

    expect(changedIndices).toEqual([1]);
    directive.ngOnDestroy();
  }));

  it('should debounce fast page list changes', fakeAsync(() => {
    initDirective();
    tick(50);
    veronaPostService.sendVopStateChangedNotification.mockClear();

    isVisibleIndexPages.next([{ index: 0, isVisible: true }]);
    isVisibleIndexPages.next([{ index: 1, isVisible: true }]);
    tick(50);

    expect(veronaPostService.sendVopStateChangedNotification).toHaveBeenCalledTimes(1);
    expect(lastPlayerState()?.validPages).toEqual([{ id: '1', label: 'pageIndication-2' }]);
    directive.ngOnDestroy();
  }));

  it('should stop reporting page list changes after destruction', fakeAsync(() => {
    initDirective();
    tick(50);
    veronaPostService.sendVopStateChangedNotification.mockClear();

    directive.ngOnDestroy();
    isVisibleIndexPages.next([{ index: 0, isVisible: true }]);
    tick(50);

    expect(veronaPostService.sendVopStateChangedNotification).not.toHaveBeenCalled();
  }));
});
