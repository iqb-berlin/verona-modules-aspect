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
 *
 * Steps are matched by name, so a step has to be a named export, and no two steps may share a name.
 * `stepProblems` names the steps that break this, so that the check says so instead of calling them
 * unregistered or passing them unseen (#1693).
 *
 * Bases are followed by name as well, and so is what MigrationManager constructs. What that cannot tell
 * apart is left as it is (#1697): a class that extends a class of the same name as a step base from
 * another file; a base imported as a default, or reached through an index file or a namespace import; and
 * a class that MigrationManager constructs from elsewhere under a step's name, which passes that step as
 * registered in the check. None of them occurs in the repository, and the last one does not mislead the
 * generator, which goes by the import of the step's own file.
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const root = path.join(__dirname, '..');
const migrationsDir = 'projects/common/migrations';
const managerPath = 'projects/common/services/migration-manager.ts';
const stepBases = ['UnitTraversalMigration', 'MigrationStep'];

/** What a class is called that a default export leaves without a name. */
const NAMELESS = '(nameless class)';

const parse = (fileName, text) => ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true);
const hasModifier = (node, flag) => (ts.getCombinedModifierFlags(node) & flag) !== 0;

/**
 * What each local name of a file was imported as: its module, the name that module exports it under, and
 * whether it is a type only. `import { A as B } from 'm'` maps B to { module: 'm', exported: 'A' },
 * `import C from 'm'` maps C to { module: 'm', exported: 'default' }, and `import * as D from 'm'` maps D
 * to { module: 'm', exported: '*' }.
 */
const imports = sourceFile => new Map(sourceFile.statements
  .filter(node => ts.isImportDeclaration(node) && node.importClause)
  .flatMap(node => {
    const module = node.moduleSpecifier.text;
    const { name, namedBindings, isTypeOnly } = node.importClause;
    const bound = [];
    if (name) bound.push([name.text, { module, exported: 'default', typeOnly: isTypeOnly }]);
    if (namedBindings && ts.isNamespaceImport(namedBindings)) {
      bound.push([namedBindings.name.text, { module, exported: '*', typeOnly: isTypeOnly }]);
    }
    if (namedBindings && ts.isNamedImports(namedBindings)) {
      namedBindings.elements.forEach(element => bound.push([element.name.text, {
        module, exported: (element.propertyName || element.name).text, typeOnly: isTypeOnly || element.isTypeOnly
      }]));
    }
    return bound;
  }));

/** The name each local name of a file was exported under, for named imports: `import { A as B }` maps B to A. */
const importedNames = sourceFile => new Map([...imports(sourceFile)]
  .filter(([, { exported }]) => exported !== 'default' && exported !== '*')
  .map(([local, { exported }]) => [local, exported]));

/** The names a variable binds, also where it destructures: `const { A, b: [B] } = x` binds A and B. */
const boundNames = name => (ts.isIdentifier(name) ? [name.text] : name.elements
  .filter(element => !ts.isOmittedExpression(element))
  .flatMap(element => boundNames(element.name)));

/**
 * The names that the top-level declarations of a file bind: classes, functions, variables, types.
 * `import X = require()` is left out: the projects are ES modules, where TypeScript does not allow it.
 */
const declaredNames = sourceFile => sourceFile.statements.flatMap(node => {
  if (ts.isVariableStatement(node)) {
    return node.declarationList.declarations.flatMap(declaration => boundNames(declaration.name));
  }
  return (ts.isClassDeclaration(node) || ts.isFunctionDeclaration(node) || ts.isEnumDeclaration(node) ||
    ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isModuleDeclaration(node)) &&
    node.name && ts.isIdentifier(node.name) ? [node.name.text] : [];
});

/**
 * The file below the migrations directory that a module specifier of MigrationManager names, relative
 * to that directory and with `.ts`, or undefined. The specifier is relative or goes through the
 * `common/` alias, the two forms the projects use.
 */
function migrationFileOf(specifier) {
  let target;
  if (specifier.startsWith('.')) {
    target = path.posix.normalize(path.posix.join(path.posix.dirname(managerPath), specifier));
  } else if (specifier.startsWith('common/')) {
    target = `projects/${specifier}`;
  } else {
    return undefined;
  }
  const prefix = `${migrationsDir}/`;
  return target.startsWith(prefix) ? `${target.slice(prefix.length).replace(/\.[jt]s$/, '')}.ts` : undefined;
}

/**
 * The names a file exports a local name under apart from its declaration: `export { A as B }` gives
 * A → B, `export default A` gives A → default.
 */
const listedExports = sourceFile => sourceFile.statements.flatMap(node => {
  if (ts.isExportDeclaration(node) && !node.moduleSpecifier && node.exportClause &&
      ts.isNamedExports(node.exportClause)) {
    return node.exportClause.elements.map(element => [(element.propertyName || element.name).text, element.name.text]);
  }
  if (ts.isExportAssignment(node) && !node.isExportEquals && ts.isIdentifier(node.expression)) {
    return [[node.expression.text, 'default']];
  }
  return [];
});

/** Every source file below a directory, specs left out, as a path relative to that directory. */
const sourceFilesBelow = (dir, prefix = '') => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap(entry => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return sourceFilesBelow(path.join(dir, entry.name), relative);
    return entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts') ? [relative] : [];
  });

