export class ImportModuleVersion {
  private static unitLoaded: boolean;
  private static version: string;

  static setVersion(importedModuleVersion: string): void {
    ImportModuleVersion.unitLoaded = false;
    ImportModuleVersion.version = importedModuleVersion;
  }

  static setUnitLoaded(): void {
    ImportModuleVersion.unitLoaded = true;
  }

  static isUnitLoaded(): boolean {
    return ImportModuleVersion.unitLoaded;
  }

  static getVersion(): { fullName: string, type: string, version: number[] } {
    return {
      fullName: ImportModuleVersion.version,
      type: ImportModuleVersion.getVersionType(),
      version: ImportModuleVersion.getVersionNumbers()
    };
  }

  private static getVersionType(): string {
    if (ImportModuleVersion.version && ImportModuleVersion.version.length) {
      const importedModuleVersionArray = ImportModuleVersion.version.split('@');
      if (importedModuleVersionArray.length === 2) {
        return importedModuleVersionArray[0];
      }
    }
    return 'none';
  }

  private static getVersionNumbers(): number[] {
    if (ImportModuleVersion.version && ImportModuleVersion.version.length) {
      const importedModuleVersionArray = ImportModuleVersion.version.split('@');
      if (importedModuleVersionArray.length === 2) {
        const versionArray = importedModuleVersionArray[1].split('.');
        if (versionArray.length === 3) {
          return versionArray.map(number => Number(number));
        }
      }
    }
    return [0, 0, 0];
  }

  static verifyVersion(): boolean {
    if (!ImportModuleVersion.getVersion().fullName) {
      return false;
    }
    if (ImportModuleVersion.getVersionType() !== 'iqb-aspect-definition') {
      return false;
    }
    const numbers = ImportModuleVersion.getVersionNumbers();
    if (numbers[0] < 1) {
      return false;
    }
    return numbers[1] >= 1;
  }
}
