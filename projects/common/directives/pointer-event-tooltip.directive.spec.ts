import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TooltipComponent } from 'common/components/tooltip/tooltip.component';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import { PointerEventTooltipDirective } from './pointer-event-tooltip.directive';

// tooltipText is set on the directive instance: property bindings on native
// elements in spec-local host templates are rejected by the AOT compiler (NG8002).
@Component({
  template: '<div class="host" pointerEventTooltip tooltipPosition="below"></div>',
  standalone: false
})
class TestHostComponent {}

describe('PointerEventTooltipDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let directive: PointerEventTooltipDirective;
  let hostElement: HTMLElement;

  const getTooltipText = (): string | undefined => document.body
    .querySelector('aspect-tooltip .tooltip-text')?.textContent?.trim();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TestHostComponent,
        PointerEventTooltipDirective,
        TooltipComponent,
        SafeResourceHTMLPipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const hostDebugElement = fixture.debugElement.query(By.directive(PointerEventTooltipDirective));
    directive = hostDebugElement.injector.get(PointerEventTooltipDirective);
    directive.tooltipText = 'tooltip text';
    hostElement = hostDebugElement.nativeElement;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should show the tooltip on pointerenter', () => {
    hostElement.dispatchEvent(new Event('pointerenter'));
    fixture.detectChanges(); // render the dynamically created tooltip component
    expect(getTooltipText()).toBe('tooltip text');
  });

  it('should not show a tooltip when the tooltip text is empty', () => {
    directive.tooltipText = '';
    hostElement.dispatchEvent(new Event('pointerenter'));
    expect(document.body.querySelector('aspect-tooltip')).toBeNull();
  });

  it('should hide the tooltip immediately on mouseleave', () => {
    hostElement.dispatchEvent(new Event('pointerenter'));
    fixture.detectChanges();
    expect(getTooltipText()).toBe('tooltip text');
    hostElement.dispatchEvent(new Event('mouseleave'));
    expect(document.body.querySelector('aspect-tooltip')).toBeNull();
  });

  it('should hide the tooltip with a delay of 5000ms on pointerleave', fakeAsync(() => {
    // call the handlers directly so the hide timeout is scheduled inside the
    // fakeAsync zone (host event listeners run in the fixture's NgZone,
    // whose timers tick() cannot flush)
    directive.onPointerDown();
    fixture.detectChanges();
    tick(); // flush the tooltip positioning timeout
    directive.onPointerLeave();
    tick(4999);
    expect(getTooltipText()).toBe('tooltip text');
    tick(1);
    expect(document.body.querySelector('aspect-tooltip')).toBeNull();
  }));

  it('should remove the tooltip when the directive is destroyed', () => {
    hostElement.dispatchEvent(new Event('pointerenter'));
    fixture.detectChanges();
    expect(getTooltipText()).toBe('tooltip text');
    fixture.destroy();
    expect(document.body.querySelector('aspect-tooltip')).toBeNull();
  });
});
