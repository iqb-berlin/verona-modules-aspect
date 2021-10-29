import {
  Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';

@Directive({
  selector: '[appIntersectionDetection]'
})
export class IntersectionDetectionDirective implements OnInit, OnDestroy {
  @Input() detectionType!: 'top' | 'bottom';
  @Output() intersecting = new EventEmitter<'top' | 'bottom'>();
  @Input() intersectionContainer!: HTMLElement;

  intersectionObserver!: IntersectionObserver;

  private constraint!: string;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.constraint = this.detectionType === 'top' ? '0px 0px -95% 0px' : '-95% 0px 0px 0px';
    this.initIntersectionObserver();
  }

  initIntersectionObserver(): void {
    this.intersectionObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]): void => entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.intersecting.emit(this.detectionType);
        }
      }), {
        root: this.intersectionContainer,
        rootMargin: this.constraint
      }
    );
    this.intersectionObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.intersectionObserver.unobserve(this.elementRef.nativeElement);
    this.intersectionObserver.disconnect();
  }
}
