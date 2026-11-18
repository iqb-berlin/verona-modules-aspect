#!/usr/bin/env node
/**
 * Rebuilds projects/editor/modules/rich-text-editor/rich-text-roundtrip.baseline.json from the output of
 * the (normally skipped) "baseline regeneration" group in rich-text-roundtrip.characterization.spec.ts.
 *
 *   node scripts/rich-text-baseline-from-log.js <test-output-file>
 *
 * Why a script and not a vitest snapshot: see scripts/panel-baseline-from-log.js.
 */
const { readFileSync, writeFileSync } = require('node:fs');

const BASELINE_PATH = 'projects/editor/modules/rich-text-editor/rich-text-roundtrip.baseline.json';

const logPath = process.argv[2];
if (!logPath) {
  console.error('usage: node scripts/rich-text-baseline-from-log.js <test-output-file>');
  process.exit(1);
}

/* The forwarded console arrives with whatever colour codes the reporter added. */
const ANSI = /\u001b\[[0-9;]*m/g;
const log = readFileSync(logPath, 'utf8').replace(ANSI, '');

const announced = log.match(/<<<BASELINE (\d+)>>>/);
if (!announced) {
  console.error('No baseline found. Is the "baseline regeneration" group still skipped?');
  process.exit(1);
}

const chunks = [];
for (const [, index, text] of log.matchAll(/<<<CHUNK (\d+)>>>([\s\S]*?)<<<END>>>/g)) chunks[Number(index)] = text;
if (chunks.length !== Number(announced[1]) || chunks.includes(undefined)) {
  console.error(`Incomplete: ${chunks.filter(chunk => chunk !== undefined).length} of ${announced[1]} chunks.`);
  process.exit(1);
}

const baseline = JSON.parse(chunks.join(''));
writeFileSync(BASELINE_PATH, `${JSON.stringify(baseline, null, 2)}\n`);
const texts = Object.values(baseline.texts).reduce((count, group) => count + Object.keys(group).length, 0);
console.log(`${texts} Texte nach ${BASELINE_PATH} geschrieben`);
