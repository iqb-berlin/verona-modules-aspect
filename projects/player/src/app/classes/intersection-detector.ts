import { EventEmitter } from '@angular/core';

/**
 * Reports when a watched element comes into view inside a scrolling container. Reports entering only --
 * leaving the view raises nothing.
 */
export class IntersectionDetector {
  intersectionObserver!: IntersectionObserver;
  elements: { id: string, element: Element }[] = [];
  root!: Document | HTMLElement;
  constraint!: string;
  intersecting = new EventEmitter<string | null>();

  constructor(root: Document | HTMLElement,
              constraint: string) {
    this.root = root;
    this.constraint = constraint;
    this.initIntersectionObserver();
  }

  private initIntersectionObserver(): void {
    this.intersectionObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]): void => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.intersectionDetected(entry.target);
          }
        });
      }, {
        root: this.root,
        rootMargin: this.constraint
      }
    );
  }

  /**
   * Starts watching an element. Given an id, that id is emitted when the element comes into view;
   * without one, the element is watched all the same and its appearance is emitted as `null` -- which
   * is how a caller watches for "anything at all appeared here".
   */
  observe(element: Element, id?: string): void {
    if (id) {
      this.elements.push({ id, element });
    }
    this.intersectionObserver.observe(element);
  }

  /**
   * Stops watching the element registered under this id. An id that was never registered -- including
   * every element passed to `observe` without one -- is not found here, and such an element stays
   * watched until `destroy`.
   */
  unobserve(id: string): void {
    const elementIndex = this.elements.findIndex(e => e.id === id);
    if (elementIndex > -1) {
      const element = this.elements[elementIndex];
      this.intersectionObserver.unobserve(element.element);
      this.elements.splice(elementIndex, 1);
    }
  }

  /** Ends the watching for good: the observer is disconnected and `intersecting` completed, so this
      detector cannot be used again. */
  destroy(): void {
    this.intersectionObserver.disconnect();
    this.elements = [];
    this.intersecting.complete();
  }

  private intersectionDetected(element: Element): void {
    const intersectedElementIndex = this.elements.findIndex(e => e.element === element);
    if (intersectedElementIndex > -1) {
      const intersectedElement = this.elements[intersectedElementIndex];
      this.intersecting.emit(intersectedElement.id);
    } else {
      this.intersecting.emit(null);
    }
  }
}
