import {
  AfterViewInit,
  Directive, ElementRef, Input, OnChanges
} from '@angular/core';

@Directive({
  selector: '[appInputBackgroundColor]'
})
export class InputBackgroundColorDirective implements AfterViewInit, OnChanges {
  @Input() backgroundColor!: string;
  private targetElements!: HTMLElement[];

  constructor(private elementRef: ElementRef) { }

  ngAfterViewInit(): void {
    this.targetElements = this.elementRef.nativeElement.querySelector('div.mat-form-field-outline')?.children;
    this.setBackgroundColor();
  }

  ngOnChanges(): void {
    this.setBackgroundColor();
  }

  private setBackgroundColor(): void {
    // This fails, when component is not set up yet, therefore the extra check
    if (this.targetElements) {
      for (const element of this.targetElements) {
        element.style.setProperty('background-color', this.backgroundColor);
      }
    }
  }
}
