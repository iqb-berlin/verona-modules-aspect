#!/usr/bin/env node

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const execSync = require('child_process').execSync;

const packageName = process.argv[2];
const packageVersion = process.argv[3];
const wrapperPath = process.argv[4];

execSync(`node node_modules/iqb-dev-components/src/js_css_packer.js dist ${packageName} dist`);
const fileContent = fs.readFileSync(wrapperPath, 'utf8').toString()
  .replace(/version-placeholder/g, packageVersion);
fs.writeFileSync('dist/index.html', fileContent, 'utf8');

const targetFileName = `iqb-${packageName}-aspect-${packageVersion}.html`;
execSync(`node scripts/distpacker.js dist ${targetFileName} ${packageName}`);
