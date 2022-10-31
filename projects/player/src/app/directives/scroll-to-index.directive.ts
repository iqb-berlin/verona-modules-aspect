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

  private ngUnsubscribe = new Subject<void>();

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.selectIndex
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((selectedIndex: number): void => {
        if (selectedIndex === this.index) {
          this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
