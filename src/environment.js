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
    const fileExists = async (filename) => {
      const result = await promisify(access)(filename)
        .then(() => true, () => false);
      return result;
    }

    const jsonFileHasSection = section => async (filename) => {
      const contents = await promisify(readFile)(filename);
      const json = JSON.parse(contents);
      const result = section in json;

      return result;
    }

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
      (next, path) => {
        return () => {
          return tests[path].reduceRight(
            (next, pred) => {
              return () => {
                return pred(path).then(result => {
                  return result && next();
                });
              };
            },
            () => Promise.resolve(true),
          )().then(result => result ? path : next());
        };
      },
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
