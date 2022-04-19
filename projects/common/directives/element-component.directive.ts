import {
  AfterContentChecked,
  Directive, ElementRef
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UIElement } from '../interfaces/elements';

@Directive()
export abstract class ElementComponent implements AfterContentChecked {
  abstract elementModel: UIElement;
  project!: 'player' | 'editor';

  constructor(public elementRef: ElementRef, public sanitizer: DomSanitizer) {}

  get domElement(): Element {
    return this.elementRef.nativeElement;
  }

  ngAfterContentChecked(): void {
    this.project = this.elementRef.nativeElement.closest('aspect-element-group-selection') ? 'player' : 'editor';
  }
}
