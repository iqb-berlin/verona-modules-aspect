import { ImportedModuleVersion } from './imported-module-version';

describe('ImportedModuleVersion', () => {
  describe('setVersion and verifyVersionString', () => {
    it('should set the version for a valid string', () => {
      ImportedModuleVersion.setVersion('iqb-aspect-definition@1.2.3');
      expect(ImportedModuleVersion.version).toBe('1.2.3');
    });

    it('should set version to null for an invalid string', () => {
      ImportedModuleVersion.setVersion('invalid-prefix@1.2.3');
      expect(ImportedModuleVersion.version).toBeNull();
    });

    it('should set version to null for a string with wrong number of segments', () => {
      ImportedModuleVersion.setVersion('iqb-aspect-definition@1.2');
      expect(ImportedModuleVersion.version).toBeNull();
    });
  });

  describe('isGreaterThanOrEqualTo', () => {
    beforeEach(() => {
      ImportedModuleVersion.setVersion('iqb-aspect-definition@2.2.2');
    });

    it('should return true for an equal version', () => {
      expect(ImportedModuleVersion.isGreaterThanOrEqualTo('2.2.2')).toBe(true);
    });

    it('should return true for a smaller version', () => {
      expect(ImportedModuleVersion.isGreaterThanOrEqualTo('1.2.2')).toBe(true);
      expect(ImportedModuleVersion.isGreaterThanOrEqualTo('2.1.2')).toBe(true);
      expect(ImportedModuleVersion.isGreaterThanOrEqualTo('2.2.1')).toBe(true);
    });

    it('should return false for a larger version', () => {
      expect(ImportedModuleVersion.isGreaterThanOrEqualTo('3.2.2')).toBe(false);
      expect(ImportedModuleVersion.isGreaterThanOrEqualTo('2.3.2')).toBe(false);
      expect(ImportedModuleVersion.isGreaterThanOrEqualTo('2.2.3')).toBe(false);
    });

    it('should return false if no version is set', () => {
      ImportedModuleVersion.version = null;
      expect(ImportedModuleVersion.isGreaterThanOrEqualTo('1.1.1')).toBe(false);
    });
  });
});
