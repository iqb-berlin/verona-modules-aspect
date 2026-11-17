/*
 * Checks that every migration step is registered in MigrationManager, and is run by `npm run lint`. A
 * step missing from `MigrationManager.steps` never runs on any unit, and no spec notices: the specs run
 * in a browser and cannot list the migrations directory (#1678).
 *
 * A step is an exported, non-abstract class in projects/common/migrations that extends
 * UnitTraversalMigration or implements MigrationStep - directly, through another class of that
 * directory, or under a name it was imported as. Registered is what the `steps` array of
 * MigrationManager constructs, again under any imported name. Both are read from the syntax tree, so a
 * comment or a helper class next to a step changes nothing.
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const root = path.join(__dirname, '..');
const migrationsDir = 'projects/common/migrations';
const managerPath = 'projects/common/services/migration-manager.ts';
const stepBases = ['UnitTraversalMigration', 'MigrationStep'];

const parse = file => ts.createSourceFile(file, fs.readFileSync(path.join(root, file), 'utf8'),
                                         ts.ScriptTarget.Latest, true);
const hasModifier = (node, flag) => (ts.getCombinedModifierFlags(node) & flag) !== 0;

/** The name each local name of a file was imported under: `import { A as B }` maps B to A. */
const importedNames = sourceFile => new Map(sourceFile.statements
  .filter(node => ts.isImportDeclaration(node) && node.importClause && node.importClause.namedBindings &&
    ts.isNamedImports(node.importClause.namedBindings))
  .flatMap(node => node.importClause.namedBindings.elements
    .map(element => [element.name.text, (element.propertyName || element.name).text])));

const classes = fs.readdirSync(path.join(root, migrationsDir))
  .filter(file => file.endsWith('.ts') && !file.endsWith('.spec.ts'))
  .flatMap(file => {
    const sourceFile = parse(`${migrationsDir}/${file}`);
    const imported = importedNames(sourceFile);
    return sourceFile.statements
      .filter(node => ts.isClassDeclaration(node) && node.name)
      .map(node => ({
        file,
        className: node.name.text,
        exported: hasModifier(node, ts.ModifierFlags.Export),
        abstract: hasModifier(node, ts.ModifierFlags.Abstract),
        bases: (node.heritageClauses || []).flatMap(clause => clause.types
          .map(type => imported.get(type.expression.getText()) || type.expression.getText()))
      }));
  });

/* A class is a step once one of its bases is: repeated until no class is added, for chains of any length. */
const stepKinds = new Set(stepBases);
let grown = true;
while (grown) {
  grown = false;
  classes
    .filter(({ className, bases }) => !stepKinds.has(className) && bases.some(base => stepKinds.has(base)))
    .forEach(({ className }) => {
      stepKinds.add(className);
      grown = true;
    });
}
const steps = classes.filter(({ className, exported, abstract }) => exported && !abstract &&
  stepKinds.has(className) && !stepBases.includes(className));

const manager = parse(managerPath);
const managerImports = importedNames(manager);
const registered = new Set();
(function collect(node) {
  if (ts.isPropertyDeclaration(node) && node.name.getText() === 'steps' && node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)) {
    node.initializer.elements
      .filter(element => ts.isNewExpression(element))
      .map(element => element.expression.getText())
      .forEach(name => registered.add(managerImports.get(name) || name));
  }
  ts.forEachChild(node, collect);
}(manager));

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
