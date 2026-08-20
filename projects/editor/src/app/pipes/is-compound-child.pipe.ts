import { Pipe, PipeTransform } from '@angular/core';
import { UIElement } from 'common/models/elements/element';

/**
 * Whether an element sits inside a compound element instead of in a section of its own.
 *
 * The set comes from where the rows are built; the pipe only looks the element up. It is a pipe and
 * not a flag on the row, because the rows of the overview dialog are the elements themselves - a
 * flag written onto them would be an own property of the model and travel into the stored unit
 * definition (#1267).
 */
@Pipe({
  name: 'isCompoundChild',
  standalone: false
})
export class IsCompoundChildPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(element: UIElement, compoundChildren: ReadonlySet<UIElement>): boolean {
    return compoundChildren.has(element);
  }
}
