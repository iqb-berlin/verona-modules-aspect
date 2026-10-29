import { Pipe, PipeTransform } from '@angular/core';
import { GeometryVariable } from 'common/models/geometry-interfaces';
import { GeometryVariableNameIssue, GeometryVariableNames } from 'editor/src/app/utils/geometry-variable-names';

/** What is wrong with a GeoGebra object name as a variable, and whether choosing it is to be prevented. */
export interface GeometryVariableCheck {
  issue: GeometryVariableNameIssue | null;
  /** Set for a name with an issue that is not chosen yet. A chosen one stays selectable, or it could not be removed. */
  isLocked: boolean;
}

/** Checks a GeoGebra object name in the list of the properties panel against the names chosen so far (#1129). */
@Pipe({
  name: 'geometryVariableCheck',
  standalone: false
})
export class GeometryVariableCheckPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(name: string,
            trackedVariables: GeometryVariable[] | null | undefined,
            trackedExpectedVariables: GeometryVariable[] | null | undefined): GeometryVariableCheck {
    const chosen = [...(trackedVariables ?? []), ...(trackedExpectedVariables ?? [])];
    const issue = GeometryVariableNames.findIssue(name, chosen);
    return { issue, isLocked: issue !== null && !chosen.some(variable => variable.id === name) };
  }
}
