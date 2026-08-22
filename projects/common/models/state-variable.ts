import { VariableInfo } from '@iqb/responses';

/**
 * What a state variable is in a stored unit: three strings. The class adds `getVariableInfo` to them,
 * which is why `UnitProperties` names this and not the class -- what comes out of the normalizer is
 * plain data, and a properties interface that demands a class forces a cast at the one seam #1198 is
 * about.
 */
export interface StateVariableProperties {
  id: string;
  alias: string;
  value: string;
}

export class StateVariable implements StateVariableProperties {
  id: string;
  alias: string;
  value: string;

  constructor(id: string, alias: string, value: string) {
    this.id = id;
    this.alias = alias;
    this.value = value;
  }

  getVariableInfo(): VariableInfo {
    return {
      id: this.id,
      alias: this.alias,
      type: 'no-value',
      format: '',
      multiple: false,
      nullable: false,
      values: [],
      valuePositionLabels: [],
      page: '',
      valuesComplete: false
    };
  }
}
