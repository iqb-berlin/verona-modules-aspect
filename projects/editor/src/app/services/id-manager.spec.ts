import { IDService } from 'editor/src/app/services/id.service';
import { TestBed } from '@angular/core/testing';

describe('IDService', () => {
  let idService: IDService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    idService = TestBed.inject(IDService);
    idService.reset();
  });

  it('getNewID should fail on empty string param', () => {
    expect(() => { idService.getNewID(''); }).toThrow(Error('ID-Service: No type given!'));
  });

  it('getNewID should return first ID', () => {
    expect(idService.getNewID('text')).toBe('text_1');
  });

  it('getNewID should return different IDs - counting up', () => {
    idService.getNewID('text');
    expect(idService.getNewID('text')).toBe('text_2');
  });

  it('idService should return next id when one is already taken', () => {
    idService.addID('text_1');
    expect(idService.getNewID('text')).toBe('text_2');
  });

  it('isIdAvailable should return false when id is already taken', () => {
    expect(idService.isIdAvailable('text_1')).toBe(true);
    idService.addID('text_1');
    expect(idService.isIdAvailable('text_1')).toBe(false);
    expect(idService.isIdAvailable('text_2')).toBe(true);
  });

  it('isIdAvailable should return true when ID is returned (freed up)', () => {
    expect(idService.isIdAvailable('text_1')).toBe(true);
    idService.addID('text_1');
    expect(idService.isIdAvailable('text_1')).toBe(false);
    idService.removeId('text_1');
    expect(idService.isIdAvailable('text_1')).toBe(true);
  });
});
