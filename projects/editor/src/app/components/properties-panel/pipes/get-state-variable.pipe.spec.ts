import { StateVariable } from 'common/models/state-variable';
import { GetStateVariablePipe } from 'editor/src/app/pipes/get-state-variable.pipe';

describe('GetStateVariablePipe', () => {
  const pipe = new GetStateVariablePipe();
  let stateVariables: StateVariable[];

  beforeEach(() => {
    stateVariables = [
      new StateVariable('sv_1', 'SV-1', 'value-1'),
      new StateVariable('sv_2', 'SV-2', 'value-2')
    ];
  });

  it('should return the given action param when it is a state variable object', () => {
    const actionParam = new StateVariable('sv_2', 'SV-2', 'custom');
    expect(pipe.transform(actionParam, stateVariables)).toBe(actionParam);
  });

  it('should fall back to the first state variable with an empty value for non-object params', () => {
    const result = pipe.transform('sv_2', stateVariables);
    expect(result.id).toBe('sv_1');
    expect(result.alias).toBe('SV-1');
    expect(result.value).toBe('');
  });

  it('should fall back to the first state variable when the param is null', () => {
    const result = pipe.transform(null, stateVariables);
    expect(result.id).toBe('sv_1');
    expect(result.value).toBe('');
  });
});
