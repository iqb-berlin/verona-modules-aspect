import { TestBed } from '@angular/core/testing';
import { IDService } from 'common/services/i-d.service';

describe('IDService', () => {
  let service: IDService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [IDService] });
    service = TestBed.inject(IDService);
  });

  it('getNewID should fail on empty string param', () => {
    expect(() => { service.getNewID(''); }).toThrow(Error('ID-Service: No type given!'));
  });

  it('getNewID should return first ID', () => {
    expect(service.getNewID('text')).toBe('text_1');
  });

  it('getNewID should return different IDs - counting up', () => {
    service.getNewID('text');
    expect(service.getNewID('text')).toBe('text_2');
  });

  it('service should return next id when one is already taken', () => {
    service.addID('text_1');
    expect(service.getNewID('text')).toBe('text_2');
  });

  it('isIdAvailable should return false when id is already taken', () => {
    expect(service.isIdAvailable('text_1')).toBe(true);
    service.addID('text_1');
    expect(service.isIdAvailable('text_1')).toBe(false);
    expect(service.isIdAvailable('text_2')).toBe(true);
  });

  it('isIdAvailable should return true when ID is returned (freed up)', () => {
    expect(service.isIdAvailable('text_1')).toBe(true);
    service.addID('text_1');
    expect(service.isIdAvailable('text_1')).toBe(false);
    service.removeId('text_1');
    expect(service.isIdAvailable('text_1')).toBe(true);
  });
});
