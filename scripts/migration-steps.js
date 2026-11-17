/*
 * What the two migration scripts know about the migration steps and MigrationManager, read from the
 * syntax tree in one place, so that `generate-migration.js` writes what `check-migrations-registered.js`
 * accepts (#1686).
 *
 * A step is an exported, non-abstract class anywhere below projects/common/migrations that extends
 * UnitTraversalMigration or implements MigrationStep - directly, through another class of that
 * directory, or under a name it was imported as. It is exported by `export class` or by an
 * `export { … }` list, under its own name or an alias. Registered is what the `steps` array of
 * MigrationManager constructs, again under any imported name.
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const root = path.join(__dirname, '..');
const migrationsDir = 'projects/common/migrations';
const managerPath = 'projects/common/services/migration-manager.ts';
const stepBases = ['UnitTraversalMigration', 'MigrationStep'];

const parse = (fileName, text) => ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true);
const hasModifier = (node, flag) => (ts.getCombinedModifierFlags(node) & flag) !== 0;

/** The name each local name of a file was exported under: `import { A as B }` maps B to A. */
const importedNames = sourceFile => new Map(sourceFile.statements
  .filter(node => ts.isImportDeclaration(node) && node.importClause && node.importClause.namedBindings &&
    ts.isNamedImports(node.importClause.namedBindings))
  .flatMap(node => node.importClause.namedBindings.elements
    .map(element => [element.name.text, (element.propertyName || element.name).text])));

/** The names `export { … }` lists without a module export a local name under: `export { A as B }` gives A → B. */
const listedExports = sourceFile => sourceFile.statements
  .filter(node => ts.isExportDeclaration(node) && !node.moduleSpecifier && node.exportClause &&
    ts.isNamedExports(node.exportClause))
  .flatMap(node => node.exportClause.elements
    .map(element => [(element.propertyName || element.name).text, element.name.text]));

/** Every source file below a directory, specs left out, as a path relative to that directory. */
const sourceFilesBelow = (dir, prefix = '') => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap(entry => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return sourceFilesBelow(path.join(dir, entry.name), relative);
    return entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts') ? [relative] : [];
  });

/**
 * The step classes below the migrations directory: their file (relative to it), their name and the
 * names they are exported under.
 */
function findStepClasses() {
  const dir = path.join(root, migrationsDir);
  const classes = sourceFilesBelow(dir).flatMap(file => {
    const sourceFile = parse(file, fs.readFileSync(path.join(dir, file), 'utf8'));
    const imported = importedNames(sourceFile);
    const listed = listedExports(sourceFile);
    return sourceFile.statements
      .filter(node => ts.isClassDeclaration(node) && node.name)
      .map(node => ({
        file,
        className: node.name.text,
        exportedAs: [
          ...(hasModifier(node, ts.ModifierFlags.Export) ? [node.name.text] : []),
          ...listed.filter(([local]) => local === node.name.text).map(([, exported]) => exported)
        ],
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
      .forEach(({ className, exportedAs }) => {
        [className, ...exportedAs].forEach(name => stepKinds.add(name));
        grown = true;
      });
  }
  return classes
    .filter(({ className, exportedAs, abstract }) => exportedAs.length > 0 && !abstract &&
      stepKinds.has(className) && !stepBases.includes(className))
    .map(({ file, className, exportedAs }) => ({ file, className, exportedAs }));
}

/** The array literal of `MigrationManager.steps`, or undefined. */
function findStepsArray(sourceFile) {
  let found;
  (function visit(node) {
    if (ts.isPropertyDeclaration(node) && node.name.getText() === 'steps' && node.initializer &&
        ts.isArrayLiteralExpression(node.initializer)) {
      found = node.initializer;
    }
    if (!found) ts.forEachChild(node, visit);
  }(sourceFile));
  return found;
}

/** The names under which the steps MigrationManager constructs are exported from their files. */
function registeredSteps(managerText) {
  const manager = parse(managerPath, managerText);
  const imported = importedNames(manager);
  const steps = findStepsArray(manager);
  return new Set(steps ? steps.elements
    .filter(element => ts.isNewExpression(element))
    .map(element => element.expression.getText())
    .map(name => imported.get(name) || name) : []);
}

/**
 * MigrationManager with the step `exportedName` from `importPath` appended to `steps`, its import
 * added unless it is there already. The places come from the syntax tree, so a trailing comma, a
 * multi-line import or the indentation do not matter; the line ending is taken from the file.
 * Throws if there is no `steps` array with an entry to append to.
 */
function registerStep(managerText, exportedName, importPath) {
  const manager = parse(managerPath, managerText);
  const steps = findStepsArray(manager);
  if (!steps || steps.elements.length === 0) {
    throw new Error(`Found no entry in MigrationManager.steps in ${managerPath} to append to`);
  }
  const eol = managerText.includes('\r\n') ? '\r\n' : '\n';
  /* An import of the step that is there already, from its own file, possibly under another name. */
  const localName = manager.statements
    .filter(node => ts.isImportDeclaration(node) && node.moduleSpecifier.text === importPath &&
      node.importClause && node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings))
    .flatMap(node => node.importClause.namedBindings.elements)
    .find(element => (element.propertyName || element.name).text === exportedName)?.name.text;

  const lastStep = steps.elements[steps.elements.length - 1];
  const lineStart = managerText.lastIndexOf('\n', lastStep.getStart(manager)) + 1;
  const indent = managerText.slice(lineStart, lastStep.getStart(manager));
  /* Inserted right after the last entry: an existing trailing comma then follows the new one. */
  const edits = [{ at: lastStep.getEnd(), text: `,${eol}${indent}new ${localName || exportedName}()` }];

  if (!localName) {
    /* After the import of the last registered step, so that the step imports stay together. */
    const constructed = new Set(steps.elements
      .filter(element => ts.isNewExpression(element))
      .map(element => element.expression.getText()));
    const imports = manager.statements.filter(node => ts.isImportDeclaration(node));
    const stepImports = imports.filter(node => node.importClause && node.importClause.namedBindings &&
      ts.isNamedImports(node.importClause.namedBindings) &&
      node.importClause.namedBindings.elements.some(element => constructed.has(element.name.text)));
    const after = (stepImports.length ? stepImports : imports).pop();
    edits.push({
      at: after ? after.getEnd() : 0,
      text: `${after ? eol : ''}import { ${exportedName} } from '${importPath}';${after ? '' : eol}`
    });
  }
  return edits
    .sort((a, b) => b.at - a.at)
    .reduce((text, { at, text: inserted }) => text.slice(0, at) + inserted + text.slice(at), managerText);
}

/**
 * `UnitVersion` from projects/common/utils, which the scripts cannot `require` as TypeScript: it is
 * transpiled on the fly, so that the generator compares versions exactly as the applications do.
 * That only works while unit-version.ts imports nothing: the transpiled code gets no `require`.
 */
function loadUnitVersion() {
  const source = fs.readFileSync(path.join(root, 'projects/common/utils/unit-version.ts'), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  });
  const module = { exports: {} };
  // eslint-disable-next-line no-new-func
  new Function('module', 'exports', outputText)(module, module.exports);
  return module.exports.UnitVersion;
}

module.exports = {
  root, migrationsDir, managerPath, findStepClasses, registeredSteps, registerStep, loadUnitVersion
};
