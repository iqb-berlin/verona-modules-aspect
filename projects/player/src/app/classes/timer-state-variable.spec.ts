import { TimerStateVariable } from './timer-state-variable';

describe('State', () => {
  it('should create an instance', () => {
    expect(new TimerStateVariable('test', 0, 3000)).toBeTruthy();
  });
});
