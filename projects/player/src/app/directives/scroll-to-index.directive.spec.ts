import { Component } from '@angular/core';
import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { ScrollToIndexDirective } from './scroll-to-index.directive';

/*
 * The directive is declared by the app module, so a spec local NgModule would break the
 * AOT build (NG6007). The host therefore uses the directive as a plain attribute and the
 * inputs are set on the directive instance before the first change detection run.
 */
@Component({
  template: '<div id="page" aspectScrollToIndex></div>',
  standalone: false
})
class TestComponent {}

describe('ScrollToIndexDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let directive: ScrollToIndexDirective;
  let selectIndex: Subject<number>;
  let scrollIntoView: ReturnType<typeof vi.fn>;

  const initDirective = (scrollPagesLength: number = 3): void => {
    directive = fixture.debugElement.query(By.directive(ScrollToIndexDirective))
      .injector.get(ScrollToIndexDirective);
    directive.selectIndex = selectIndex;
    directive.index = 1;
    directive.scrollPagesLength = scrollPagesLength;
    fixture.detectChanges();
    scrollIntoView = vi.fn();
    fixture.debugElement.query(By.css('#page')).nativeElement.scrollIntoView = scrollIntoView;
  };

  beforeEach(() => {
    selectIndex = new Subject<number>();
    fixture = TestBed.configureTestingModule({
      declarations: [TestComponent, ScrollToIndexDirective]
    })
      .createComponent(TestComponent);
  });

  it('should create an instance', () => {
    initDirective();

    expect(directive).toBeTruthy();
  });

  it('should scroll the host element into view when its index is selected', fakeAsync(() => {
    initDirective();

    selectIndex.next(1);
    tick();

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  }));

  it('should ignore the selection of another index', fakeAsync(() => {
    initDirective();

    selectIndex.next(2);
    tick();

    expect(scrollIntoView).not.toHaveBeenCalled();
  }));

  it('should not react on selections for a single scroll page', fakeAsync(() => {
    initDirective(1);

    selectIndex.next(1);
    tick();

    expect(scrollIntoView).not.toHaveBeenCalled();
  }));

  it('should stop reacting on selections after destruction', fakeAsync(() => {
    initDirective();

    fixture.destroy();
    selectIndex.next(1);
    tick();

    expect(scrollIntoView).not.toHaveBeenCalled();
  }));
});
