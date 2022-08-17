import {
  Directive, ElementRef, Input, OnDestroy, OnInit
} from '@angular/core';
import { Subject } from 'rxjs';

@Directive({
  selector: '[aspectScrollToIndex]'
})
export class ScrollToIndexDirective implements OnInit, OnDestroy {
  @Input() selectIndex!: Subject<number>;
  @Input() index!: number;

  private ngUnsubscribe = new Subject<void>();

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.selectIndex.subscribe((selectedIndex: number): void => {
      if (selectedIndex === this.index) {
        this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
