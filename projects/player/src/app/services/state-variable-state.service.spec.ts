import { TestBed } from '@angular/core/testing';

import { StateVariableStateService } from './state-variable-state.service';

describe('StateVariableStateService', () => {
  let service: StateVariableStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StateVariableStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
