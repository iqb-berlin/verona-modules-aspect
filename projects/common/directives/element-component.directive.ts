import {
  AfterContentChecked,
  Directive, ElementRef
} from '@angular/core';
import { UIElement } from '../interfaces/elements';

@Directive()
export abstract class ElementComponent implements AfterContentChecked {
  abstract elementModel: UIElement;
  project!: 'player' | 'editor';

  constructor(private elementRef: ElementRef) {}

  get domElement(): Element {
    return this.elementRef.nativeElement;
  }

  ngAfterContentChecked(): void {
    this.project = this.elementRef.nativeElement.closest('aspect-element-container') ? 'player' : 'editor';
  }
}
