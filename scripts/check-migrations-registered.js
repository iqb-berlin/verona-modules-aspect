/*
 * Checks that every migration step is registered in MigrationManager, and is run by `npm run lint`. A
 * step missing from `MigrationManager.steps` never runs on any unit, and no spec notices: the specs run
 * in a browser and cannot list the migrations directory (#1678).
 *
 * A step is an exported class in projects/common/migrations that extends UnitTraversalMigration or
 * implements MigrationStep; registered is what the `steps` array of MigrationManager constructs. Both
 * are read from the syntax tree, so a comment or a helper class next to a step changes nothing.
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const root = path.join(__dirname, '..');
const migrationsDir = 'projects/common/migrations';
const managerPath = 'projects/common/services/migration-manager.ts';

const parse = file => ts.createSourceFile(file, fs.readFileSync(path.join(root, file), 'utf8'),
                                         ts.ScriptTarget.Latest, true);
const isExported = node => (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0;
const isAbstract = node => (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Abstract) !== 0;
const isStep = node => (node.heritageClauses || []).some(clause => clause.types
  .some(type => ['UnitTraversalMigration', 'MigrationStep'].includes(type.expression.getText())));

const steps = fs.readdirSync(path.join(root, migrationsDir))
  .filter(file => file.endsWith('.ts') && !file.endsWith('.spec.ts'))
  .flatMap(file => parse(`${migrationsDir}/${file}`).statements
    .filter(node => ts.isClassDeclaration(node) && node.name && isExported(node) && !isAbstract(node) && isStep(node))
    .map(node => ({ file, className: node.name.text })));

const registered = new Set();
(function collect(node) {
  if (ts.isPropertyDeclaration(node) && node.name.getText() === 'steps' && node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)) {
    node.initializer.elements
      .filter(element => ts.isNewExpression(element))
      .forEach(element => registered.add(element.expression.getText()));
  }
  ts.forEachChild(node, collect);
}(parse(managerPath)));

if (!steps.length) {
  console.error(`Found no migration step in ${migrationsDir}: has the way a step is declared changed?`);
  process.exitCode = 1;
}
steps
  .filter(({ className }) => !registered.has(className))
  .forEach(({ file, className }) => {
    console.error(`${className} (${file}) is not registered in MigrationManager.steps in ${managerPath}`);
    process.exitCode = 1;
  });
