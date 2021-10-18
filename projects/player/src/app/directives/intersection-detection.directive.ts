import {
  Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';

@Directive({
  selector: '[appIntersectionDetection]'
})
export class IntersectionDetectionDirective implements OnInit, OnDestroy {
  @Input() detectionType!: 'top' | 'bottom' | 'full';
  @Input() id!: string;
  @Output() intersecting = new EventEmitter<{ detectionType: 'top' | 'bottom' | 'full', id: string }>();
  @Input() intersectionContainer!: HTMLElement | Document;

  intersectionObserver!: IntersectionObserver;

  private constraint!: string;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    if (this.detectionType === 'top') {
      this.constraint = '0px 0px -95% 0px';
    } else {
      this.constraint = this.detectionType === 'full' ? '0px 0px 0px 0px' : '-95% 0px 0px 0px';
    }
    this.initIntersectionObserver();
  }

  initIntersectionObserver(): void {
    this.intersectionObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]): void => entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.intersecting.emit({ detectionType: this.detectionType, id: this.id });
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
