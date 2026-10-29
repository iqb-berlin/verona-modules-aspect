import { UnitNavParam } from 'common/models/elements/button';
import { NavigationTarget } from 'player/modules/verona/models/verona';
import { StateVariable } from 'common/models/state-variable';

/**
 * Whether the player may offer a button's action. Templates ask it through
 * `IsEnabledNavigationTargetPipe`, the children of a cloze -- which are created in code -- ask it
 * directly in `CompoundGroupElementComponent`, so both follow one rule.
 */
export class NavigationTargetRule {
  /**
   * Only unit navigation can be forbidden, and only by the host: while it has said nothing --
   * `enabledNavigationTargets` still `undefined` -- everything is allowed, so a player running without a
   * host keeps all its buttons.
   */
  static isEnabled(action: string | null,
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
