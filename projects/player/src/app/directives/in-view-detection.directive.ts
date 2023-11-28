import {
  Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IntersectionDetector } from '../classes/intersection-detector';

@Directive({
  selector: '[aspectInViewDetection]'
})
export class InViewDetectionDirective implements OnInit, OnDestroy {
  @Input() detectionType!: 'top' | 'bottom';
  @Output() intersecting = new EventEmitter();
  @Input() intersectionContainer!: HTMLElement;
  @Input() topPadding!: number;

  intersectionDetector!: IntersectionDetector;

  private ngUnsubscribe = new Subject<void>();

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    const constraint = this.detectionType === 'top' ? `${this.topPadding}px 0% -90% 0%` : '-90% 0% 0% 0%';
    this.intersectionDetector = new IntersectionDetector(this.intersectionContainer, constraint);
    this.intersectionDetector.observe(this.elementRef.nativeElement);
    this.intersectionDetector.intersecting
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.intersecting.emit());
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.intersectionDetector.disconnect(this.elementRef.nativeElement);
  }
}
