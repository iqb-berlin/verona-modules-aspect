import { Pipe, PipeTransform } from '@angular/core';
import { GeometryVariable } from 'common/models/geometry-interfaces';

/** One entry of the list of trackable GeoGebra objects. */
export interface GeometryVariableOption {
  variable: GeometryVariable;
  /** Tracked, but the loaded file has no object of that name -- left over from a file that was replaced. */
  isMissing: boolean;
}

/**
 * The objects of the loaded GeoGebra file, followed by the tracked variables the file no longer has. Those would
 * otherwise not be in the list at all, so the author could not even take them out: replacing the file -- the only
 * way to correct a GeoGebra name that breaks the Verona contract -- left the old name tracked and out of reach
 * (#1505). Nothing is removed by itself, as nothing is changed by itself elsewhere in #1129.
 */
@Pipe({
  name: 'geometryVariableOptions',
  standalone: false
})
export class GeometryVariableOptionsPipe implements PipeTransform {
  /** `objects` is `null` until the applet has loaded; until then nothing can be told missing. */
  // eslint-disable-next-line class-methods-use-this
  transform(objects: GeometryVariable[] | null,
            trackedVariables: GeometryVariable[] | null | undefined): GeometryVariableOption[] {
    if (!objects) return [];
    const names = new Set(objects.map(object => object.id));
    const missing = new Map((trackedVariables ?? [])
      .filter(variable => !names.has(variable.id))
      .map(variable => [variable.id, variable])); // a stored list may hold a name twice; the list shows it once
    return [
      ...objects.map(variable => ({ variable, isMissing: false })),
      ...[...missing.values()].map(variable => ({ variable, isMissing: true }))
    ];
  }
}
