import { Pipe, PipeTransform } from '@angular/core';
import { UnitNavParam } from 'common/models/elements/button';
import { NavigationTarget } from 'player/modules/verona/models/verona';
import { StateVariable } from 'common/models/state-variable';
import { NavigationTargetRule } from 'common/utils/navigation-target-rule';

@Pipe({
  standalone: false,
  name: 'isEnabledNavigationTarget'
})
export class IsEnabledNavigationTargetPipe implements PipeTransform {
  /** Whether a button's action may be offered -- the rule is `NavigationTargetRule.isEnabled`. */
  transform(action: string | null,
            param: UnitNavParam | number | string | StateVariable | null,
            enabledNavigationTargets: NavigationTarget[] | undefined): boolean {
    return NavigationTargetRule.isEnabled(action, param, enabledNavigationTargets);
  }
}
