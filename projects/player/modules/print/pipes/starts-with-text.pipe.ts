import { Pipe, PipeTransform } from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { ComponentRegistry } from 'common/utils/component-registry';

@Pipe({
  name: 'startsWithText',
  standalone: false
})
export class StartsWithTextPipe implements PipeTransform {
  /**
   * Whether an element begins with a line of text, at its top edge -- as the component that draws it says
   * (`ElementComponent.startsWithText`, which also explains what counts as yes).
   *
   * A section numbered on the left aligns its number with the first baseline of its content (#1618). The
   * browser finds that baseline in the first grid item -- and an item without a line of text gets one made
   * up at its bottom edge, which put the number next to the bottom of a picture (#1021). Where this pipe
   * says no, the element gets an invisible first line in the number's font, `.starts-without-text` in the
   * player's styles.scss, and the number stands at its top edge.
   */
  transform(element: UIElement): boolean {
    return ComponentRegistry.getComponent(element.type).startsWithText(element);
  }
}
