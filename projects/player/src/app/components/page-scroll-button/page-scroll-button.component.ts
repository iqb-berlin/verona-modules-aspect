import {
  AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output
} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PageChangeService } from 'common/services/page-change.service';
import { IsVisibleIndex } from 'player/src/app/models/is-visible-index.interface';

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

  @HostListener('scrollend')
  onScrollEnd() {
    this.scrollingEnded.emit();
    setTimeout(() => { this.isBlocked = false; });
  }

  @Input() containerPosition!: 'left' | 'right' | null;
  @Input() containerMaxWidth!: string;
  @Input() isVisibleIndexPages!: BehaviorSubject<IsVisibleIndex[]>;
  @Input() isSnapMode!: boolean;
  @Output() scrollToNextPage: EventEmitter<void> = new EventEmitter<void>();
  @Output() scrollingEnded: EventEmitter<void> = new EventEmitter<void>();

  isVisible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  scrollIntervalId!: number;
  isBlocked = false;

  private ngUnsubscribe = new Subject<void>();

  constructor(private elementRef: ElementRef,
              private pageChangeService: PageChangeService) {
    this.pageChangeService.pageChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.checkScrollPosition(this.elementRef.nativeElement));
    this.isVisible
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(value => {
        if (!value) {
          this.clearScrollIng();
        }
      });
  }

  ngAfterViewInit(): void {
    // give media elements time to load
    setTimeout(() => this.checkScrollPosition(this.elementRef.nativeElement), 200);
    if (this.isVisibleIndexPages) {
      this.isVisibleIndexPages
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((): void => {
          setTimeout(() => this.checkScrollPosition(this.elementRef.nativeElement), 200);
        });
    }
  }

  private checkScrollPosition(element: HTMLElement): void {
    this.isVisible.next(element.scrollHeight - element.offsetHeight > element.scrollTop + 10);
  }

  toggleScrolling(scrolling: boolean): void {
    if (scrolling && !this.isBlocked) {
      this.scrollIntervalId = setInterval(() => {
        this.scrollDown();
      });
    } else {
      this.clearScrollIng();
    }
  }

  private scrollDown(): void {
    const nextScrollTop = this.elementRef.nativeElement.scrollTop + 2;
    if (this.isSnapMode) {
      const pageBottoms: number[] = this.getBottomsOfPages();
      if (pageBottoms.length > 1) {
        const pageIndex = pageBottoms
          .findIndex(bottom => Math
            .abs(bottom - (nextScrollTop + this.elementRef.nativeElement.offsetHeight)) <= 2);
        if (pageIndex > -1) {
          this.clearScrollIng();
          this.isBlocked = true;
          this.scrollToNextPage.emit();
        } else {
          this.elementRef.nativeElement.scrollTo(0, nextScrollTop);
        }
      } else {
        this.elementRef.nativeElement.scrollTo(0, nextScrollTop);
      }
    } else {
      this.elementRef.nativeElement.scrollTo(0, nextScrollTop);
    }
  }

  private getBottomsOfPages(): number[] {
    return [...this.elementRef.nativeElement.querySelectorAll('aspect-page')]
      .map(page => page.parentElement?.offsetHeight)
      .reduce((acc, current, index) => {
        index === 0 ? acc.push(current) : acc.push(current + acc[index - 1]);
        return acc;
      }, []);
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