/**
 * The step classes below the migrations directory, exported or not: their file (relative to it), their
 * name, the names they are exported under, whether they are a default export, which is no name to
 * match, and whether a class of their own file extends them - only there can one extend a class that is
 * not exported by name.
 */
function findStepClasses() {
  const dir = path.join(root, migrationsDir);
  const classes = sourceFilesBelow(dir).flatMap(file => {
    const sourceFile = parse(file, fs.readFileSync(path.join(dir, file), 'utf8'));
    const imported = importedNames(sourceFile);
    const listed = listedExports(sourceFile);
    return sourceFile.statements
      .filter(node => ts.isClassDeclaration(node))
      .map(node => {
        /* Only a default export may leave its class without a name. */
        const className = node.name ? node.name.text : NAMELESS;
        const exportModifier = hasModifier(node, ts.ModifierFlags.Export);
        const defaultModifier = hasModifier(node, ts.ModifierFlags.Default);
        const listedNames = listed.filter(([local]) => local === className).map(([, name]) => name);
        return {
          file,
          className,
          exportedAs: [
            ...(exportModifier && !defaultModifier ? [className] : []),
            ...listedNames.filter(name => name !== 'default')
          ],
          defaultExport: (exportModifier && defaultModifier) || listedNames.includes('default'),
          abstract: hasModifier(node, ts.ModifierFlags.Abstract),
          bases: (node.heritageClauses || []).flatMap(clause => clause.types
            .map(type => imported.get(type.expression.getText()) || type.expression.getText()))
        };
      });
  });

  /* A class is a step once one of its bases is: repeated until no class is added, for chains of any
     length. It is the class that is a step, not its name, so neither a class that only shares a step's
     name nor every nameless class becomes one (#1697); a nameless class cannot be a base anyway. */
  const stepClasses = new Set();
  const stepKinds = new Set(stepBases);
  let grown = true;
  while (grown) {
    grown = false;
    classes
      .filter(cls => !stepClasses.has(cls) && cls.bases.some(base => stepKinds.has(base)))
      .forEach(cls => {
        stepClasses.add(cls);
        [cls.className, ...cls.exportedAs].filter(name => name !== NAMELESS).forEach(name => stepKinds.add(name));
        grown = true;
      });
  }
  return classes
    .filter(cls => stepClasses.has(cls) && !cls.abstract && !stepBases.includes(cls.className))
    .map(({ abstract, bases, ...step }) => ({
      ...step,
      isBase: classes.some(other => other.file === step.file && other.bases.includes(step.className))
    }));
}

/**
 * The names a step is matched by: those it is exported under, or, exported under none, its class name,
 * which the check asks it to be exported under (#1697).
 */
const namesOf = ({ className, exportedAs }) => {
  if (exportedAs.length) return exportedAs;
  return className === NAMELESS ? [] : [className];
};

/**
 * What keeps steps from being matched against MigrationManager, which goes by name: a step not
 * exported by name, and a name two steps share. Each with the files it concerns (#1693).
 */
