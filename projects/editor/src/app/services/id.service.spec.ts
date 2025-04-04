import { IdRegistry } from 'editor/src/app/services/id-registry';

describe('IDService', () => {
  const idRegistry: IdRegistry = new IdRegistry();

  beforeEach(() => {
    idRegistry.reset();
  });

  it('getAndRegisterNewID should return first ID', () => {
    expect(idRegistry.getAndRegisterNewID('text')).toBe('text_1');
  });

  it('getAndRegisterNewID should return different IDs - counting up', () => {
    idRegistry.getAndRegisterNewID('text');
    expect(idRegistry.getAndRegisterNewID('text')).toBe('text_2');
  });

  it('idService should return next id when one is already taken', () => {
    idRegistry.registerID('text_1');
    expect(idRegistry.getAndRegisterNewID('text')).toBe('text_2');
  });

  it('isIdAvailable should return false when id is already taken', () => {
    expect(idRegistry.isIdAvailable('text_1')).toBe(true);
    idRegistry.registerID('text_1');
    expect(idRegistry.isIdAvailable('text_1')).toBe(false);
    expect(idRegistry.isIdAvailable('text_2')).toBe(true);
    expect(idRegistry.isIdAvailable('text_1')).toBe(false);
  });

  it('isIdAvailable should return true when ID is returned (freed up)', () => {
    expect(idRegistry.isIdAvailable('text_1')).toBe(true);
    idRegistry.registerID('text_1');
    expect(idRegistry.isIdAvailable('text_1')).toBe(false);
    idRegistry.unregisterID('text_1');
    expect(idRegistry.isIdAvailable('text_1')).toBe(true);
  });
});
