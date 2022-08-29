import { IDManager } from 'common/util/id-manager';

describe('IDService', () => {
  let manager: IDManager;

  beforeEach(() => {
    manager = IDManager.getInstance();
    manager.reset();
  });

  it('getNewID should fail on empty string param', () => {
    expect(() => { manager.getNewID(''); }).toThrow(Error('ID-Service: No type given!'));
  });

  it('getNewID should return first ID', () => {
    expect(manager.getNewID('text')).toBe('text_1');
  });

  it('getNewID should return different IDs - counting up', () => {
    manager.getNewID('text');
    expect(manager.getNewID('text')).toBe('text_2');
  });

  it('manager should return next id when one is already taken', () => {
    manager.addID('text_1');
    expect(manager.getNewID('text')).toBe('text_2');
  });

  it('isIdAvailable should return false when id is already taken', () => {
    expect(manager.isIdAvailable('text_1')).toBe(true);
    manager.addID('text_1');
    expect(manager.isIdAvailable('text_1')).toBe(false);
    expect(manager.isIdAvailable('text_2')).toBe(true);
  });

  it('isIdAvailable should return true when ID is returned (freed up)', () => {
    expect(manager.isIdAvailable('text_1')).toBe(true);
    manager.addID('text_1');
    expect(manager.isIdAvailable('text_1')).toBe(false);
    manager.removeId('text_1');
    expect(manager.isIdAvailable('text_1')).toBe(true);
  });
});
