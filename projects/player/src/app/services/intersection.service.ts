import {
  EventEmitter, Inject, Injectable, Output
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class IntersectionService {
  intersectionObserver!: IntersectionObserver;
  elements: { id: string, element: Element }[] = [];
  @Output() intersecting = new EventEmitter<string>();

  constructor(@Inject(DOCUMENT) private document: Document) {
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
        root: document,
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
      this.intersecting.emit(intersectedElement.id);
      this.intersectionObserver.unobserve(intersectedElement.element);
      this.elements.splice(intersectedElementIndex, 1);
    }
  }
}
