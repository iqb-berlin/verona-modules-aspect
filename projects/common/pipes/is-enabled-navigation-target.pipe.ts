import { Pipe, PipeTransform } from '@angular/core';
import { UnitNavParam } from 'common/models/elements/button';
import { NavigationTarget } from 'player/modules/verona/models/verona';
import { StateVariable } from 'common/models/state-variable';

@Pipe({
  standalone: false,
  name: 'isEnabledNavigationTarget'
})
export class IsEnabledNavigationTargetPipe implements PipeTransform {
  /**
   * Whether a button's action may be offered. Only unit navigation can be forbidden, and only by the
   * host: while it has said nothing -- `enabledNavigationTargets` still `undefined` -- everything is
   * allowed, so a player running without a host keeps all its buttons.
   */
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
