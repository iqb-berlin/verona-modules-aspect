import { VersionManager } from 'common/services/version-manager';

describe('VersionManager', () => {
  it('should be able to read version from package.json', () => {
    const result = VersionManager.getCurrentVersion();
    expect(result).toBeDefined();
    expect(result.split('.').length).toEqual(3);
  });
});
