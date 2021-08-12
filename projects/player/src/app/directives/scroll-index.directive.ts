import {
  Directive, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges
} from '@angular/core';

@Directive({
  selector: '[appScrollIndex]'
})
export class ScrollIndexDirective implements OnChanges, OnInit, OnDestroy {
  @Input() selectedIndex!: number;
  @Input() index!: number;
  @Input() scrollPagesContainer!: HTMLElement;
  @Output() selectedIndexChange = new EventEmitter<number>();

  private useScrollIntoView: boolean = true;
  private intersectionObserver!: IntersectionObserver;

  constructor(private elementRef: ElementRef) {
  }

  ngOnInit(): void {
    this.intersectionObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]): void => {
      if (entries[0].isIntersecting) {
        this.selectedIndex = this.index;
        this.useScrollIntoView = false;
        this.selectedIndexChange.emit(this.selectedIndex);
      }
    }, {
      root: this.scrollPagesContainer,
      rootMargin: '-80% 0px -20% 0px'
    });
    // TODO: find solution for pages which are smaller than 80%
    this.intersectionObserver.observe(this.elementRef.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.useScrollIntoView && changes.selectedIndex?.currentValue === this.index) {
      this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.useScrollIntoView = true;
    }
  }

  ngOnDestroy(): void {
    this.intersectionObserver.unobserve(this.elementRef.nativeElement);
    this.intersectionObserver.disconnect();
  }
}
