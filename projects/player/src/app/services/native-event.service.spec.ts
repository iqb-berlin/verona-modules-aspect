import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NativeEventService } from './native-event.service';

describe('NativeEventService', () => {
  let service: NativeEventService;
  let hasFocus: boolean;

  beforeEach(() => {
    hasFocus = true;
    TestBed.configureTestingModule({
      providers: [
        NativeEventService,
        { provide: DOCUMENT, useValue: { hasFocus: () => hasFocus } }
      ]
    });
    service = TestBed.inject(NativeEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should report the focus state on window focus and blur', () => {
    const focusStates: boolean[] = [];
    service.focus.subscribe(state => focusStates.push(state));

    window.dispatchEvent(new Event('focus'));
    hasFocus = false;
    window.dispatchEvent(new Event('blur'));

    expect(focusStates).toEqual([true, false]);
  });

  it('should report mouse up events', () => {
    const events: MouseEvent[] = [];
    service.mouseUp.subscribe(event => events.push(event));
    const mouseUpEvent = new MouseEvent('mouseup');

    window.dispatchEvent(mouseUpEvent);

    expect(events).toEqual([mouseUpEvent]);
  });

  it('should report pointer up events', () => {
    const events: PointerEvent[] = [];
    service.pointerUp.subscribe(event => events.push(event));
    const pointerUpEvent = new PointerEvent('pointerup');

    window.dispatchEvent(pointerUpEvent);

    expect(events).toEqual([pointerUpEvent]);
  });

  it('should report pointer down events', () => {
    const events: PointerEvent[] = [];
    service.pointerDown.subscribe(event => events.push(event));
    const pointerDownEvent = new PointerEvent('pointerdown');

    window.dispatchEvent(pointerDownEvent);

    expect(events).toEqual([pointerDownEvent]);
  });

  it('should report the window width on resize', () => {
    const widths: number[] = [];
    service.resize.subscribe(width => widths.push(width));

    window.dispatchEvent(new Event('resize'));

    expect(widths).toEqual([window.innerWidth]);
  });

  it('should not replay events that happened before subscribing', () => {
    window.dispatchEvent(new MouseEvent('mouseup'));
    const events: MouseEvent[] = [];

    service.mouseUp.subscribe(event => events.push(event));

    expect(events).toEqual([]);
  });
});
