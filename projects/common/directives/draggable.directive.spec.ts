import { NgZone, Renderer2 } from '@angular/core';
import { DraggableDirective, DragEvent, DragStartEvent } from './draggable.directive';

describe('DraggableDirective', () => {
  let directive: DraggableDirective;
  let documentListeners: Map<string, (event: MouseEvent) => void>;
  let unlistenedEvents: string[];
  let item: HTMLElement;
  let handle: HTMLElement;

  let dragStartEvents: DragStartEvent[];
  let dragMoveEvents: DragEvent[];
  let dragEndCount: number;
  let dragCancelCount: number;

  const createTouchEvent = (type: string, identifier: number, x: number = 0, y: number = 0): TouchEvent => {
    const touch = new Touch({
      identifier, target: handle, clientX: x, clientY: y
    });
    return new TouchEvent(type, {
      touches: type === 'touchend' ? [] : [touch],
      changedTouches: [touch],
      cancelable: true
    });
  };

  beforeEach(() => {
    documentListeners = new Map();
    unlistenedEvents = [];
    const renderer = {
      listen: (_target: unknown, eventName: string, callback: (event: MouseEvent) => void): (() => void) => {
        documentListeners.set(eventName, callback);
        return () => {
          unlistenedEvents.push(eventName);
          documentListeners.delete(eventName);
        };
      }
    } as unknown as Renderer2;
    const zone = { runOutsideAngular: <T>(fn: () => T): T => fn() } as unknown as NgZone;
    directive = new DraggableDirective(renderer, zone);

    dragStartEvents = [];
    dragMoveEvents = [];
    dragEndCount = 0;
    dragCancelCount = 0;
    directive.dragStart.subscribe((event: DragStartEvent) => dragStartEvents.push(event));
    directive.dragMove.subscribe((event: DragEvent) => dragMoveEvents.push(event));
    directive.dragEnd.subscribe(() => { dragEndCount += 1; });
    directive.dragCancel.subscribe(() => { dragCancelCount += 1; });

    item = document.createElement('div');
    item.classList.add('drop-list-item');
    handle = document.createElement('span');
    item.appendChild(handle);
    document.body.appendChild(item);
    handle.addEventListener('mousedown', (event: MouseEvent) => directive.onEvent(event));
    handle.addEventListener('touchstart', (event: TouchEvent) => directive.onEvent(event));
    handle.addEventListener('touchmove', (event: TouchEvent) => directive.onTouchMove(event));
    handle.addEventListener('touchend', (event: TouchEvent) => directive.onTouchEnd(event));
  });

  afterEach(() => {
    item.remove();
  });

  it('should emit dragStart with the enclosing drop list item on mousedown', () => {
    handle.dispatchEvent(new MouseEvent('mousedown', {
      cancelable: true, button: 0, clientX: 11, clientY: 22
    }));
    expect(dragStartEvents.length).toBe(1);
    expect(dragStartEvents[0].sourceElement).toBe(item);
    expect(dragStartEvents[0].x).toBe(11);
    expect(dragStartEvents[0].y).toBe(22);
    expect(dragStartEvents[0].dragType).toBe('mouse');
    expect(documentListeners.has('mousemove')).toBe(true);
    expect(documentListeners.has('mouseup')).toBe(true);
  });

  it('should emit dragMove and dragEnd for document mouse events and unlisten afterwards', () => {
    handle.dispatchEvent(new MouseEvent('mousedown', { cancelable: true, button: 0 }));
    documentListeners.get('mousemove')?.(new MouseEvent('mousemove', {
      cancelable: true, clientX: 5, clientY: 6
    }));
    expect(dragMoveEvents).toEqual([{ x: 5, y: 6 }]);

    documentListeners.get('mouseup')?.(new MouseEvent('mouseup', { cancelable: true }));
    expect(dragEndCount).toBe(1);
    expect(unlistenedEvents).toEqual(['mousemove', 'mouseup']);
  });

  it('should ignore mousedown outside of a drop list item and non-left buttons', () => {
    const outsideElement = document.createElement('span');
    document.body.appendChild(outsideElement);
    outsideElement.addEventListener('mousedown', (event: MouseEvent) => directive.onEvent(event));
    outsideElement.dispatchEvent(new MouseEvent('mousedown', { cancelable: true, button: 0 }));
    outsideElement.remove();

    handle.dispatchEvent(new MouseEvent('mousedown', { cancelable: true, button: 2 }));

    expect(dragStartEvents.length).toBe(0);
  });

  it('should map a touch sequence to dragStart, dragMove and dragEnd', () => {
    handle.dispatchEvent(createTouchEvent('touchstart', 1, 10, 20));
    expect(dragStartEvents.length).toBe(1);
    expect(dragStartEvents[0].sourceElement).toBe(item);
    expect(dragStartEvents[0].x).toBe(10);
    expect(dragStartEvents[0].y).toBe(20);
    expect(dragStartEvents[0].dragType).toBe('touch');
    expect(directive.activeTouchId).toBe(1);

    handle.dispatchEvent(createTouchEvent('touchmove', 1, 30, 40));
    expect(dragMoveEvents).toEqual([{ x: 30, y: 40 }]);

    handle.dispatchEvent(createTouchEvent('touchend', 1));
    expect(dragEndCount).toBe(1);
    expect(directive.activeTouchId).toBeNull();
  });

  it('should cancel the drag when a touchmove of another touch arrives', () => {
    handle.dispatchEvent(createTouchEvent('touchstart', 1));
    handle.dispatchEvent(createTouchEvent('touchmove', 2));
    expect(dragCancelCount).toBe(1);
    expect(directive.activeTouchId).toBeNull();
  });

  it('should cancel the drag when a second touchstart arrives', () => {
    handle.dispatchEvent(createTouchEvent('touchstart', 1));
    handle.dispatchEvent(createTouchEvent('touchstart', 2));
    expect(dragStartEvents.length).toBe(1);
    expect(dragCancelCount).toBe(1);
  });
});
