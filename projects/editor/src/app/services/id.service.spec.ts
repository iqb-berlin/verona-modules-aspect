import { IDService } from 'editor/src/app/services/id.service';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';

describe('IDService', () => {
  let idService: IDService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule,
        TranslateModule.forRoot()]
    });
    idService = TestBed.inject(IDService);
    idService.reset();
  });

  it('getAndRegisterNewID should fail on empty string param', () => {
    expect(() => { idService.getAndRegisterNewID(''); }).toThrow(Error('ID-Service: No type given!'));
  });

  it('getAndRegisterNewID should return first ID', () => {
    expect(idService.getAndRegisterNewID('text')).toBe('text_1');
  });

  it('getAndRegisterNewID should return different IDs - counting up', () => {
    idService.getAndRegisterNewID('text');
    expect(idService.getAndRegisterNewID('text')).toBe('text_2');
  });

  it('idService should return next id when one is already taken', () => {
    idService.addID('text_1');
    expect(idService.getAndRegisterNewID('text')).toBe('text_2');
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
    idService.unregisterID('text_1');
    expect(idService.isIdAvailable('text_1')).toBe(true);
  });
});
