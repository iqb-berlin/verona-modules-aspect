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

describe('registerStep and imports from elsewhere', () => {
  it('takes no import of the same file name from another directory for the step (#1697)', () => {
    const other = "import { Migration4m13To4m14 } from '../../legacy/migrations/v4.13-to-v4.14.migration';";

    assert.throws(
      () => registerStep(MANAGER.replace('import { MigrationStep }', `${other}\nimport { MigrationStep }`),
                         'Migration4m13To4m14', '../migrations/v4.13-to-v4.14.migration'),
      /already imports Migration4m13To4m14 from \.\.\/\.\.\/legacy\/migrations/
    );
  });

  it('refuses a name that MigrationManager declares itself, also by destructuring (#1697)', () => {
    ['class Migration4m13To4m14 {}', 'const { a: [Migration4m13To4m14] } = legacy;'].forEach(declaration => {
      assert.throws(
        () => registerStep(`${MANAGER}\n${declaration}\n`,
                           'Migration4m13To4m14', '../migrations/v4.13-to-v4.14.migration'),
        /MigrationManager declares Migration4m13To4m14 itself/,
        declaration
      );
    });
  });

  it('takes an import of the step as a type for no import of it, since `new` needs a value (#1697)', () => {
    const typeImport = "import type { Migration4m13To4m14 } from '../migrations/v4.13-to-v4.14.migration';";

    assert.throws(
      () => registerStep(MANAGER.replace('import { MigrationStep }', `${typeImport}\nimport { MigrationStep }`),
                         'Migration4m13To4m14', '../migrations/v4.13-to-v4.14.migration'),
      /already imports Migration4m13To4m14 from \.\.\/migrations\/v4\.13-to-v4\.14\.migration as a type/
    );
  });

  it('refuses a step that is no file below the migrations directory (#1697)', () => {
    assert.throws(() => registerStep(MANAGER, 'Foo', 'common/models/foo'),
                  /is no file below projects\/common\/migrations/);
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

  it('takes a nameless class for no step beside a nameless step, nor two nameless steps for one name (#1697)', () => {
    const result = check({
      [`${migrations}/n1.migration.ts`]: step('export default class'),
      [`${migrations}/n3.migration.ts`]: step('export default class'),
      [`${migrations}/sub/n2.ts`]: 'export default class {\n  x = 1;\n}\n'
    });

    assert.match(result.stderr, /n1\.migration\.ts\) is a default export/);
    assert.doesNotMatch(result.stderr, /n2\.ts/);
    assert.doesNotMatch(result.stderr, /is the name of a step/);
  });

  it('takes a class without a step base for no step, though a step of the same name exists (#1697)', () => {
    const result = check({ [`${migrations}/other/plain.ts`]: 'export class Migration4m12To4m13 {}\n' });

    assert.equal(result.status, 0, result.stderr);
  });

  it('advises an unexported base to be declared abstract, and an unexported step to be exported (#1697)', () => {
    const result = check({
      [`${migrations}/v4.13-to-v4.14.migration.ts`]: [
        "import { UnitTraversalMigration } from './unit-traversal-migration';",
        '',
        'class Helper extends UnitTraversalMigration {}',
        '',
        'export class Migration4m13To4m14 extends Helper {}',
        ''
      ].join('\n')
    });

    assert.match(result.stderr, /Helper \(v4\.13-to-v4\.14\.migration\.ts\) is not exported - other steps extend it:/);
    assert.match(check({ [`${migrations}/v4.13-to-v4.14.migration.ts`]: step('class Migration4m13To4m14') }).stderr,
                 /is not exported - write it as `export class Migration4m13To4m14`/);
  });

  it('advises the export when only a class of another file extends a class of that name (#1697)', () => {
    const result = check({
      [`${migrations}/v4.13-to-v4.14.migration.ts`]: step('class Migration4m13To4m14'),
      [`${migrations}/sub/other.ts`]: [
        "import { Migration4m13To4m14 } from '../../legacy/base';",
        '',
        'export class Other extends Migration4m13To4m14 {}',
        ''
      ].join('\n')
    });

    assert.match(result.stderr,
                 /Migration4m13To4m14 \(v4\.13-to-v4\.14\.migration\.ts\) is not exported - write it as/);
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

  it('refuses a name another step file uses, exported or not, before it writes the step file (#1697)', () => {
    ['export class', 'class'].forEach(declaration => {
      const files = project({ [`${migrations}/hotfix.migration.ts`]: step(`${declaration} Migration4m13To4m14`) });

      const result = files.run('generate-migration.js', '4.13', '4.14');

      assert.equal(result.status, 1, declaration);
      assert.match(result.stderr, /Migration4m13To4m14 is the name of a step in hotfix\.migration\.ts/, declaration);
      assert.equal(files.exists(`${migrations}/v4.13-to-v4.14.migration.ts`), false, declaration);
    });
  });

  it('takes a name that another step has as its class name only, exported under another (#1697)', () => {
    const files = project({
      [`${migrations}/hotfix.migration.ts`]:
        step('class Migration4m13To4m14', 'export { Migration4m13To4m14 as Hotfix };\n')
    });

    const result = files.run('generate-migration.js', '4.13', '4.14');

    assert.equal(result.status, 0, result.stderr);
    assert.match(files.read(manager), /new Migration4m13To4m14\(\)\n {2}\];/);
  });

  it('refuses a name MigrationManager imports from elsewhere or declares, before writing anything (#1697)', () => {
    [
      [MANAGER.replace('import { MigrationStep }',
                       "import { Migration4m13To4m14 } from '../../legacy/base';\nimport { MigrationStep }"),
        /MigrationManager already imports Migration4m13To4m14 from \.\.\/\.\.\/legacy\/base/],
      [`${MANAGER}\nclass Migration4m13To4m14 {}\n`, /MigrationManager declares Migration4m13To4m14 itself/]
    ].forEach(([text, message]) => {
      const files = project({ [manager]: text });

      const result = files.run('generate-migration.js', '4.13', '4.14');

      assert.equal(result.status, 1, text);
      assert.match(result.stderr, message);
      assert.equal(files.exists(`${migrations}/v4.13-to-v4.14.migration.ts`), false);
      assert.equal(files.exists(`${migrations}/v4.13-to-v4.14.migration.spec.ts`), false);
      assert.equal(files.read(manager), text);
    });
  });

  it('registers the step beside a class of its name that MigrationManager imports from elsewhere (#1697)', () => {
    const files = project({
      [manager]: MANAGER
        .replace('import { MigrationStep }',
                 "import { Migration4m13To4m14 as Legacy } from '../../legacy/base';\nimport { MigrationStep }")
        .replace('new Migration4m12To4m13()', 'new Migration4m12To4m13(),\n    new Legacy()')
    });

    const result = files.run('generate-migration.js', '4.13', '4.14');

    assert.equal(result.status, 0, result.stderr);
    assert.match(files.read(manager),
                 /import \{ Migration4m13To4m14 \} from '\.\.\/migrations\/v4\.13-to-v4\.14\.migration';/);
    assert.match(files.read(manager), /new Legacy\(\),\n {4}new Migration4m13To4m14\(\)/);
  });

  it('stops at a kept step file with two steps or with the step only under another name (#1693)', () => {
    [
      [step('export class Migration4m13To4m14', step('export class Another').split('\n').slice(2).join('\n')),
        /Found 2 step classes in v4\.13-to-v4\.14\.migration\.ts/],
      [step('class Migration4m13To4m14', 'export { Migration4m13To4m14 as Other };\n'),
        /does not export Migration4m13To4m14 by name/]
    ].forEach(([text, message]) => {
      const files = project({ [`${migrations}/v4.13-to-v4.14.migration.ts`]: text });
      const result = files.run('generate-migration.js', '4.13', '4.14');

      assert.equal(result.status, 1, text);
      assert.match(result.stderr, message);
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
      const result = files.run('generate-migration.js', ...versions.split(' '));
      assert.equal(result.status, 1, versions);
      assert.match(result.stderr, /Usage: npm run generate-migration/, versions);
    });
    assert.equal(files.read(manager), MANAGER);
    assert.deepEqual(fs.readdirSync(files.path(migrations)).filter(file => file.startsWith('v4.1')).sort(),
                     ['v4.12-to-v4.13.migration.ts']);
  });
});
