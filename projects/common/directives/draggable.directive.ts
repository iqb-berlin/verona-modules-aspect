import {
  Directive, EventEmitter, HostListener,
  NgZone, Output, Renderer2
} from '@angular/core';

@Directive({
  standalone: false,
  selector: '[aspect-draggable]'
})
/*
  Maps mouse and touch events to drag events
*/
export class DraggableDirective {
  @Output() dragStart = new EventEmitter<DragStartEvent>();
  @Output() dragMove = new EventEmitter<DragEvent>();
  @Output() dragEnd = new EventEmitter<void>();
  @Output() dragCancel = new EventEmitter<void>();

  activeTouchId: number | null = null;

  /**
   * Whether a drag was reported and therefore still has to be ended. A touch that never became one --
   * on the audio button of an item, or with a second finger already down -- reaches `touchend` with no
   * matching `activeTouchId` and would otherwise report the end of a drag nobody started (#1397).
   */
  private isDragging = false;

  private unlistenMouseMove: (() => void) | undefined;
  private unlistenMouseUp: (() => void) | undefined;

  constructor(private renderer2: Renderer2, private ngZone: NgZone) {}

  @HostListener('touchstart', ['$event'])
  @HostListener('mousedown', ['$event'])
  onEvent(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    if (!isTouchEvent(event) && event.button !== 0) return; // no right-click

    /* `closest`, not the attribute of the target itself: the marker sits on the audio button, and what
       is touched is usually the icon inside it. With the marker on that icon instead, a touch on the
       button's own padding started a drag while the audio played (#1397). */
    if ((event.target as HTMLElement).closest('[data-draggable-audio]')) return;

    const sourceItem: HTMLElement | null = (event.target as HTMLElement).closest('.drop-list-item');
    if (!sourceItem) return;

    if (isTouchEvent(event)) {
      if (this.activeTouchId !== null) {
        this.onTouchCancel();
        return;
      }
      if (event.touches.length > 1) return;
      this.activeTouchId = event.touches?.[0].identifier;
    }

    this.isDragging = true;
    this.dragStart.emit({
      sourceElement: sourceItem,
      x: isTouchEvent(event) ? event.touches?.[0].clientX : event.clientX,
      y: isTouchEvent(event) ? event.touches?.[0].clientY : event.clientY,
      dragType: isTouchEvent(event) ? 'touch' : 'mouse'
    });

    if (!isTouchEvent(event)) { // mousemove events appear even in touch mode, when the pointer leaves the area
      this.ngZone.runOutsideAngular(() => {
        this.unlistenMouseMove = this.renderer2.listen('document', 'mousemove', (e: MouseEvent) => {
          e.preventDefault();
          this.dragMove.emit({
            x: e.clientX,
            y: e.clientY
          });
        });
        this.unlistenMouseUp = this.renderer2.listen('document', 'mouseup', (e: MouseEvent) => {
          e.preventDefault();
          this.isDragging = false;
          this.dragEnd.emit();
          this.unlistenMouseMove?.();
          this.unlistenMouseUp?.();
        });
      });
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    event.preventDefault();
    if (event.touches.length > 1 || (event.touches[0].identifier !== this.activeTouchId)) {
      this.onTouchCancel();
    } else {
      this.dragMove.emit({
        x: event.touches?.[0].clientX,
        y: event.touches?.[0].clientY
      });
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    if (event.changedTouches?.[0].identifier !== this.activeTouchId) {
      this.onTouchCancel();
    } else {
      this.activeTouchId = null;
      this.isDragging = false;
      this.dragEnd.emit();
    }
  }

  @HostListener('touchcancel')
  onTouchCancel() {
    this.activeTouchId = null;
    if (!this.isDragging) return;
    this.isDragging = false;
    this.dragCancel.emit();
  }
}

function isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
  return (event as TouchEvent).touches !== undefined;
}

export interface DragEvent {
  x: number;
  y: number;
}

export interface DragStartEvent extends DragEvent {
  sourceElement: HTMLElement;
  dragType: 'mouse' | 'touch';
}
