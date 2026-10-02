import { Pipe, PipeTransform } from '@angular/core';
import { VariableInfoFinding } from 'editor/src/app/models/variable-info-finding';
import { VariableInfoIssueCode } from 'editor/src/app/utils/variable-info-validator';

/**
 * Why the alias an element holds breaks the Verona contract, for its field in the properties panel. The field checks
 * only what is typed, so a name stored that way -- in a unit saved before #1043 -- stood there unremarked while the
 * validation area listed it (#1129). Variables an element reports under a GeoGebra name are left out: that name is
 * changed in GeoGebra, not in this field.
 */
@Pipe({
  name: 'aliasIssues',
  standalone: false
})
export class AliasIssuesPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(findings: VariableInfoFinding[] | null, elementID: string | undefined): VariableInfoIssueCode[] {
    const codes = (findings ?? [])
      .filter(finding => finding.origin.location?.element.id === elementID && finding.origin.subValue === undefined)
      .flatMap(finding => finding.issues.filter(issue => issue.part === 'alias').map(issue => issue.code));
    return [...new Set(codes)];
  }
}
