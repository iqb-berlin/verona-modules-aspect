import { Pipe, PipeTransform } from '@angular/core';
import { StateVariable } from 'common/models/state-variable';

@Pipe({
  name: 'getStateVariable',
  standalone: false
})
export class GetStateVariablePipe implements PipeTransform {
  transform(actionParam: unknown, stateVariables: StateVariable[]): StateVariable {
    if (actionParam && typeof actionParam === 'object') return actionParam as StateVariable;
    return new StateVariable(stateVariables[0].id, stateVariables[0].alias, '');
  }
}
