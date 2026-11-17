/*
 * Tests of the migration scripts, run by `npm run test:scripts` as part of `npm test`. They use Node's own
 * test runner, because the Vitest projects run in a browser and can neither read nor write files (#1695).
 * Each test is about a decision of the scripts, an error path, or a fault they had.
 *
 * The scripts run as they are, as child processes, on a small project in a temporary directory, so that
 * a test can give the migrations directory and MigrationManager any shape.
 */
const { describe, it, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { registerStep } = require('./migration-steps');

const repo = path.join(__dirname, '..');
const manager = 'projects/common/services/migration-manager.ts';
const migrations = 'projects/common/migrations';

const MANAGER = `import { MigrationLegacy } from '../migrations/legacy-migration';
import { Migration4m12To4m13 } from '../migrations/v4.12-to-v4.13.migration';
import { MigrationStep } from '../migrations/migration-step.interface';
import { UnitVersion } from '../utils/unit-version';

export class MigrationManager {
  private static steps: MigrationStep[] = [
    new MigrationLegacy(),
    new Migration4m12To4m13()
  ];
}
`;

/** A step file declaring a class with `declaration`, e.g. `export class X`, and `trailer` behind it. */
const step = (declaration, trailer = '') => [
  "import { UnitTraversalMigration } from './unit-traversal-migration';",
  '',
  `${declaration} extends UnitTraversalMigration {`,
  "  fromVersion = '4.13';",
  "  toVersion = '4.14.0';",
  '}',
  trailer
].join('\n');

const roots = [];
after(() => roots.forEach(root => fs.rmSync(root, { recursive: true, force: true })));

/** A project with the three scripts, two registered steps and the files given, relative to its root. */
function project(files = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'migration-steps-'));
  roots.push(root);
  const write = (file, text) => {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), text);
  };
  ['migration-steps.js', 'generate-migration.js', 'check-migrations-registered.js']
    .forEach(script => write(`scripts/${script}`, fs.readFileSync(path.join(__dirname, script), 'utf8')));
  write('projects/common/utils/unit-version.ts',
        fs.readFileSync(path.join(repo, 'projects/common/utils/unit-version.ts'), 'utf8'));
  write(manager, MANAGER);
  write(`${migrations}/legacy-migration.ts`, [
    "import { MigrationStep } from './migration-step.interface';",
    '',
    'export class MigrationLegacy implements MigrationStep {}',
    ''
  ].join('\n'));
  write(`${migrations}/v4.12-to-v4.13.migration.ts`, step('export class Migration4m12To4m13'));
  Object.entries(files).forEach(([file, text]) => write(file, text));
  return {
    path: file => path.join(root, file),
    read: file => fs.readFileSync(path.join(root, file), 'utf8'),
    exists: file => fs.existsSync(path.join(root, file)),
    run: (script, ...args) => spawnSync(process.execPath, [path.join(root, 'scripts', script), ...args], {
      encoding: 'utf8', env: { ...process.env, NODE_PATH: path.join(repo, 'node_modules') }
    })
  };
}

describe('registerStep', () => {
  const register = text => registerStep(text, 'Migration4m13To4m14', '../migrations/v4.13-to-v4.14.migration');

  it('keeps a trailing comma behind the new entry (#1686)', () => {
    const result = register(MANAGER.replace('new Migration4m12To4m13()', 'new Migration4m12To4m13(),'));

    assert.match(result, /new Migration4m12To4m13\(\),\n {4}new Migration4m13To4m14\(\),\n {2}\];/);
  });

  it('puts the import behind a step import written on several lines (#1686)', () => {
    const result = register(MANAGER.replace('import { Migration4m12To4m13 }', 'import {\n  Migration4m12To4m13\n}'));

    assert.ok(result.includes("\n} from '../migrations/v4.12-to-v4.13.migration';\n"
      + "import { Migration4m13To4m14 } from '../migrations/v4.13-to-v4.14.migration';\n"));
  });

  it('writes the line ending of the file (#1669)', () => {
    const result = register(MANAGER.replace(/\n/g, '\r\n'));

    assert.equal(result.replace(/\r\n/g, '').includes('\n'), false);
    assert.match(result, /new Migration4m13To4m14\(\)\r\n/);
  });

  it('uses an import of the step through the common/ alias instead of adding a second (#1693)', () => {
    const result = register(MANAGER.replace(
      'import { MigrationStep }',
      "import { Migration4m13To4m14 } from 'common/migrations/v4.13-to-v4.14.migration';\nimport { MigrationStep }"
    ));

    assert.equal(result.match(/import \{ Migration4m13To4m14 \}/g).length, 1);
    assert.match(result, /new Migration4m13To4m14\(\)\n {2}\];/);
  });
});

