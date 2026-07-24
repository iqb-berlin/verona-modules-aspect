import {
  AfterViewInit, Directive, ElementRef, Input, Renderer2
} from '@angular/core';

@Directive({
  selector: '[autoHeight]',
  standalone: false
})
export class AutoHeightDirective implements AfterViewInit {
  @Input() autoHeight!: boolean;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    if (this.autoHeight) {
      this.renderer.listen(this.elementRef.nativeElement, 'selectionchange', () => this.resize());
      setTimeout(() => this.resize());
    }
  }

  private resize() {
    this.renderer
      .setStyle(this.elementRef.nativeElement, 'height', 'auto');
    // after calculating the scroll height, set it to the element
    this.renderer
      .setStyle(this.elementRef.nativeElement, 'height', `${this.elementRef.nativeElement.scrollHeight}px`);
  }
}
