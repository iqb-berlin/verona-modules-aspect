import * as twoSections from 'test-data/unit-definitions/reference-testing/section-deletion.json';
import { MigrationManager } from 'common/services/migration-manager';
import { VersionManager } from 'common/services/version-manager';
import { Unit } from 'common/models/unit';
import { environment } from 'common/environment';

/* Built from a stored definition the way the app builds one -- migrated, then constructed. The stored
   definition is loose and what the migration answers with is not: since #1198 it is a `UnitProperties`,
   and no cast stands between the two. */
const loadUnit = (): Unit => new Unit(
  MigrationManager.migrate(JSON.parse(JSON.stringify(twoSections)), VersionManager.getCurrentVersion())
);

describe('Unit', () => {
  /* Which section an element lives in is asked of the unit, because the editor's selection indices
     are written in several places and can name another one (#1204). */
  describe('getSectionOfElement', () => {
    it('should name the section that holds the element', () => {
      const unit = loadUnit();
      const [firstSection, secondSection] = unit.pages[0].sections;

      expect(unit.getSectionOfElement(secondSection.elements[0])).toBe(secondSection);
      expect(unit.getSectionOfElement(firstSection.elements[0])).toBe(firstSection);
    });

    it('should name no section for an element the unit does not hold', () => {
      const unit = loadUnit();
      const foreign = loadUnit().pages[0].sections[0].elements[0];

      expect(unit.getSectionOfElement(foreign)).toBeUndefined();
    });
  });

  /* 4.13 is 4.13.0, and the unit carries it in three parts, the form a player released before #1679 reads.
     Compared as text, strict instantiation refused the unit. */
  it('should take a unit at the current version written with two parts and carry it in three', () => {
    const [major, minor] = VersionManager.getCurrentVersion().split('.');
    const definition = MigrationManager.migrate(JSON.parse(JSON.stringify(twoSections)),
                                                VersionManager.getCurrentVersion());
    // Set here and restored: other specs switch it off, and only strict instantiation refuses the unit.
    const strict = environment.strictInstantiation;
    environment.strictInstantiation = true;
    try {
      const unit = new Unit({ ...definition, version: `${major}.${minor}` });

      expect(unit.version).toBe(VersionManager.getCurrentVersion());
    } finally {
      environment.strictInstantiation = strict;
    }
  });
});
