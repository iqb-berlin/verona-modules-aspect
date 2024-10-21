import { Pipe, PipeTransform } from '@angular/core';
import { UnitNavParam } from 'common/models/elements/button/button';
import { NavigationTarget } from 'player/modules/verona/models/verona';
import { StateVariable } from 'common/models/state-variable';

@Pipe({
  standalone: true,
  name: 'isEnabledNavigationTarget'
})
export class IsEnabledNavigationTargetPipe implements PipeTransform {
  transform(action: string | null,
            param: UnitNavParam | number | string | StateVariable | null,
            enabledNavigationTargets: NavigationTarget[] | undefined): boolean {
    if (!enabledNavigationTargets) {
      return true;
    }
    if (action === 'unitNav') {
      return enabledNavigationTargets
        .includes(param as NavigationTarget);
    }
    return true;
  }
}
