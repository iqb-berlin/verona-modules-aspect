import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { TooltipComponent } from 'common/components/tooltip/tooltip.component';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import { TooltipEventTooltipDirective } from './tooltip-event-tooltip.directive';

@Component({
  template: '<div class="host" tooltipEventTooltip><span class="child"></span></div>',
  standalone: false
})
class TestHostComponent {}

describe('TooltipEventTooltipDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let childElement: HTMLElement;

  const createTooltipEvent = (eventName: string, tooltipText: string): CustomEvent => new CustomEvent(
    eventName,
    { detail: { tooltipText, tooltipPosition: 'below' }, bubbles: true }
  );

  const getTooltipText = (): string | undefined => document.body
    .querySelector('aspect-tooltip .tooltip-text')?.textContent?.trim();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TestHostComponent,
        TooltipEventTooltipDirective,
        TooltipComponent,
        SafeResourceHTMLPipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    childElement = fixture.nativeElement.querySelector('.child');
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should show a tooltip with the text of a bubbling pointerDownTooltip event', () => {
    childElement.dispatchEvent(createTooltipEvent('pointerDownTooltip', 'text from event'));
    fixture.detectChanges(); // render the dynamically created tooltip component
    expect(getTooltipText()).toBe('text from event');
  });

  it('should show a tooltip on pointerEnterTooltip', () => {
    childElement.dispatchEvent(createTooltipEvent('pointerEnterTooltip', 'enter text'));
    fixture.detectChanges();
    expect(getTooltipText()).toBe('enter text');
  });

  it('should not show a tooltip when the event detail has no text', () => {
    childElement.dispatchEvent(createTooltipEvent('pointerDownTooltip', ''));
    expect(document.body.querySelector('aspect-tooltip')).toBeNull();
  });

  it('should not show a tooltip when the data attributes behind the detail are absent', () => {
    childElement.dispatchEvent(new CustomEvent(
      'pointerDownTooltip',
      { detail: { tooltipText: null, tooltipPosition: null }, bubbles: true }
    ));
    expect(document.body.querySelector('aspect-tooltip')).toBeNull();
  });

  it('should ignore an event that carries no detail at all', () => {
    expect(() => childElement.dispatchEvent(new Event('pointerDownTooltip', { bubbles: true })))
      .not.toThrow();
    expect(document.body.querySelector('aspect-tooltip')).toBeNull();
  });

  it('should hide the tooltip on mouseLeaveTooltip', () => {
    childElement.dispatchEvent(createTooltipEvent('pointerDownTooltip', 'text from event'));
    fixture.detectChanges();
    expect(getTooltipText()).toBe('text from event');
    childElement.dispatchEvent(new CustomEvent('mouseLeaveTooltip', { bubbles: true }));
    expect(document.body.querySelector('aspect-tooltip')).toBeNull();
  });
});
