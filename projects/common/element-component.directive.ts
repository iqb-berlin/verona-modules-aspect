import {
  AfterViewInit,
  Directive, ElementRef
} from '@angular/core';
import { UIElement } from './models/uI-element';

@Directive()
export abstract class ElementComponent implements AfterViewInit {
  abstract elementModel: UIElement;
  project!: 'player' | 'editor';

  constructor(private elementRef: ElementRef) {}

  get domElement(): Element {
    return this.elementRef.nativeElement;
  }

  ngAfterViewInit(): void {
    this.project = this.elementRef.nativeElement.closest('app-element-container') ? 'player' : 'editor';
  }
}
