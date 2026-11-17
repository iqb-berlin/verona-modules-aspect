/*
 * Checks that every migration step is registered in MigrationManager, and is run by `npm run lint`. A
 * step missing from `MigrationManager.steps` never runs on any unit, and no spec notices: the specs run
 * in a browser and cannot list the migrations directory (#1678).
 *
 * What counts as a step and as registered is decided in migration-steps.js, from the syntax tree, so a
 * comment or a helper class next to a step changes nothing.
 */
const fs = require('fs');
const path = require('path');
const {
  root, migrationsDir, managerPath, findStepClasses, stepProblems, registeredSteps
} = require('./migration-steps');

const steps = findStepClasses();
const registered = registeredSteps(fs.readFileSync(path.join(root, managerPath), 'utf8'));

if (!steps.length) {
  console.error(`Found no migration step in ${migrationsDir}: has the way a step is declared changed?`);
  process.exitCode = 1;
}
stepProblems(steps).forEach(({ message }) => {
  console.error(message);
  process.exitCode = 1;
});
steps
  .filter(({ exportedAs }) => exportedAs.length > 0 && !exportedAs.some(name => registered.has(name)))
  .forEach(({ file, className }) => {
    console.error(`${className} (${file}) is not registered in MigrationManager.steps in ${managerPath}`
      + ' - register it, or declare it abstract if it is a base for other steps');
    process.exitCode = 1;
  });
