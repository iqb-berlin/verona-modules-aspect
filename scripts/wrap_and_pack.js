#!/usr/bin/env node

const fs = require('fs');
const childProcess = require('child_process');

const packageName = process.argv[2];
const packageVersion = process.argv[3];
const wrapperPath = process.argv[4];

childProcess.fork('node_modules/iqb-dev-components/src/js_css_packer.js',
  ['dist', packageName, 'dist']);

const fileContent = fs.readFileSync(wrapperPath, 'utf8').toString();
fs.writeFileSync('dist/index.html', fileContent, 'utf8');

const targetFileName = `${packageName}-${packageVersion}.html`;
childProcess.fork('node_modules/iqb-dev-components/src/distpacker.js',
  ['dist', targetFileName]);
