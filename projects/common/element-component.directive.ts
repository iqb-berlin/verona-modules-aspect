import {
  AfterContentChecked,
  Directive, ElementRef
} from '@angular/core';
import { UIElement } from './models/uI-element';

@Directive()
export abstract class ElementComponent implements AfterContentChecked {
  abstract elementModel: UIElement;
  project!: 'player' | 'editor'; // TODO x2

  constructor(private elementRef: ElementRef) {}

  get domElement(): Element {
    return this.elementRef.nativeElement;
  }

  ngAfterContentChecked(): void {
    this.project = this.elementRef.nativeElement.closest('app-element-container') ? 'player' : 'editor';
  }
}
