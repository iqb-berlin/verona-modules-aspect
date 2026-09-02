import { ChangeDetectorRef, ElementRef, EventEmitter } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject, Subject } from 'rxjs';
import { Response } from '@iqb/responses';
import { Page } from 'common/models/page';
import { Section } from 'common/models/section';
import { PageChangeService } from 'common/services/page-change.service';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { VopPageNavigationCommand } from 'player/modules/verona/models/verona';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { IsVisibleIndex } from 'player/src/app/models/is-visible-index.interface';
import { NativeEventService } from 'player/src/app/services/native-event.service';
import { NavigationService } from 'player/src/app/services/navigation.service';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { PageComponent } from 'player/src/app/components/page/page.component';
import {
  SectionVisibilityHandlingDirective
} from 'player/src/app/directives/section-visibility-handling.directive';
import { PagesLayoutComponent } from './pages-layout.component';

/*
 * The premise the sorting in HasNextPagePipe and HasPreviousPagePipe rests on (#1383): the pages do
 * not report their visibility in the order of their indices. Their own specs are given an unsorted
 * list by hand -- this one lets the real directive, the real page and the real layout produce the
 * order, so the premise cannot quietly stop being true.
 *
 * All three are instantiated directly rather than rendered: what is measured is the order of the
 * timers they schedule, and a fixture would only add a rendering stack around it.
 */
describe('Pages reporting their visibility (#1383)', () => {
  let component: PagesLayoutComponent;
  let arrivals: number[];
  let elementCodes: Record<string, Response>;
  let unitStateService: SpyObj<UnitStateService> & { elementCodeChanged: Subject<Response> };
  let stateVariableStateService: SpyObj<StateVariableStateService> & { elementCodeChanged: Subject<Response> };
  let directives: SectionVisibilityHandlingDirective[];

  /** The rule of the one section that carries one, fulfilled from the start. */
  const fulfilledRule = { id: 'text-field_1', operator: '=' as const, value: 'yes' };

  const createSection = (withRule: boolean): Section => {
    const section = new Section();
    section.visibilityRules = withRule ? [fulfilledRule] : [];
    /* Keeps the directive out of the storable path, which is about the delay and the timer, not
       about when the section reports. */
    section.enableReHide = withRule;
    return section;
  };

  /**
   * One page with a single section, wired the way the templates wire them: the directive reports to
   * the page, the page reports to the layout.
   */
  const addPage = (scrollPageIndex: number, withRule: boolean): void => {
    const page = new PageComponent(
      new ElementRef(document.createElement('div')),
      {} as NavigationService,
      {} as VeronaPostService
    );
    page.scrollPageIndex = scrollPageIndex;
    page.isVisibleIndexChange.subscribe((event: IsVisibleIndex) => {
      arrivals.push(event.index);
      component.setIsVisibleIndexPages(event);
    });

    const directive = new SectionVisibilityHandlingDirective(
      new ElementRef(document.createElement('div')),
      unitStateService,
      stateVariableStateService
    );
    directive.section = createSection(withRule);
    directive.pageIndex = scrollPageIndex;
    directive.sectionIndex = 0;
    directive.isVisibleIndexChange
      .subscribe((event: IsVisibleIndex) => page.setIsVisibleIndexSections(event));
    directives.push(directive);
    directive.ngOnInit();
  };

  /**
   * Three pages, of which the one named carries the rule and therefore reports first. Which one that
   * is decides what the unsorted list costs: with the rule on the last page, the entry above index 0
   * that comes first in the list is page 2; with it on the middle page, the last entry below index 2
   * is page 0.
   */
  const initPages = (rulePageIndex: number): void => {
    component.scrollPages = [new Page(), new Page(), new Page()];
    component.pages = component.scrollPages;
    component.alwaysVisiblePage = null;
    component.alwaysVisiblePagePosition = 'left';
    component.scrollPageMode = 'concat-scroll-snap';
    component.isVisibleIndexPages = new BehaviorSubject<IsVisibleIndex[]>([]);
    component.ngOnInit();

    [0, 1, 2].forEach(index => addPage(index, index === rulePageIndex));
  };

  beforeEach(() => {
    arrivals = [];
    directives = [];
    elementCodes = { [fulfilledRule.id]: { id: fulfilledRule.id, status: 'VALUE_CHANGED', value: 'yes' } };

    unitStateService = Object.assign(
      createSpyObj<UnitStateService>(['getElementCodeById']),
      { elementCodeChanged: new Subject<Response>() }
    );
    unitStateService.getElementCodeById.mockImplementation((id: string) => elementCodes[id]);

    stateVariableStateService = Object.assign(
      createSpyObj<StateVariableStateService>(['getElementCodeById', 'registerElementCode', 'changeElementCodeValue']),
      { elementCodeChanged: new Subject<Response>() }
    );
    stateVariableStateService.getElementCodeById.mockReturnValue(undefined);

    component = new PagesLayoutComponent(
      { resize: new Subject<number>().asObservable() } as NativeEventService,
      { detectChanges: () => {} } as ChangeDetectorRef,
      { pageIndex: new Subject<number>().asObservable() } as NavigationService,
      { vopPageNavigationCommand: new Subject<VopPageNavigationCommand>().asObservable() } as VeronaSubscriptionService,
      { pageChanged: new EventEmitter<void>() } as PageChangeService
    );
    component.selectIndex = new Subject<number>();
  });

  afterEach(() => {
    directives.forEach(directive => directive.ngOnDestroy());
    component.ngOnDestroy();
  });

  /*
   * A section with a rule decides its visibility in ngOnInit and reports it there and then; one
   * without waits for a timer, so its page needs one turn more. The page with the rule therefore
   * arrives first, whatever its index.
   */
  it('should report the page carrying a rule before the pages without one', fakeAsync(() => {
    initPages(2);

    tick();

    expect(arrivals).toEqual([2, 0, 1]);
  }));

  it('should hold all three pages as visible', fakeAsync(() => {
    initPages(2);

    tick();

    expect(component.isVisibleIndexPages.value)
      .toEqual(expect.arrayContaining([
        { index: 0, isVisible: true },
        { index: 1, isVisible: true },
        { index: 2, isVisible: true }
      ]));
    expect(component.isVisibleIndexPages.value).toHaveLength(3);
  }));

  /* Taken as sorted, the first entry above index 0 is page 2, and page 1 is skipped. */
  it('should scroll to the page next to the current one, not to the first one reported', fakeAsync(() => {
    initPages(2);
    tick();

    component.scrollToNextPage();
    tick(200);

    expect(component.selectedIndex).toBe(1);
  }));

  /* The rule on the middle page, so that page 1 reports before page 0: taken as sorted, the last
     entry below index 2 is page 0, and page 1 is skipped on the way back. */
  it('should step back to the page next to the current one, not to the one reported last', fakeAsync(() => {
    initPages(1);
    tick();
    expect(arrivals).toEqual([1, 0, 2]);
    component.setSelectedIndex(2);

    component.setPreviousSelectedIndex();

    expect(component.selectedIndex).toBe(1);
  }));
});
