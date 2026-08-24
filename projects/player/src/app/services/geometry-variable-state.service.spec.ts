import { TestBed } from '@angular/core/testing';
import { Response } from '@iqb/responses';
import { GeometryVariableStateService } from './geometry-variable-state.service';

describe('GeometryVariableStateService', () => {
  let service: GeometryVariableStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeometryVariableStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register an element code with NOT_REACHED as default status', () => {
    service.registerElementCode('geometry_1_area', 'area', null);

    expect(service.getElementCodeById('geometry_1_area')).toEqual({
      id: 'geometry_1_area', alias: 'area', value: null, status: 'NOT_REACHED'
    });
  });

  it('should register an element code with the given status', () => {
    service.registerElementCode('geometry_1_area', 'area', 12, 'VALUE_CHANGED');

    expect(service.getElementCodeById('geometry_1_area')?.status).toBe('VALUE_CHANGED');
  });

  it('should not register an already registered element code again', () => {
    service.registerElementCode('geometry_1_area', 'area', 12);
    service.registerElementCode('geometry_1_area', 'area', 47);

    expect(service.elementCodes.length).toBe(1);
    expect(service.getElementCodeById('geometry_1_area')?.value).toBe(12);
  });

  it('should announce every newly registered element code', () => {
    const changedElementCodes: Response[] = [];
    service.elementCodeChanged.subscribe(elementCode => changedElementCodes.push(elementCode));

    service.registerElementCode('geometry_1_area', 'area', 12);

    expect(changedElementCodes.length).toBe(1);
    expect(changedElementCodes[0].id).toBe('geometry_1_area');
  });

  it('should change value and status of a registered element code', () => {
    service.registerElementCode('geometry_1_area', 'area', 12);

    service.changeElementCodeValue({ id: 'geometry_1_area', value: 47 });

    expect(service.getElementCodeById('geometry_1_area')).toEqual({
      id: 'geometry_1_area', alias: 'area', value: 47, status: 'VALUE_CHANGED'
    });
  });

  it('should ignore a value change that does not change the value', () => {
    service.registerElementCode('geometry_1_area', 'area', 12);
    const changedElementCodes: Response[] = [];
    service.elementCodeChanged.subscribe(elementCode => changedElementCodes.push(elementCode));

    service.changeElementCodeValue({ id: 'geometry_1_area', value: 12 });

    expect(changedElementCodes.length).toBe(0);
    expect(service.getElementCodeById('geometry_1_area')?.status).toBe('NOT_REACHED');
  });
});
