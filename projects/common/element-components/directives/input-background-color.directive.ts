import {
  Directive, ElementRef, Input, OnChanges
} from '@angular/core';

@Directive({
  selector: '[appInputBackgroundColor]'
})
export class InputBackgroundColorDirective implements OnChanges {
  @Input() backgroundColor!: string;

  constructor(private elementRef: ElementRef) { }

  ngAfterViewInit(): void {
    this.setBackgroundColor();
  }

  ngOnChanges(): void {
    this.setBackgroundColor();
  }

  private setBackgroundColor(): void {
    const targetElements = this.elementRef.nativeElement.querySelector('div.mat-form-field-outline')?.children;
    // This fails, when component is not set up yet, therefore the extra check
    if (targetElements) {
      for (const child of targetElements) {
        child.style.setProperty('background-color', this.backgroundColor);
      }
    }
  }
}
