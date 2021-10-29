import { EventEmitter } from '@angular/core';

export class IntersectionDetector {
  intersectionObserver!: IntersectionObserver;
  elements: { id: string, element: Element }[] = [];
  root!: Document;
  intersecting = new EventEmitter<string>();

  constructor(root: Document) {
    this.root = root;
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
        rootMargin: '0px 0px 0px 0px'
      }
    );
  }

  observe(id: string, element: Element): void {
    this.elements.push({ id, element });
    this.intersectionObserver.observe(element);
  }

  private intersectionDetected(element: Element):void {
    const intersectedElementIndex = this.elements.findIndex(e => e.element === element);
    if (intersectedElementIndex > -1) {
      const intersectedElement = this.elements[intersectedElementIndex];
      this.intersectionObserver.unobserve(intersectedElement.element);
      this.elements.splice(intersectedElementIndex, 1);
    }
  }
}