describe('check-migrations-registered', () => {
  const check = files => project(files).run('check-migrations-registered.js');

  it('finds an unregistered step in a subfolder, also behind an export list (#1686)', () => {
    const result = check({
      [`${migrations}/sub/listed.migration.ts`]: step('class Hidden', 'export { Hidden as ListedStep };\n')
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Hidden \(sub\/listed\.migration\.ts\) is not registered/);
  });

  it('reports a step written as a default export, rather than calling it unregistered (#1693)', () => {
    const result = check({
      [`${migrations}/v4.13-to-v4.14.migration.ts`]: step('export default class Migration4m13To4m14')
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Migration4m13To4m14 \(v4\.13-to-v4\.14\.migration\.ts\) is a default export/);
    assert.doesNotMatch(result.stderr, /not registered/);
  });

  it('reports a step class that is not exported at all (#1693)', () => {
    const result = check({ [`${migrations}/v4.13-to-v4.14.migration.ts`]: step('class Migration4m13To4m14') });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Migration4m13To4m14 \(v4\.13-to-v4\.14\.migration\.ts\) is not exported/);
  });

  it('reports a name two steps share, which would pass one of them as registered (#1693)', () => {
    const result = check({ [`${migrations}/hotfix.migration.ts`]: step('export class Migration4m12To4m13') });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Migration4m12To4m13 is the name of a step in hotfix\.migration\.ts and v4\.12/);
  });
});

describe('generate-migration', () => {
  it('stops at a kept step file whose class is not named after the versions, and writes nothing more (#1693)', () => {
    const files = project({ [`${migrations}/v4.13-to-v4.14.migration.ts`]: step('export class FontRenaming') });

    const result = files.run('generate-migration.js', '4.13', '4.14');

    assert.equal(result.status, 1);
    assert.match(result.stderr, /declares FontRenaming: rename the class to Migration4m13To4m14/);
    assert.equal(files.exists(`${migrations}/v4.13-to-v4.14.migration.spec.ts`), false);
    assert.equal(files.read(manager), MANAGER);
  });

  it('stops at a kept step file with two steps or with the step only under another name (#1693)', () => {
    [
      step('export class Migration4m13To4m14', `${step('export class Another').split('\n').slice(2).join('\n')}`),
      step('class Migration4m13To4m14', 'export { Migration4m13To4m14 as Other };\n')
    ].forEach(text => {
      const files = project({ [`${migrations}/v4.13-to-v4.14.migration.ts`]: text });

      assert.equal(files.run('generate-migration.js', '4.13', '4.14').status, 1, text);
      assert.equal(files.exists(`${migrations}/v4.13-to-v4.14.migration.spec.ts`), false);
      assert.equal(files.read(manager), MANAGER);
    });
  });

  it('registers the step once when it runs twice (#1669)', () => {
    const files = project();

    const first = files.run('generate-migration.js', '4.13', '4.14');
    assert.equal(first.status, 0, first.stderr);
    assert.equal(files.read(manager).match(/new Migration4m13To4m14\(\)/g).length, 1);
    const result = files.run('generate-migration.js', '4.13', '4.14');

    assert.equal(result.status, 0, result.stderr);
    assert.match(files.read(`${migrations}/v4.13-to-v4.14.migration.spec.ts`), /import \{ Migration4m13To4m14 \}/);
    assert.equal(files.read(manager).match(/new Migration4m13To4m14\(\)/g).length, 1);
    assert.equal(files.run('check-migrations-registered.js').status, 0);
  });

  it('refuses a target version that does not come after the start version, and writes nothing', () => {
    const files = project();

    ['4.14 4.13', '4.13 4.13.0', '4.13 04.14'].forEach(versions => {
      assert.equal(files.run('generate-migration.js', ...versions.split(' ')).status, 1, versions);
    });
    assert.equal(files.read(manager), MANAGER);
    assert.deepEqual(fs.readdirSync(files.path(migrations)).filter(file => file.startsWith('v4.1')).sort(),
                     ['v4.12-to-v4.13.migration.ts']);
  });
});
