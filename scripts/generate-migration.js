const fs = require('fs');
const path = require('path');
const {
  findStepClasses, registeredSteps, registerStep, loadUnitVersion
} = require('./migration-steps');

const from = process.argv[2];
const to = process.argv[3];

/* Stricter than UnitVersion, because the versions become file and class names: digits only, no
   leading zeros, at most three parts. Which one comes first is UnitVersion's to say, as in the apps. */
const isVersion = version => /^(0|[1-9]\d*)\.(0|[1-9]\d*)(\.(0|[1-9]\d*))?$/.test(version || '');
const UnitVersion = loadUnitVersion();
if (!isVersion(from) || !isVersion(to) || UnitVersion.compare(to, from) <= 0) {
  console.error('Usage: npm run generate-migration <fromVersion> <toVersion>, the second after the first');
  console.error('Example: npm run generate-migration 4.11 4.12 - the step then targets 4.12.0');
  process.exit(1);
}

/* Asked before the file exists, because most answers are "no step needed" - see the comment on
   MigrationManager for the long version. */
console.log('Before you write it: does this need a step at all?');
console.log('  - a new property with a default        -> no step, ModelNormalizer fills it in on load');
console.log('  - existing values have to change       -> yes, a step (rename, unit, structure)');
console.log('  - wrong values have to be repaired     -> a step only reaches units OLDER than its');
console.log('    toVersion, so data written by the version you are migrating to is out of reach\n');

/* The target version has three parts, as unit_definition_version, which it is raised to, and every
   step in the repository have it (#1670). Names and fromVersion drop a closing .0, as the steps in the
   repository do (4.12, v4.12-to-v4.13), and keep any other patch part, so that two steps within one
   minor version stay apart. */
const toVersion = to.split('.').length === 2 ? `${to}.0` : to;
const withoutClosingZero = version => version.replace(/^(\d+\.\d+)\.0$/, '$1');
const fromName = withoutClosingZero(from);
const toName = withoutClosingZero(to);
const fromSafe = fromName.replace(/\./g, 'm');
const toSafe = toName.replace(/\./g, 'm');
const fileName = `v${fromName}-to-v${toName}.migration.ts`;
const className = `Migration${fromSafe}To${toSafe}`;

const template = `/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable class-methods-use-this */
import { UnitTraversalMigration } from './unit-traversal-migration';

/**
 * Transforms values that ${toVersion} changes. Properties this version only *adds* do not belong here -
 * ModelNormalizer fills those in from ELEMENT_DEFAULTS on every load, whatever the version.
 *
 * Reaches units older than ${toVersion} only. See MigrationManager for why that matters.
 */
export class ${className} extends UnitTraversalMigration {
  fromVersion = '${fromName}';
  toVersion = '${toVersion}';

  protected override migrateElement(element: Record<string, unknown>): Record<string, unknown> {
    const newElement = { ...element };
    // Add your migration logic here
    return newElement;
  }
}
`;

/** `toVersion` decides which units the step reaches and when it runs among the steps, so its test stays
    even though it reads a constant back (rules.md, §11); `fromVersion` decides nothing of the kind. */
const specFileName = `v${fromName}-to-v${toName}.migration.spec.ts`;
const specTemplate = `import { ${className} } from './v${fromName}-to-v${toName}.migration';

describe('${className}', () => {
  let migration: ${className};

  beforeEach(() => {
    migration = new ${className}();
  });

  it('should have the target version of the step it is', () => {
    expect(migration.toVersion).toBe('${toVersion}');
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
  console.log(`Kept the existing ${specFileName}; it should hold the test of the step's target version`);
} else {
  fs.writeFileSync(specFilePath, specTemplate);
  console.log(`Success: Created ${specFileName}`);
}
console.log(`Test what the step transforms in ${specFileName}, next to the test of its target version`);

/* Registers the step in MigrationManager: a step that is not in its list never runs, and no test sees
   that - the specs run in a browser and cannot list the migrations directory. A kept step file is
   registered under the name it exports, whatever this run would have called it. */
const managerPath = path.join(projectRoot, 'projects/common/services/migration-manager.ts');
const manager = fs.readFileSync(managerPath, 'utf8');
const stepsInFile = findStepClasses().filter(step => step.file === fileName);
const stepName = stepsInFile.length === 1 ? stepsInFile[0].exportedAs[0] : undefined;
if (!stepName) {
  console.error(`Found ${stepsInFile.length} step classes in ${fileName}: register the step in`
    + ' MigrationManager.steps by hand');
  process.exitCode = 1;
} else if (registeredSteps(manager).has(stepName)) {
  console.log(`${stepName} is already registered in MigrationManager`);
} else {
  try {
    fs.writeFileSync(managerPath, registerStep(manager, stepName, `../migrations/${fileName.replace(/\.ts$/, '')}`));
    console.log(`Registered ${stepName} in projects/common/services/migration-manager.ts`);
  } catch (error) {
    console.error(`${error.message}: add ${stepName} to MigrationManager.steps by hand`);
    process.exitCode = 1;
  }
}

console.log(`Also: raise unit_definition_version to ${toVersion} in package.json and describe the change in
docs/unit_definition_changelog.txt`);
