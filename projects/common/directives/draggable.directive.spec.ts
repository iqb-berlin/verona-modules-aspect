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
      cancelable: true,
      bubbles: true // as a real touch event does: the directive sits above what is actually touched
    });
  };

  /** The audio button of a list item, built the way TextImagePanel builds it: the marker on the button,
      the icon inside it. Its listeners sit on the button, since the directive itself sits further up. */
  const createAudioButton = (): { button: HTMLElement, icon: HTMLElement } => {
    const button = document.createElement('div');
    button.setAttribute('data-draggable-audio', 'true');
    const icon = document.createElement('mat-icon');
    button.appendChild(icon);
    item.appendChild(button);
    button.addEventListener('mousedown', (event: MouseEvent) => directive.onEvent(event));
    button.addEventListener('touchstart', (event: TouchEvent) => directive.onEvent(event));
    button.addEventListener('touchend', (event: TouchEvent) => directive.onTouchEnd(event));
    return { button, icon };
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

  /* A touch on the audio button starts no drag -- and must not report the end of one either, since the
     drop list takes that for the end of the drag before it and the player threw over it (#1397). */
  it('should report no drag when a touch on the audio button ends', () => {
    const { icon } = createAudioButton();
    icon.dispatchEvent(createTouchEvent('touchstart', 1));
    expect(dragStartEvents.length).toBe(0);
    expect(directive.activeTouchId).toBeNull();

    icon.dispatchEvent(createTouchEvent('touchend', 1));
    expect(dragEndCount).toBe(0);
    expect(dragCancelCount).toBe(0);
  });

  /* What is pressed is the icon; the marker sits on the button around it. Read off the target alone,
     the marker would be missed and the item dragged instead. */
  it('should not start a drag from inside the audio button', () => {
    const { icon } = createAudioButton();
    icon.dispatchEvent(new MouseEvent('mousedown', { cancelable: true, button: 0, bubbles: true }));
    expect(dragStartEvents.length).toBe(0);
    expect(documentListeners.has('mouseup')).toBe(false);
  });

  /* The item a second finger lands on holds no drag of its own; ending that touch would otherwise cancel
     the drag the first finger is running elsewhere. */
  it('should report no drag when a second finger touches an item that holds none', () => {
    const touches = [
      new Touch({ identifier: 1, target: handle }),
      new Touch({ identifier: 2, target: handle })
    ];
    handle.dispatchEvent(new TouchEvent('touchstart', {
      touches, changedTouches: [touches[1]], cancelable: true
    }));
    expect(dragStartEvents.length).toBe(0);

    handle.dispatchEvent(createTouchEvent('touchend', 2));
    expect(dragCancelCount).toBe(0);
  });
});
