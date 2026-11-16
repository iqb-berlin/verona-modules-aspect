const fs = require('fs');
const path = require('path');

const from = process.argv[2];
const to = process.argv[3];

const isVersion = version => /^(0|[1-9]\d*)\.(0|[1-9]\d*)(\.(0|[1-9]\d*))?$/.test(version || '');
const partsOf = version => [...version.split('.').map(Number), 0].slice(0, 3);
const isAfter = (a, b) => partsOf(a).reduce((order, part, i) => order || Math.sign(part - partsOf(b)[i]), 0) > 0;
if (!isVersion(from) || !isVersion(to) || !isAfter(to, from)) {
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

/* The target version has three parts, as unit_definition_version does, which it is raised to:
   VersionManager reads a missing third part as undefined, and a unit stamped x.y.0 then counts as newer
   than the editor. Names and fromVersion drop a closing .0, as the steps in the repository do (4.12,
   v4.12-to-v4.13), and keep any other patch part, so that two steps within one minor version stay
   apart (#1670). */
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

/** `toVersion` decides which units the step reaches and `fromVersion` where it stands among the steps, so
    their test stays even though it reads constants back (rules.md, §11). */
const specFileName = `v${fromName}-to-v${toName}.migration.spec.ts`;
const specTemplate = `import { ${className} } from './v${fromName}-to-v${toName}.migration';

describe('${className}', () => {
  let migration: ${className};

  beforeEach(() => {
    migration = new ${className}();
  });

  it('should have the versions of the step it is', () => {
    expect(migration.fromVersion).toBe('${fromName}');
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
/* A checkout with core.autocrlf ends its lines with \r\n: they are matched and written that way. */
const eol = manager.includes('\r\n') ? '\r\n' : '\n';
const lastImport = [
  ...manager.matchAll(/^import \{ Migration\w+ \} from '\.\.\/migrations\/v[^']+\.migration';(?=\r?$)/gm)
].pop();
const lastStep = manager.match(/private static steps: MigrationStep\[\] = \[[^\]]*new \w+\(\)(?=\r?\n {2}\];)/);
/* The import may be there without the step, if the step was taken out of the list by hand. */
const isImported = new RegExp(`^import \\{[^}]*\\b${className}\\b[^}]*\\} from`, 'm').test(manager);
if (new RegExp(`new ${className}\\(\\)`).test(manager)) {
  console.log(`${className} is already registered in MigrationManager`);
} else if (lastImport && lastStep) {
  const importPath = `../migrations/${fileName.replace(/\.ts$/, '')}`;
  const importLine = isImported ? '' : `${eol}import { ${className} } from '${importPath}';`;
  const afterImport = lastImport.index + lastImport[0].length;
  const afterLastStep = lastStep.index + lastStep[0].length;
  fs.writeFileSync(managerPath, [
    manager.slice(0, afterImport), importLine,
    manager.slice(afterImport, afterLastStep), `,${eol}    new ${className}()`,
    manager.slice(afterLastStep)
  ].join(''));
  console.log(`Registered ${className} in projects/common/services/migration-manager.ts`);
} else {
  console.error('Could not find where to register the step: add it to MigrationManager.steps by hand');
  process.exitCode = 1;
}

console.log(`Also: raise unit_definition_version to ${toVersion} in package.json and describe the change in
docs/unit_definition_changelog.txt`);
