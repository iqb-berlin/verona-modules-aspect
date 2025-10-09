import {
  Directive, ElementRef, Input, OnChanges, SimpleChanges
} from '@angular/core';

@Directive({
    selector: '[aspectInputBackgroundColor]',
    standalone: false
})
export class InputBackgroundColorDirective implements OnChanges {
  @Input() backgroundColor!: string;
  @Input() appearance!: string;

  constructor(private elementRef: ElementRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.appearance && !changes.appearance.firstChange) {
      this.clearFilledBackgroundColor();
    }
    setTimeout(() => { // wait for Angular to set up the component before manipulating it
      this.setBackgroundColor();
    });
  }

  private setBackgroundColor(): void {
    let targetElements: HTMLElement[];
    if (this.appearance === 'outline') {
      targetElements = [this.elementRef.nativeElement.querySelector('div.mdc-notched-outline')];
    } else {
      targetElements = [this.elementRef.nativeElement.querySelector('div.mat-mdc-text-field-wrapper')];
    }
    // This fails, when component is not set up yet, therefore the extra check
    if (targetElements) {
      Array.from(targetElements).forEach((element: HTMLElement) => {
        element.style.setProperty('background-color', this.backgroundColor);
        element.style.setProperty('z-index', '-1'); // color covers the text otherwise
      });
    }
  }

  /* Clear styling of old appearance before switching */
  private clearFilledBackgroundColor(): void {
    const targetElement: HTMLElement = this.elementRef.nativeElement.querySelector('div.mat-form-field-flex');
    targetElement?.style.removeProperty('background-color');
  }
}
