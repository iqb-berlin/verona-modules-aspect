import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output
} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'aspect-page-scroll-button',
  templateUrl: './page-scroll-button.component.html',
  styleUrls: ['./page-scroll-button.component.scss']
})
export class PageScrollButtonComponent implements AfterViewInit, OnDestroy {
  @HostListener('scroll', ['$event.target'])
  onScroll(element: HTMLElement) {
    this.checkScrollPosition(element);
  }

  @Input() isSnapMode!: boolean;

  @Output() scrollToNextPage: EventEmitter<void> = new EventEmitter<void>();

  isVisible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  scrollIntervalId!: number;

  private ngUnsubscribe = new Subject<void>();

  constructor(private elementRef: ElementRef,
              private changeDetectorRef: ChangeDetectorRef) {
    this.isVisible
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(value => {
        if (!value) {
          this.clearScrollIng();
        }
      });
  }

  ngAfterViewInit(): void {
    this.checkScrollPosition(this.elementRef.nativeElement);
    this.changeDetectorRef.detectChanges();
  }

  private checkScrollPosition(element: HTMLElement): void {
    this.isVisible.next(element.scrollHeight - element.offsetHeight > element.scrollTop);
  }

  toggleScrolling(scrolling: boolean) {
    if (scrolling) {
      this.scrollIntervalId = setInterval(() => {
        this.scrollDown();
      });
    } else {
      setTimeout(() => this.clearScrollIng(), 0);
    }
  }

  scrollDown(): void {
    const lastScrollTop = this.elementRef.nativeElement.scrollTop;
    this.elementRef.nativeElement.scrollTop = lastScrollTop + 2;
    if (this.isSnapMode && (this.elementRef.nativeElement.scrollTop !== lastScrollTop + 2)) {
      this.clearScrollIng();
      // FF needs time to finish concat scroll anmations before setting a new page index
      setTimeout(() => this.scrollToNextPage.emit(), 100);
    }
  }

  private clearScrollIng(): void {
    if (this.scrollIntervalId) {
      clearInterval(this.scrollIntervalId);
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
