import {
  AfterContentChecked,
  Directive, ElementRef
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';

import { AspectError } from 'common/errors';

@Directive()
export abstract class ElementComponent implements AfterContentChecked {
  abstract elementModel: UIElement;
  project!: 'player' | 'editor';

  constructor(public elementRef: ElementRef) {}

  get domElement(): Element {
    return this.elementRef.nativeElement;
  }

  ngAfterContentChecked(): void {
    this.project = this.elementRef.nativeElement.closest('aspect-unit') ? 'player' : 'editor';
  }

  // eslint-disable-next-line class-methods-use-this
  throwError(code: string, message: string) {
    throw new AspectError(code, message);
  }
}
