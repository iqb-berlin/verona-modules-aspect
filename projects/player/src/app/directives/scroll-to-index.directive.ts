import {
  Directive, ElementRef, Input, OnDestroy, OnInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[aspectScrollToIndex]'
})
export class ScrollToIndexDirective implements OnInit, OnDestroy {
  @Input() selectIndex!: Subject<number>;
  @Input() index!: number;
  @Input() fast!: boolean;
  @Input() scrollPagesLength!: number;

  private ngUnsubscribe = new Subject<void>();

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    if (this.scrollPagesLength > 1) {
      this.selectIndex
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((selectedIndex: number): void => {
          if (selectedIndex === this.index) {
            setTimeout(() => this.elementRef.nativeElement
              .scrollIntoView({ behavior: 'smooth', block: 'start' }));
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