function stepProblems(steps) {
  const filesByName = new Map();
  steps.forEach(step => namesOf(step)
    .forEach(name => filesByName.set(name, [...(filesByName.get(name) || []), step.file])));
  return [
    ...steps.filter(({ exportedAs }) => exportedAs.length === 0).map(({
      file, className, defaultExport, isBase
    }) => ({
      files: [file],
      message: `${className} (${file}) is ${defaultExport ? 'a default export' : 'not exported'} - ${isBase ?
        'other steps extend it: declare it abstract if it is only their base, or export it by name' :
        `write it as \`export class ${className === NAMELESS ? '<name>' : className}\``}`
    })),
    ...[...filesByName].filter(([, files]) => files.length > 1).map(([name, files]) => ({
      files,
      message: `${name} is the name of a step in ${files.join(' and ')} - give each step a name of its own`
    }))
  ];
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
 * How the parsed MigrationManager holds the step `exportedName` of `importPath`: `localName` if it imports
 * it already, from its own file, possibly under another name and through the path alias -
 * `common/migrations/x` names the same file as `../migrations/x`. Otherwise `clash` says what holds the
 * name, if anything does: an import from another module or a declaration of the manager itself, beside
 * which a second import would not compile (#1697). An import as a type is no import of the step: `new`
 * needs a value. Throws if `importPath` is no file below the migrations directory.
 */
function stepBinding(manager, exportedName, importPath) {
  const stepFile = migrationFileOf(importPath);
  if (!stepFile) throw new Error(`${importPath} is no file below ${migrationsDir}`);
  const imported = [...imports(manager)];
  const localName = imported.find(([, { module, exported, typeOnly }]) => exported === exportedName &&
    !typeOnly && migrationFileOf(module) === stepFile)?.[0];
  if (localName) return { localName };
  const other = imported.find(([local]) => local === exportedName);
  if (other) {
    const { module, typeOnly } = other[1];
    return { clash: `MigrationManager already imports ${exportedName} from ${module}${typeOnly ? ' as a type' : ''}` };
  }
  if (declaredNames(manager).includes(exportedName)) {
    return { clash: `MigrationManager declares ${exportedName} itself` };
  }
  return {};
}

/**
 * What keeps MigrationManager from importing the step `exportedName` of `importPath` under that name, or
 * undefined - asked by the generator before it writes anything.
 */
const registrationClash = (managerText, exportedName, importPath) => stepBinding(
  parse(managerPath, managerText), exportedName, importPath
).clash;

/**
 * MigrationManager with the step `exportedName` from `importPath` appended to `steps`, its import
 * added unless it is there already. The places come from the syntax tree, so a trailing comma, a
 * multi-line import or the indentation do not matter; the line ending is taken from the file. The text
 * comes back as it is if `steps` constructs the step already, through the import of its own file.
 * Throws if there is no `steps` array with an entry to append to, or if the name is taken.
 */
function registerStep(managerText, exportedName, importPath) {
  const manager = parse(managerPath, managerText);
  const steps = findStepsArray(manager);
  if (!steps || steps.elements.length === 0) {
    throw new Error(`Found no entry in MigrationManager.steps in ${managerPath} to append to`);
  }
  const eol = managerText.includes('\r\n') ? '\r\n' : '\n';
  const { localName, clash } = stepBinding(manager, exportedName, importPath);
  if (clash) throw new Error(clash);
  const constructed = new Set(steps.elements
    .filter(element => ts.isNewExpression(element))
    .map(element => element.expression.getText()));
  if (localName && constructed.has(localName)) return managerText;

  const lastStep = steps.elements[steps.elements.length - 1];
  const lineStart = managerText.lastIndexOf('\n', lastStep.getStart(manager)) + 1;
  const indent = managerText.slice(lineStart, lastStep.getStart(manager));
  /* Inserted right after the last entry: an existing trailing comma then follows the new one. */
  const edits = [{ at: lastStep.getEnd(), text: `,${eol}${indent}new ${localName || exportedName}()` }];

  if (!localName) {
    /* After the import of the last registered step, so that the step imports stay together. */
    const importDeclarations = manager.statements.filter(node => ts.isImportDeclaration(node));
    const stepImports = importDeclarations.filter(node => node.importClause && node.importClause.namedBindings &&
      ts.isNamedImports(node.importClause.namedBindings) &&
      node.importClause.namedBindings.elements.some(element => constructed.has(element.name.text)));
    const after = (stepImports.length ? stepImports : importDeclarations).pop();
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
  root,
  migrationsDir,
  managerPath,
  findStepClasses,
  stepProblems,
  registeredSteps,
  registrationClash,
  registerStep,
  loadUnitVersion
};
