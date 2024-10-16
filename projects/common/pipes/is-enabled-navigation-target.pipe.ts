import { Pipe, PipeTransform } from '@angular/core';
import { ButtonElement } from 'common/models/elements/button/button';
import { NavigationTarget } from 'player/modules/verona/models/verona';

@Pipe({
  standalone: true,
  name: 'isEnabledNavigationTarget'
})
export class IsEnabledNavigationTargetPipe implements PipeTransform {
  transform(elementModel: ButtonElement, enabledNavigationTargets: NavigationTarget[] | undefined): boolean {
    if (!enabledNavigationTargets) {
      return true;
    }
    if (elementModel.action === 'unitNav') {
      return enabledNavigationTargets
        .includes(elementModel.actionParam as NavigationTarget);
    }
    return true;
  }
}
