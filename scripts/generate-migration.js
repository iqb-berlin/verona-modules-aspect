const fs = require('fs');
const path = require('path');

const from = process.argv[2];
const to = process.argv[3];

if (!from || !to) {
  console.error('Usage: npm run generate-migration <fromVersion> <toVersion>');
  console.error('Example: npm run generate-migration 4.11 4.12');
  process.exit(1);
}

/* Asked before the file exists, because most answers are "no step needed" - see the comment on
   MigrationManager for the long version. */
console.log('Before you write it: does this need a step at all?');
console.log('  - a new property with a default        -> no step, ModelNormalizer fills it in on load');
console.log('  - existing values have to change       -> yes, a step (rename, unit, structure)');
console.log('  - wrong values have to be repaired     -> a step only reaches units OLDER than its');
console.log('    toVersion, so data written by the version you are migrating to is out of reach\n');

const fromSafe = from.replace(/\./g, 'm');
const toSafe = to.replace(/\./g, 'm');
const fileName = `v${from}-to-v${to}.migration.ts`;
const className = `Migration${fromSafe}To${toSafe}`;

const template = `/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable class-methods-use-this */
import { UnitTraversalMigration } from './unit-traversal-migration';

/**
 * Transforms values that ${to} changes. Properties this version only *adds* do not belong here -
 * ModelNormalizer fills those in from ELEMENT_DEFAULTS on every load, whatever the version.
 *
 * Reaches units older than ${to} only. See MigrationManager for why that matters.
 */
export class ${className} extends UnitTraversalMigration {
  fromVersion = '${from}';
  toVersion = '${to}';

  protected override migrateElement(element: Record<string, unknown>): Record<string, unknown> {
    const newElement = { ...element };
    // Add your migration logic here
    return newElement;
  }
}
`;

const projectRoot = path.join(__dirname, '..');
const migrationsDir = path.join(projectRoot, 'projects/common/migrations');
const filePath = path.join(migrationsDir, fileName);

if (fs.existsSync(filePath)) {
  console.error(`Error: File ${fileName} already exists.`);
  process.exit(1);
}

fs.writeFileSync(filePath, template);
console.log(`Success: Created ${fileName} in projects/common/migrations/`);
console.log(`Also: raise unit_definition_version to ${to} in package.json and describe the change in
docs/unit_definition_changelog.txt`);
console.log(`Don't forget to register it in projects/common/services/migration-manager.ts`);
