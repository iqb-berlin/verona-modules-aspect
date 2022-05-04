import { TestBed } from '@angular/core/testing';
import { UnitStateService } from './unit-state.service';
import { ElementCode } from 'verona/models/verona';

describe('UnitStateService', () => {
  let service: UnitStateService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnitStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get element by id', () => {
    const element1: ElementCode =  { id: 'element_1', status: 'DISPLAYED', value: 'TEST1' };
    const element2: ElementCode =  { id: 'element_2', status: 'DISPLAYED', value: 'TEST2' };
    service.elementCodes = [ element1, element2 ];
    expect(service.getElementCodeById('element_1')).toEqual(element1);
  });

  it('should return undefined for a not registered element id', () => {
    const element1: ElementCode =  { id: 'element_1', status: 'DISPLAYED', value: 'TEST1' };
    const element2: ElementCode =  { id: 'element_2', status: 'DISPLAYED', value: 'TEST2' };
    service.elementCodes = [ element1, element2 ];
    expect(service.getElementCodeById('element_3')).toBeUndefined();
  });

  it('should verify that element is registered ', () => {
    const element1: ElementCode =  { id: 'element_1', status: 'DISPLAYED', value: 'TEST1' };
    const element2: ElementCode =  { id: 'element_2', status: 'DISPLAYED', value: 'TEST2' };
    service.elementCodes = [ element1, element2 ];
    expect(service.isRegistered('element_1')).toBeTruthy();
  });

  it('should verify that element is registered ', () => {
    const element1: ElementCode =  { id: 'element_1', status: 'DISPLAYED', value: 'TEST1' };
    const element2: ElementCode =  { id: 'element_2', status: 'DISPLAYED', value: 'TEST2' };
    service.elementCodes = [ element1, element2 ];
    expect(service.isRegistered('element_3')).toBeFalse();
  });

  it('should register an element', () => {
    service.elementCodes = [];
    const element = document.createElement('div');
    service.registerElement('element', 'TEST', element, 1);
    expect(service.elementCodes).toEqual([ { id: 'element', status: 'NOT_REACHED', value: 'TEST' } ]);
  });

  it('elementCode of an element should change', done => {
    service.elementCodes = [{ id: 'element_1', status: 'NOT_REACHED', value: 'TEST1' }];
    service.elementCodeChanged
      .subscribe( code => {
        expect(code.status).toEqual('DISPLAYED');
        done();
      });
    service.changeElementCodeStatus({ id: 'element_1', status: 'DISPLAYED' });
  });

  it('elementCode of an element should change', done => {
    service.elementCodes = [{ id: 'element_1', status: 'NOT_REACHED', value: 'TEST1' }];
    service.elementCodeChanged
      .subscribe( code =>  {
        expect(code.status).toEqual('VALUE_CHANGED');
        expect(code.value).toEqual('NEU');
        done();
      }) ;
    service.changeElementCodeValue({ id: 'element_1', value: 'NEU' });
  });

  it('presentedPagesProgress should be complete', () => {
    service.elementCodes = [];
    expect(service.presentedPagesProgress).toEqual('complete');
  });

  it('presentedPagesProgress should be none', () => {
    service.elementCodes = [];
    const element = document.createElement('div');
    service.registerElement('element', 'TEST', element, 1);
    expect(service.presentedPagesProgress).toEqual('none');
  });

  it('presentedPagesProgress should be complete', () => {
    service.elementCodes = [];
    const element = document.createElement('div');
    service.registerElement('element', 'TEST', element, 1);
    service.changeElementCodeStatus({ id: 'element', status: 'DISPLAYED' });
    expect(service.presentedPagesProgress).toEqual('complete');
  });

  it('presentedPagesProgress should be none', () => {
    service.elementCodes = [];
    const element = document.createElement('div');
    service.registerElement('element_1', 'TEST1', element, 1);
    service.registerElement('element_2', 'TEST2', element, 1);
    service.changeElementCodeStatus({ id: 'element_1', status: 'DISPLAYED' });
    expect(service.presentedPagesProgress).toEqual('none');
  });

  it('presentedPagesProgress should be some', () => {
    service.elementCodes = [];
    const element = document.createElement('div');
    service.registerElement('element_1', 'TEST1', element, 1);
    service.registerElement('element_2', 'TEST2', element, 2);
    service.changeElementCodeStatus({ id: 'element_1', status: 'DISPLAYED' });
    expect(service.presentedPagesProgress).toEqual('some');
  });

  it('presentedPagesProgress should be complete', () => {
    service.elementCodes = [];
    const element = document.createElement('div');
    service.registerElement('element_1', 'TEST1', element, 1);
    service.registerElement('element_2', 'TEST2', element, 2);
    service.changeElementCodeStatus({ id: 'element_1', status: 'DISPLAYED' });
    service.changeElementCodeStatus({ id: 'element_2', status: 'DISPLAYED' });
    expect(service.presentedPagesProgress).toEqual('complete');
  });

  it('presented page with index 1 should be added', done => {
    service.elementCodes = [];
    const element = document.createElement('div');
    service.registerElement('element_1', 'TEST1', element, 1);
    service.presentedPageAdded
      .subscribe( index => {
        expect(index).toEqual(1);
        done();
      });
    service.changeElementCodeStatus({ id: 'element_1', status: 'DISPLAYED' });
  });

  it('presented page with index 1 should be added', done => {
    service.elementCodes = [];
    const element = document.createElement('div');
    service.registerElement('element_1', 'TEST1', element, 1);
    service.presentedPageAdded
      .subscribe( index => {
        expect(index).toEqual(1);
        done();
      });
    service.changeElementCodeValue({ id: 'element_1', value: 'NEU' });
  });

});
