#!/usr/bin/env node
/**
 * Rebuilds projects/editor/src/app/modules/properties-panel/properties-panel.baseline.ts from
 * the output of the (normally skipped) "baseline regeneration" group in
 * properties-panel.characterization.spec.ts.
 *
 *   node scripts/panel-baseline-from-log.js <test-output-file>
 *
 * Why a script and not a vitest snapshot: the @angular/build:unit-test builder compiles specs into
 * a fresh dist/test-out/<timestamp>/ directory, so .snap files never persist between runs and
 * could never fail a build. The baseline is therefore a committed TypeScript file, and the tests
 * that produce it only have the browser console to hand it over.
 */
const { readFileSync, writeFileSync } = require('node:fs');

const BASELINE_PATH =
  'projects/editor/src/app/modules/properties-panel/properties-panel.baseline.ts';

const HEADER = `/**
 * Generated baseline for \`properties-panel.characterization.spec.ts\` — one entry per
 * (element type, expert mode, selection), holding the controls the panel renders as readable text.
 *
 * The \`multi-\` entries describe a selection of two elements of the same type whose booleans all
 * disagree. Every such property merges to null, which the panel renders as an unchecked box.
 *
 * Do NOT hand-edit to make a failing test pass. A diff here means the panel now shows something
 * different; either that change is intended — then regenerate and review the diff as part of the
 * change — or it is a regression.
 *
 * Regenerate: see the doc comment on the \`baseline regeneration\` group in the spec.
 */
/* eslint-disable max-len */
export const PANEL_BASELINE: Record<string, string> = {
`;

const logPath = process.argv[2];
if (!logPath) {
  console.error('usage: node scripts/panel-baseline-from-log.js <test-output-file>');
  process.exit(1);
}

const lines = readFileSync(logPath, 'utf8').split('\n');
const entries = new Map();
let key = null;
let body = [];

lines.forEach(line => {
  const start = line.match(/^<<<ENTRY (.+)$/);
  if (start) {
    key = start[1].trim();
    body = [];
    return;
  }
  if (key === null) return;
  if (line.trim() === 'ENTRY>>>') {
    entries.set(key, body.join('\n'));
    key = null;
    return;
  }
  body.push(line);
});

if (entries.size === 0) {
  console.error('No entries found. Is the "baseline regeneration" group still skipped?');
  process.exit(1);
}

const escape = value => value
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$\{/g, '\\${');

const body_ = [...entries.keys()]
  .sort()
  .map(name => `  '${name}': \`${escape(entries.get(name))}\``)
  .join(',\n\n');

writeFileSync(BASELINE_PATH, `${HEADER}${body_}\n};\n`);
console.log(`${entries.size} Einträge nach ${BASELINE_PATH} geschrieben`);
