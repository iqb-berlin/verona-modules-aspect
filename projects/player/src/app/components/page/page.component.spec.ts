/* eslint-disable max-classes-per-file */
import {
  Component, Directive, EventEmitter, Input, Output, Pipe, PipeTransform
} from '@angular/core';
import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, Subject } from 'rxjs';
import { Page } from 'common/models/page';
import { Section } from 'common/models/section';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { IsVisibleIndex } from 'player/src/app/models/is-visible-index.interface';
import { NavigationService } from 'player/src/app/services/navigation.service';
import { PageComponent } from './page.component';

describe('PageComponent', () => {
  let component: PageComponent;
  let fixture: ComponentFixture<PageComponent>;
  let veronaPostService: SpyObj<VeronaPostService>;
  let emittedVisibilities: IsVisibleIndex[];

  @Component({
    selector: 'aspect-section',
    template: '',
    standalone: false
  })
  class MockSectionComponent {
    @Input() section!: Section;
    @Input() pageIndex!: number;
    @Input() sectionNumbering!: boolean;
  }

  @Component({
    selector: 'aspect-unit-nav-next',
    template: '',
    standalone: false
  })
  class MockUnitNavNextComponent {
    @Output() navigate = new EventEmitter<void>();
  }

  @Directive({
    selector: '[aspectSectionVisibilityHandling]',
    standalone: false
  })
  class MockSectionVisibilityHandling {
    @Input() mediaStatusChanged!: Subject<string>;
    @Input() section!: Section;
    @Input() pageSections!: Section[];
    @Input() sectionIndex!: number;
    @Output() isVisibleIndexChange = new EventEmitter<IsVisibleIndex>();
  }

  @Directive({
    selector: '[aspectInViewDetection]',
    standalone: false
  })
  class MockInViewDetection {
    @Input() detectionType!: 'top' | 'bottom';
    @Output() intersecting = new EventEmitter();
  }

  @Pipe({
    name: 'isEnabledNavigationTarget',
    standalone: false
  })
  class MockIsEnabledNavigationTargetPipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    transform(): boolean {
      return true;
    }
  }

  const inViewDetections = (): MockInViewDetection[] => fixture.debugElement
    .queryAll(By.directive(MockInViewDetection))
    .map(debugElement => debugElement.injector.get(MockInViewDetection));

  beforeEach(async () => {
    veronaPostService = createSpyObj<VeronaPostService>(['sendVopUnitNavigationRequestedNotification']);

    await TestBed.configureTestingModule({
      declarations: [
        PageComponent,
        MockSectionComponent,
        MockUnitNavNextComponent,
        MockSectionVisibilityHandling,
        MockInViewDetection,
        MockIsEnabledNavigationTargetPipe
      ],
      providers: [
        { provide: VeronaPostService, useValue: veronaPostService },
        {
          provide: NavigationService,
          useValue: { enabledNavigationTargets: new BehaviorSubject<string[]>(['next']) }
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    emittedVisibilities = [];
    fixture = TestBed.createComponent(PageComponent);
    component = fixture.componentInstance;
    component.page = new Page();
    component.scrollPageIndex = 2;
    component.pageIndex = 1;
    component.isVisibleIndexChange.subscribe(event => emittedVisibilities.push(event));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a section per page section', () => {
    expect(fixture.debugElement.queryAll(By.directive(MockSectionComponent)).length)
      .toBe(component.page.sections.length);
  });

  it('should report the scroll page index when it comes into view', () => {
    const selectedIndices: number[] = [];
    component.selectedIndexChange.subscribe(index => selectedIndices.push(index));

    inViewDetections().forEach(detection => detection.intersecting.emit());

    expect(selectedIndices).toEqual([2, 2]);
  });

  it('should report the page as visible when at least one section is visible', fakeAsync(() => {
    component.setIsVisibleIndexSections({ index: 0, isVisible: false });
    component.setIsVisibleIndexSections({ index: 1, isVisible: true });
    tick();

    expect(emittedVisibilities[emittedVisibilities.length - 1]).toEqual({ index: 2, isVisible: true });
  }));

  it('should report the page as hidden when all sections are hidden', fakeAsync(() => {
    component.setIsVisibleIndexSections({ index: 0, isVisible: false });
    component.setIsVisibleIndexSections({ index: 1, isVisible: false });
    tick();

    expect(emittedVisibilities[emittedVisibilities.length - 1]).toEqual({ index: 2, isVisible: false });
  }));

  it('should update the visibility of an already known section', fakeAsync(() => {
    component.setIsVisibleIndexSections({ index: 0, isVisible: true });
    tick();

    component.setIsVisibleIndexSections({ index: 0, isVisible: false });
    tick();

    expect(component.isVisibleIndexSections.length).toBe(1);
    expect(emittedVisibilities[emittedVisibilities.length - 1]).toEqual({ index: 2, isVisible: false });
  }));

  it('should not offer the unit navigation on other than the last page', () => {
    component.isLastPage = false;
    component.showUnitNavNext = true;
    component.isPresentedPagesComplete = true;

    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(MockUnitNavNextComponent))).toBeNull();
  });

  it('should not offer the unit navigation while the pages are not presented completely', () => {
    component.isLastPage = true;
    component.showUnitNavNext = true;
    component.isPresentedPagesComplete = false;

    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(MockUnitNavNextComponent))).toBeNull();
  });

  it('should offer the unit navigation on the completely presented last page', () => {
    component.isLastPage = true;
    component.showUnitNavNext = true;
    component.isPresentedPagesComplete = true;

    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(MockUnitNavNextComponent))).toBeTruthy();
  });

  it('should request the unit navigation of the host', () => {
    component.isLastPage = true;
    component.showUnitNavNext = true;
    component.isPresentedPagesComplete = true;
    fixture.detectChanges();

    fixture.debugElement.query(By.directive(MockUnitNavNextComponent))
      .injector.get(MockUnitNavNextComponent).navigate.emit();

    expect(veronaPostService.sendVopUnitNavigationRequestedNotification).toHaveBeenCalledWith('next');
  });
});
