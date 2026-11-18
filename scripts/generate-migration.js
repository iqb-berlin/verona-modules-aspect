const fs = require('fs');
const path = require('path');
const {
  findStepClasses, stepProblems, registerStep, loadUnitVersion
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

/** The steps as they are before this run writes anything. */
const steps = findStepClasses();

/* A name that another step holds is refused before anything is written, or the new file would be left
   behind without spec and registration and fail the check (#1697). The other steps are asked beside the
   step as the template writes it, with the check's own rule. */
const written = { file: fileName, className, exportedAs: [className] };
const nameTaken = stepProblems([...steps.filter(step => step.file !== fileName), written])
  .filter(({ files }) => files.includes(fileName));
if (nameTaken.length) {
  nameTaken.forEach(({ message }) => console.error(message));
  process.exit(1);
}

/* MigrationManager with the step registered: a step that is not in its list never runs, and no test sees
   that - the specs run in a browser and cannot list the migrations directory. It is worked out here and
   written last, so that what keeps the step from being registered - a name the manager holds already, a
   `steps` list it cannot find - stops the run before any file is written (#1701). */
const managerPath = path.join(projectRoot, 'projects/common/services/migration-manager.ts');
const manager = fs.readFileSync(managerPath, 'utf8');
let registered;
try {
  registered = registerStep(manager, className, `../migrations/${fileName.replace(/\.ts$/, '')}`);
} catch (error) {
  console.error(`${error.message}; nothing was written`);
  process.exit(1);
}

/* A step that is already there is kept: it may have been written before the generator ran. */
const isKept = fs.existsSync(filePath);
if (isKept) {
  console.log(`Kept the existing ${fileName}`);
} else {
  fs.writeFileSync(filePath, template);
  console.log(`Success: Created ${fileName} in projects/common/migrations/`);
}

const stepsInFile = steps.filter(step => step.file === fileName);
const problems = stepProblems(steps).filter(({ files }) => files.includes(fileName));
const isNamedAfterVersions = stepsInFile.length === 1 && stepsInFile[0].exportedAs.includes(className);
/* A step is called after its versions, and the spec and the registration below name it so. A kept file
   that declares its step otherwise is not followed: it is reported, and nothing more is written (#1693).
   A file written just now holds the template's class, so only a kept one is looked into. */
if (isKept && (problems.length || !isNamedAfterVersions)) {
  if (problems.length) {
    problems.forEach(({ message }) => console.error(message));
  } else if (stepsInFile.length !== 1) {
    console.error(`Found ${stepsInFile.length} step classes in ${fileName}, where ${className} belongs`);
  } else if (stepsInFile[0].className !== className) {
    console.error(`${fileName} declares ${stepsInFile[0].className}: rename the class to ${className}`);
  } else {
    console.error(`${fileName} does not export ${className} by name: write it as \`export class ${className}\``);
  }
  process.exit(1);
}

/* A spec written before the step - a test that fails without it - is kept as it is. */
if (fs.existsSync(specFilePath)) {
  console.log(`Kept the existing ${specFileName}; it should hold the test of the step's target version`);
} else {
  fs.writeFileSync(specFilePath, specTemplate);
  console.log(`Success: Created ${specFileName}`);
}
console.log(`Test what the step transforms in ${specFileName}, next to the test of its target version`);

if (registered === manager) {
  console.log(`${className} is already registered in MigrationManager`);
} else {
  try {
    fs.writeFileSync(managerPath, registered);
    console.log(`Registered ${className} in projects/common/services/migration-manager.ts`);
  } catch (error) {
    console.error(`${error.message}: add ${className} to MigrationManager.steps by hand`);
    process.exitCode = 1;
  }
}

console.log(`Also: raise unit_definition_version to ${toVersion} in package.json and describe the change in
docs/unit_definition_changelog.txt`);
