import { Pipe, PipeTransform } from '@angular/core';

/**
 * Whether a property group holds anything at all.
 *
 * The styling tab used to be gated on the group merely existing, and an empty object is truthy — so
 * an element that declares no styling got a tab with nothing in it. Six elements do declare none
 * (#1226), and the same would happen to any future one, so the gate asks the question it means.
 *
 * Pure: the merged group object is rebuilt whenever the selection changes.
 */
@Pipe({
  name: 'hasAnyProperty',
  standalone: false
})
export class HasAnyPropertyPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(group: object | undefined | null): boolean {
    return !!group && Object.keys(group).length > 0;
  }
}
