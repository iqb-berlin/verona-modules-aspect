import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { Section } from 'common/models/section';
import { PageChangeService } from 'common/services/page-change.service';
import { PageScrollButtonComponent } from './page-scroll-button.component';

describe('PageScrollButtonComponent', () => {
  let component: PageScrollButtonComponent;
  let fixture: ComponentFixture<PageScrollButtonComponent>;
  let pageChanged: Subject<number>;
  let scrollTo: ReturnType<typeof vi.fn>;

  @Component({
    selector: 'aspect-section',
    template: '',
    standalone: false
  })
  class SectionComponent {
    @Input() section!: Section;
    @Input() pageIndex!: number;
  }

  /* The component reads the scroll geometry of its host element, which stays empty in the
     test, so the geometry is handed in explicitly where the API allows it. It has to be a
     real element: onScroll narrows its EventTarget argument with instanceof. */
  const scrollableElement = (scrollTop: number): HTMLElement => {
    const element = document.createElement('div');
    Object.defineProperties(element, {
      scrollHeight: { value: 1000 },
      offsetHeight: { value: 500 },
      scrollTop: { value: scrollTop }
    });
    return element;
  };

  beforeEach(async () => {
    pageChanged = new Subject<number>();

    await TestBed.configureTestingModule({
      declarations: [
        PageScrollButtonComponent,
        SectionComponent],
      providers: [
        { provide: PageChangeService, useValue: { pageChanged: pageChanged.asObservable() } }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageScrollButtonComponent);
    component = fixture.componentInstance;
    scrollTo = vi.fn();
    fixture.nativeElement.scrollTo = scrollTo;
    fixture.detectChanges();
  });

  /* The host has to be scrollable for real: without a height, an overflow and content that
     exceeds it, assigning scrollTop is a no-op and the assertion would hold for an empty method. */
  it('should put the container back to the top', () => {
    const host: HTMLElement = fixture.nativeElement;
    host.style.height = '100px';
    host.style.overflow = 'auto';
    const content = document.createElement('div');
    content.style.height = '1000px';
    host.appendChild(content);

    host.scrollTop = 40;
    expect(host.scrollTop).toBe(40);

    component.scrollToTop();

    expect(host.scrollTop).toBe(0);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show itself while there is content below the visible area', () => {
    component.onScroll(scrollableElement(0));

    expect(component.isVisible.value).toBe(true);
  });

  it('should hide itself at the end of the scroll area', () => {
    component.onScroll(scrollableElement(500));

    expect(component.isVisible.value).toBe(false);
  });

  it('should hide itself shortly before the end of the scroll area', () => {
    component.onScroll(scrollableElement(495));

    expect(component.isVisible.value).toBe(false);
  });

  it('should check the scroll position when the page changed', () => {
    const visibilities: boolean[] = [];
    component.isVisible.subscribe(isVisible => visibilities.push(isVisible));

    pageChanged.next(1);

    expect(visibilities.length).toBeGreaterThan(1);
  });

  it('should report the end of a scroll movement and unblock itself', fakeAsync(() => {
    let scrollEndCount = 0;
    component.scrollingEnded.subscribe(() => { scrollEndCount += 1; });
    component.isBlocked = true;

    component.onScrollEnd();
    tick();

    expect(scrollEndCount).toBe(1);
    expect(component.isBlocked).toBe(false);
  }));

  it('should scroll down repeatedly while scrolling is switched on', () => {
    const setInterval = vi.spyOn(window, 'setInterval').mockReturnValue(4711 as never);

    component.toggleScrolling(true);

    expect(setInterval).toHaveBeenCalled();
    expect(component.scrollIntervalId).toBe(4711);
    setInterval.mockRestore();
  });

  it('should scroll the host element down step by step', () => {
    const setInterval = vi.spyOn(window, 'setInterval')
      .mockImplementation(((handler: TimerHandler): number => {
        (handler as () => void)();
        return 4711;
      }) as never);
    component.isSnapMode = false;

    component.toggleScrolling(true);

    expect(scrollTo).toHaveBeenCalledWith(0, 2);
    setInterval.mockRestore();
  });

  it('should not scroll while it is blocked', () => {
    const setInterval = vi.spyOn(window, 'setInterval');
    component.isBlocked = true;

    component.toggleScrolling(true);

    expect(setInterval).not.toHaveBeenCalled();
    setInterval.mockRestore();
  });

  it('should stop scrolling when scrolling is switched off', () => {
    vi.spyOn(window, 'setInterval').mockReturnValue(4711 as never);
    const clearInterval = vi.spyOn(window, 'clearInterval');
    component.toggleScrolling(true);

    component.toggleScrolling(false);

    expect(clearInterval).toHaveBeenCalledWith(4711);
    vi.restoreAllMocks();
  });

  it('should stop scrolling as soon as it becomes invisible', () => {
    vi.spyOn(window, 'setInterval').mockReturnValue(4711 as never);
    const clearInterval = vi.spyOn(window, 'clearInterval');
    component.toggleScrolling(true);

    component.isVisible.next(false);

    expect(clearInterval).toHaveBeenCalledWith(4711);
    vi.restoreAllMocks();
  });
});
