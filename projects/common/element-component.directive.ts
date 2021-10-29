import {
  Directive, ElementRef
} from '@angular/core';
import { UIElement } from './models/uI-element';

@Directive()
export abstract class ElementComponent {
  abstract elementModel: UIElement;

  constructor(private elementRef: ElementRef) {}

  get domElement(): Element {
    return this.elementRef.nativeElement;
  }
}
