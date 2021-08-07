import {
  Directive, ElementRef, Input
} from '@angular/core';

@Directive({
  selector: '[appHideFirstChild]'
})
export class HideFirstChildDirective {
  @Input() hideFirstChild!: boolean;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    if (this.hideFirstChild && this.elementRef.nativeElement.firstChild) {
      this.elementRef.nativeElement.firstChild.style.display = 'none';
    }
  }
}
