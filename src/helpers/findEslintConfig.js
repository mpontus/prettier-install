import { promisify } from 'util';
import fs from 'fs';

const fileExists = filename =>
  promisify(fs.access)(filename)
    .then(() => true, () => false)

const jsonFileHasSection = section => filename =>
  promisify(fs.readFile)(filename)
    .then(contents => section in JSON.parse(contents));

const files = [
  '.eslintrc.js',
  '.eslintrc.yaml',
  '.eslintrc.yml',
  '.eslintrc.json',
  '.eslintrc',
  'package.json',
];

const tests = {
  '.eslintrc.js': [fileExists],
  '.eslintrc.yaml': [fileExists],
  '.eslintrc.yml': [fileExists],
  '.eslintrc.json': [fileExists],
  '.eslintrc': [fileExists],
  'package.json': [fileExists, jsonFileHasSection('eslintConfig')],
};

const runTests = async (filename) => {
  for (let test of tests[filename]) {
    if (!await test(filename)) {
      return false;
    }
  }

  return true;
}

const findEslintConfig = async function () {
  for (let filename of files) {
    if (await runTests(filename)) {
      return filename;
    }
  }

  return null;
}

export default findEslintConfig;
