import { TestBed } from '@angular/core/testing';
import { Response } from '@iqb/responses';
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

  it('should register an element code as unset', () => {
    service.registerElementCode('section-0-1', 'section-0-1', 0);

    expect(service.getElementCodeById('section-0-1')).toEqual({
      id: 'section-0-1', alias: 'section-0-1', value: 0, status: 'UNSET'
    });
  });

  it('should not register an already registered element code again', () => {
    service.registerElementCode('section-0-1', 'section-0-1', 0);
    service.registerElementCode('section-0-1', 'section-0-1', 1);

    expect(service.elementCodes.length).toBe(1);
    expect(service.getElementCodeById('section-0-1')?.value).toBe(0);
  });

  it('should announce every newly registered element code', () => {
    const changedElementCodes: Response[] = [];
    service.elementCodeChanged.subscribe(elementCode => changedElementCodes.push(elementCode));

    service.registerElementCode('section-0-1', 'section-0-1', 0);

    expect(changedElementCodes.length).toBe(1);
  });

  it('should change value and status of a registered element code', () => {
    service.registerElementCode('section-0-1', 'section-0-1', 0);

    service.changeElementCodeValue({ id: 'section-0-1', value: 1 });

    expect(service.getElementCodeById('section-0-1')).toEqual({
      id: 'section-0-1', alias: 'section-0-1', value: 1, status: 'VALUE_CHANGED'
    });
  });

  it('should report the registered codes as responses under their alias', () => {
    service.registerElementCode('section-0-1', 'section-0-1', 0);

    expect(service.getResponses()).toEqual([{ id: 'section-0-1', value: 0, status: 'UNSET' }]);
  });

  it('should forget all element codes on reset', () => {
    service.registerElementCode('section-0-1', 'section-0-1', 0);

    service.reset();

    expect(service.elementCodes).toEqual([]);
    expect(service.isElementCodeRegistered('section-0-1')).toBe(false);
  });
});
