#!/usr/bin/env node

const fs = require('fs');
const childProcess = require('child_process');

function readPackageName() {
  const packageJsonData = JSON.parse(fs.readFileSync(`${process.cwd()}/package.json`).toString());
  return packageJsonData.name;
}

function readPackageVersion() {
  const packageJsonData = JSON.parse(fs.readFileSync(`${process.cwd()}/package.json`).toString());
  return packageJsonData.version;
}

childProcess.fork('node_modules/iqb-dev-components/src/js_css_packer.js',
  ['dist', readPackageName(), 'dist']);

const fileContent = fs.readFileSync('wrapper/index.html', 'utf8').toString();
fs.writeFileSync('dist/index.html', fileContent, 'utf8');

const targetFileName = `${readPackageName()}-${readPackageVersion()}.html`;
childProcess.fork('node_modules/iqb-dev-components/src/distpacker.js',
  ['dist', targetFileName]);
