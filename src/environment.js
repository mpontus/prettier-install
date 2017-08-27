// TODO: try fs-extra
import R from 'ramda';
import { promisify } from 'util';
import { access, readFile, readDir } from 'fs';

export default class Environment {
  async getProjectDependencies() {
    const projectMetadataContents = await promisify(readFile)('package.json', 'utf-8');
    const projectMetadata = JSON.parse(projectMetadataContents);
    const { dependencies, devDependencies } = projectMetadata;

    return Object.assign({}, dependencies, devDependencies);
  }

  getInstalledModules() {
    return promisify(readDir)('node_modules');
  }

  getPackageScripts() {

  }

  pathExists() {

  }

  findExecutable() {

  }

  isCleanWorkingTree() {

  }

  findEslintrc() {
    const fileExists = filename =>
      promisify(access)(filename)
        .then(() => true, () => false)

    const jsonFileHasSection = section => filename =>
      promisify(readFile)(filename)
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

    return files.reduceRight(
      (next, path) => () => tests[path].reduceRight(
          (next, pred) => () => pred(path)
            .then(result => result && next()),
          () => Promise.resolve(true),
        )().then(result => result ? path : next()),
      () => Promise.resolve(null),
    )();
  }

  eslintPresets() {
  }

  eslintPlugins() {

  }

  eslintRules() {

  }
}
