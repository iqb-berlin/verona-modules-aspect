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

/** `toVersion` decides which units the step reaches and `fromVersion` where it stands among the steps, so
    their test stays even though it reads constants back (rules.md, §11). */
const specFileName = `v${from}-to-v${to}.migration.spec.ts`;
const specTemplate = `import { ${className} } from './v${from}-to-v${to}.migration';

describe('${className}', () => {
  let migration: ${className};

  beforeEach(() => {
    migration = new ${className}();
  });

  it('should have the versions of the step it is', () => {
    expect(migration.fromVersion).toBe('${from}');
    expect(migration.toVersion).toBe('${to}');
  });
});
`;

const projectRoot = path.join(__dirname, '..');
const migrationsDir = path.join(projectRoot, 'projects/common/migrations');
const filePath = path.join(migrationsDir, fileName);
const specFilePath = path.join(migrationsDir, specFileName);

/* A step that is already there is kept, so that a run whose registration failed can be repeated. */
if (fs.existsSync(filePath)) {
  console.log(`Kept the existing ${fileName}`);
} else {
  fs.writeFileSync(filePath, template);
  console.log(`Success: Created ${fileName} in projects/common/migrations/`);
}
/* A spec written before the step - a test that fails without it - is kept as it is. */
if (fs.existsSync(specFilePath)) {
  console.log(`Kept the existing ${specFileName}; it should hold the test of the step's versions`);
} else {
  fs.writeFileSync(specFilePath, specTemplate);
  console.log(`Success: Created ${specFileName}`);
}
console.log(`Test what the step transforms in ${specFileName}, next to the test of its versions`);

/* Registers the step in MigrationManager: a step that is not in its list never runs, and no test sees
   that - the specs run in a browser and cannot list the migrations directory. */
const managerPath = path.join(projectRoot, 'projects/common/services/migration-manager.ts');
const manager = fs.readFileSync(managerPath, 'utf8');
const lastImport = [...manager.matchAll(/^import \{ Migration\w+ \} from '\.\.\/migrations\/v[^']+\.migration';$/gm)]
  .pop();
const lastStep = manager.match(/private static steps: MigrationStep\[\] = \[[^\]]*new \w+\(\)(?=\n {2}\];)/);
if (new RegExp(`new ${className}\\(\\)`).test(manager)) {
  console.log(`${className} is already registered in MigrationManager`);
} else if (lastImport && lastStep) {
  const importLine = `\nimport { ${className} } from '../migrations/${fileName.replace(/\.ts$/, '')}';`;
  const afterImport = lastImport.index + lastImport[0].length;
  const afterLastStep = lastStep.index + lastStep[0].length;
  fs.writeFileSync(managerPath, [
    manager.slice(0, afterImport), importLine,
    manager.slice(afterImport, afterLastStep), `,\n    new ${className}()`,
    manager.slice(afterLastStep)
  ].join(''));
  console.log(`Registered ${className} in projects/common/services/migration-manager.ts`);
} else {
  console.error('Could not find where to register the step: add it to MigrationManager.steps by hand');
  process.exitCode = 1;
}

console.log(`Also: raise unit_definition_version to ${to} in package.json and describe the change in
docs/unit_definition_changelog.txt`);
