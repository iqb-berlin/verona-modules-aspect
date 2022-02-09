export class ImportedModuleVersion {
  static unitLoaded: boolean;
  static version: string | null = null; // null for invalid

  static setVersion(importedModuleVersion: string | undefined): void {
    ImportedModuleVersion.unitLoaded = false;
    if (importedModuleVersion) {
      ImportedModuleVersion.verifyVersionString(importedModuleVersion) ?
        ImportedModuleVersion.version = importedModuleVersion.split('@')[1] :
        ImportedModuleVersion.version = null;
    }
  }

  /*
  Checks for existence of parts before and after the @ sign. The first part has to be
  'iqb-aspect-definition', which indicates a known and supported version.
  The second part has to have exactly 3 numbers, split at the . (dot) sign.
   */
  static verifyVersionString(versionString: string): boolean {
    if (versionString.split('@').length !== 2 ||
        versionString.split('@')[0] !== 'iqb-aspect-definition' ||
        versionString.split('@')[1].split('.').length !== 3) {
      console.error('Error reading the unit definition!');
      return false;
    }
    return true;
  }

  static isGreaterThanOrEqualTo(versionString: string): boolean {
    if (!ImportedModuleVersion.version) {
      return false;
    }

    if (ImportedModuleVersion.version[0] < versionString[0]) {
      return false;
    }
    if (ImportedModuleVersion.version[0] > versionString[0]) {
      return true;
    }

    if (ImportedModuleVersion.version[1] < versionString[1]) {
      return false;
    }
    if (ImportedModuleVersion.version[1] > versionString[1]) {
      return true;
    }

    if (ImportedModuleVersion.version[2] < versionString[2]) {
      return false;
    }

    return true;
  }
}
