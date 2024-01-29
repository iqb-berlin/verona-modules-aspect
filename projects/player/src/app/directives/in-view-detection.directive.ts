import {
  AfterViewInit,
  Directive, ElementRef, EventEmitter, Input, OnDestroy, Output
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IntersectionDetector } from '../classes/intersection-detector';

@Directive({
  selector: '[aspectInViewDetection]'
})
export class InViewDetectionDirective implements AfterViewInit, OnDestroy {
  @Input() detectionType!: 'top' | 'bottom';
  @Output() intersecting = new EventEmitter();
  @Input() topPadding!: number;

  intersectionDetector!: IntersectionDetector;

  private ngUnsubscribe = new Subject<void>();

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    const intersectionContainer = this.elementRef.nativeElement.closest('aspect-page-scroll-button') || document;
    if (intersectionContainer) {
      const constraint = this.detectionType === 'top' ? '0px' : '0px';
      this.intersectionDetector = new IntersectionDetector(intersectionContainer, constraint);
      this.intersectionDetector.observe(this.elementRef.nativeElement);
      this.intersectionDetector.intersecting
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => this.intersecting.emit());
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.intersectionDetector) this.intersectionDetector.disconnect(this.elementRef.nativeElement);
  }
}
