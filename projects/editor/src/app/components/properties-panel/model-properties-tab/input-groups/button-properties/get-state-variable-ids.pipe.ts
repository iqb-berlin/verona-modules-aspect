import { Pipe, PipeTransform } from '@angular/core';
import { StateVariable } from 'common/models/state-variable';

@Pipe({
  name: 'getStateVariableIds'
})
export class GetStateVariableIdsPipe implements PipeTransform {
  transform(stateVariables: StateVariable[]): string[] {
    return stateVariables.map(stateVariable => stateVariable.id);
  }
}
