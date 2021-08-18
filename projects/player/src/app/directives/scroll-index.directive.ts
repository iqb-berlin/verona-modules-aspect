import {
  Directive, ElementRef, Input, OnChanges, SimpleChanges
} from '@angular/core';

@Directive({
  selector: '[appScrollIndex]'
})
export class ScrollIndexDirective implements OnChanges {
  @Input() selectedIndex!: number;
  @Input() index!: number;

  constructor(private elementRef: ElementRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedIndex?.currentValue === this.index) {
      this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
