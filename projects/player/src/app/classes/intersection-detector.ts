import { EventEmitter } from '@angular/core';

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

  observe(element: Element, id?: string): void {
    if (id) {
      this.elements.push({ id, element });
    }
    this.intersectionObserver.observe(element);
  }

  unobserve(id: string): void {
    const elementIndex = this.elements.findIndex(e => e.id === id);
    if (elementIndex > -1) {
      const element = this.elements[elementIndex];
      this.intersectionObserver.unobserve(element.element);
      this.elements.splice(elementIndex, 1);
    }
  }

  disconnect(element: Element): void {
    this.intersectionObserver.unobserve(element);
    this.intersectionObserver.disconnect();
  }

  private intersectionDetected(element: Element): void {
    const intersectedElementIndex = this.elements.findIndex(e => e.element === element);
    if (intersectedElementIndex > -1) {
      const intersectedElement = this.elements[intersectedElementIndex];
      this.intersecting.emit(intersectedElement.id);
    } else {
      this.intersecting.emit();
    }
  }
}
