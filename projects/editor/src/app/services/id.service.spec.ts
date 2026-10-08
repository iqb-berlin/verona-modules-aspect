import { IdRegistry } from 'editor/src/app/classes/id-registry';
import { IDService } from 'editor/src/app/services/id.service';

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

  /* The Verona contract keeps identifiers apart regardless of letter case (#1129). */
  it('isIdAvailable should refuse a name that differs from a registered one only in letter case', () => {
    idRegistry.registerID('Wert');
    expect(idRegistry.isIdAvailable('wert')).toBe(false);
    expect(idRegistry.isIdAvailable('WERT')).toBe(false);
    expect(idRegistry.isIdAvailable('Werte')).toBe(true);
  });

  it('isIdAvailable should leave out the name the asker holds itself', () => {
    idRegistry.registerID('Wert');
    expect(idRegistry.isIdAvailable('wert', 'Wert')).toBe(true);
  });

  it('isIdAvailable should still see another holder when the asker leaves out its own name', () => {
    idRegistry.registerID('Wert');
    idRegistry.registerID('wert');
    expect(idRegistry.isIdAvailable('WERT', 'Wert')).toBe(false);
  });

  it('getAndRegisterNewID should not hand out a name that differs from a taken one only in letter case', () => {
    idRegistry.registerID('Text_1');
    expect(idRegistry.getAndRegisterNewID('text')).toBe('text_2');
  });

  it('registerID should register names that differ only in letter case side by side', () => {
    idRegistry.registerID('Wert');
    idRegistry.registerID('wert');
    expect(idRegistry.isRegistered('Wert')).toBe(true);
    expect(idRegistry.isRegistered('wert')).toBe(true);
  });

  /* Taken once is taken: a second registration changes nothing (#1542). */
  it('registerID should keep a name registered twice once', () => {
    idRegistry.registerID('text_1');
    expect(() => idRegistry.registerID('text_1')).not.toThrow();
    expect(idRegistry.registeredIDs).toEqual(['text_1']);
  });
});

describe('IDService registration of names stored before #1129', () => {
  let idService: IDService;

  beforeEach(() => {
    idService = new IDService();
  });

  /* A stored unit may hold both. Registering only one of them would free the name while the other
     element still carries it, once the first one is deleted. */
  it('should register names that differ only in letter case both', () => {
    idService.register('Wert', false, true);
    idService.register('wert', false, true);
    idService.unregister('Wert', false, true);

    expect(idService.isAliasAvailable('wert')).toBe(false);
    expect(idService.isAliasAvailable('WERT')).toBe(false);
  });

  it('should let an alias change only its letter case', () => {
    idService.register('Wert', false, true);

    expect(idService.isAliasAvailable('wert', 'Wert')).toBe(true);
    expect(idService.isAliasAvailable('wert')).toBe(false);
  });
});
