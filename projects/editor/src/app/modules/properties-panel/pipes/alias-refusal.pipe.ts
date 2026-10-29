import { Pipe, PipeTransform } from '@angular/core';
import { VariableAlias } from 'common/utils/variable-alias';
import { IDService } from 'editor/src/app/services/id.service';

/**
 * Why the name typed into an element's ID field was refused, as the translation key of the reason, for the field to
 * show it until the name is corrected (#1523). The field writes on every keystroke and the model refuses what it
 * cannot take, so a typed name that differs from the stored one is one the model refused; anything else is `null`.
 */
@Pipe({
  name: 'aliasRefusal',
  standalone: false
})
export class AliasRefusalPipe implements PipeTransform {
  constructor(private idService: IDService) { }

  /** `storedAlias` is null for a selection of several elements, which has no ID field to type into. */
  transform(typedAlias: string | null, storedAlias: string | null | undefined): string | null {
    if (typedAlias === null || storedAlias === null || storedAlias === undefined || typedAlias === storedAlias) {
      return null;
    }
    const problem = VariableAlias.problemOf(typedAlias, this.idService.isAliasAvailable(typedAlias, storedAlias));
    return problem ? VariableAlias.PROBLEM_KEYS[problem] : null;
  }
}
