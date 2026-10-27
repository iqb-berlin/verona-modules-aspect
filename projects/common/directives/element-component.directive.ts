import {
  AfterContentChecked,
  Directive, ElementRef
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';

import { AspectError } from 'common/classes/aspect-error';

@Directive()
export abstract class ElementComponent implements AfterContentChecked {
  abstract elementModel: UIElement;
  project!: 'player' | 'editor';

  /**
   * Whether an element drawn by this component begins with a line of text at its top edge.
   *
   * The player aligns the number of a section numbered on the left with the first baseline of its content
   * (#1618). Where this says no, the element gets an invisible first line in the number's font
   * (`.starts-without-text` in the player's styles.scss), and the number stands at its top edge. Otherwise
   * the browser takes the element's own first baseline -- for a picture the bottom edge (#1021).
   *
   * No is the default, and a component says yes only where it was measured: with the number aligned at the
   * baseline, it lands within a pixel of the element's first line of text and did not before. A wrong no
   * costs nothing, the number stays at the top edge; a wrong yes moves it to whatever stands at the top.
   * So whoever changes what a component draws first checks its answer here, and a new component keeps no.
   * Text area, dropdown and checkbox failed that measurement: their baseline lies below the label, at the
   * end of the field, or in the middle of the row.
   *
   * Asked of the class, not of an instance: the frame around an element, which carries the invisible line,
   * has its model and type, while the component is created inside it.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static startsWithText(element: UIElement): boolean {
    return false;
  }

  constructor(public elementRef: ElementRef) {}

  get domElement(): Element {
    return this.elementRef.nativeElement;
  }

  ngAfterContentChecked(): void {
    this.project = this.elementRef.nativeElement.closest('aspect-unit') ? 'player' : 'editor';
  }

  throwError(code: string, message: string) {
    throw new AspectError(code, message, this.elementModel.id);
  }
}
