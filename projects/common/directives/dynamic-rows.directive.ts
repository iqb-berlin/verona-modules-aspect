import {
  AfterViewInit, Directive, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges
} from '@angular/core';

@Directive({
  selector: '[dynamicRows]'
})
export class DynamicRowsDirective implements AfterViewInit, OnChanges {
  @Input() fontSize!: number;
  @Input() expectedCharactersCount!: number;
  @Output() dynamicRowsChange: EventEmitter<number> = new EventEmitter<number>();

  @HostListener('window:resize') onResize() {
    // guard against resize before view is rendered
    this.calculateDynamicRows();
  }

  constructor(public elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    this.calculateDynamicRows();
  }

  calculateDynamicRows(): void {
    // give the textarea time to render before calculating the dynamic row count
    setTimeout(() => {
      const averageCharWidth = this.fontSize / 2;
      if (this.elementRef.nativeElement.offsetWidth) {
        this.dynamicRowsChange.emit(
          Math.ceil((
            this.expectedCharactersCount * averageCharWidth) /
            this.elementRef.nativeElement.offsetWidth
          )
        );
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.fontSize || changes.expectedCharactersCount) {
      this.calculateDynamicRows();
    }
  }
}
