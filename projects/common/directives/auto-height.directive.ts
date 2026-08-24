import {
  AfterViewInit, Directive, ElementRef, Input, OnDestroy, Renderer2
} from '@angular/core';

@Directive({
  selector: '[autoHeight]',
  standalone: false
})
export class AutoHeightDirective implements AfterViewInit, OnDestroy {
  @Input() autoHeight!: boolean;

  private observer?: ResizeObserver;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    if (this.autoHeight) {
      this.renderer.listen(this.elementRef.nativeElement, 'selectionchange', () => this.resize());
      /* The pages of a unit are all built when it is loaded, but only the one shown first is put
         into the document -- the others follow when they are turned to. So on every later page the
         measurement below runs on an element that has no box yet, and something has to bring a
         second one once it has (#1335). */
      this.observer = new ResizeObserver(() => this.resize());
      this.observer.observe(this.elementRef.nativeElement);
      setTimeout(() => this.resize());
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private resize(): void {
    const element = this.elementRef.nativeElement;
    this.renderer.setStyle(element, 'height', 'auto');
    const { scrollHeight } = element;
    /* An element without a box measures 0. Writing that would pin the field to no height at all,
       and nothing would correct it: a click into an empty field changes no selection, so Firefox
       fires no selectionchange and the caret has no height to be drawn in until the first
       character arrives (#1335). `auto` is the height the rows attribute gives. */
    if (!scrollHeight) return;
    /* From the first measurement on, selectionchange carries the height as it always did. The
       observer has to go before the write below, and not only to keep it from answering its own
       change: it observes the element it writes to, so it would also undo a height the reader
       dragged with the resize grabber, and in a table cell, whose height the field's own height
       feeds back into, the two could chase each other. */
    this.observer?.disconnect();
    this.observer = undefined;
    this.renderer.setStyle(element, 'height', `${scrollHeight}px`);
  }
}
