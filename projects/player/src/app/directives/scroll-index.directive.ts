import {
  Directive, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges
} from '@angular/core';

@Directive({
  selector: '[appScrollIndex]'
})
export class ScrollIndexDirective implements OnChanges {
  @Input() selectedIndex!: number;
  @Input() index!: number;
  @Output() selectedIndexChange = new EventEmitter();

  constructor(private elementRef: ElementRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedIndex?.currentValue === this.index) {
      this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.selectedIndexChange.emit();
    }
  }
}
