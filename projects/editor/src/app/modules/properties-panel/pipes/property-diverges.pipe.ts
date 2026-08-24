import { Pipe, PipeTransform } from '@angular/core';

/**
 * Whether the selected elements disagree on the property at `path` - the condition for showing an
 * {@link MergedMarkerComponent} next to a field whose value is nullable in the model.
 *
 * Fields declared `number` do not need this: there the merged `null` can only have come from the
 * merge, and the template tests it directly. It is the nullable ones - a maximum width, a slider
 * preset - where `null` is also a legitimate value and the marker would otherwise appear for a
 * selection that simply has no limit set (#1167).
 *
 * Pure for the same reason as {@link LimitEnabledStatePipe}: the set is rebuilt per merge.
 */
@Pipe({
  name: 'propertyDiverges',
  standalone: false
})
export class PropertyDivergesPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(divergingProperties: ReadonlySet<string> | undefined, path: string): boolean {
    return divergingProperties?.has(path) ?? false;
  }
}
