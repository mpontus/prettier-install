'use strict';
const { promisify } = require('util');
const fs = require('fs');
const which = promisify(require('which'));
const { set } = require('lodash/fp');
const yaml = require('js-yaml');
const { cmd, fileExists, directoryExists, readJson, modifyJson } = require('./utils');
const injectPrettierExtras = require('./eslint-update-config');
const updateEslintrcJs = require('./ast-eslintrc');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

class Client {
  async detectYarn() {
    try {
      await which('yarn');

      return true;
    } catch (error) {
      return false;
    }
  }

  async detectGit() {
    try {
      await which('git');
    } catch (error) {
      return false;
    }

    return directoryExists('.git');
  }

  async detectEslint() {
    const packageJson = await readJson('package.json');
    const { dependencies, devDependencies } = packageJson;
    const allDependencies = Object.assign({}, dependencies, devDependencies);

    return 'eslint' in allDependencies;
  }

  async detectUncommittedChanges() {
    try {
      await cmd('git diff-index --quiet HEAD --');

      return false;
    } catch (error) {
      return true;
    }
  }

  installDevDependencies(packager, dependencies) {
    const args = dependencies.join(' ');

    switch (packager) {
      case 'npm': return cmd(`npm install --save-dev ${args}`);
      case 'yarn': return cmd(`yarn add --dev ${args}`);
      default: throw new Exception(`Invalid packager: ${packager}`);
    }
  }

  installPrettier(packager) {
    return this.installDevDependencies(packager, ['prettier']);
  }

  async installEslintExtras(packager) {
    await this.installDevDependencies(packager, [
      'eslint-config-prettier',
      'eslint-plugin-prettier',
    ]);

    return this.updateEslintConfig();
  }

  async updateEslintConfig() {
    if (await fileExists('.eslintrc.yaml')) {
      return this.updateEslintrcYaml();
    }

    if (await fileExists('.eslintrc.json')) {
      return this.updateEslintrcJson();
    }

    if (!await fileExists('.eslintrc.js')) {
      await this.createEslintrcJs();
    }

    return this.updateEslintrcJs();
  }

  async updateEslintrcYaml() {
    const text = await readFile('.eslintrc.yaml', 'utf8');
    const doc = yaml.safeLoad(text);
    const newDoc = injectPrettierExtras(doc);
    const newText = yaml.safeDump(newDoc);

    return writeFile('.eslintrc.yaml', newText);
  }

  updateEslintrcJson() {
    return modifyJson('.eslintrc.json', injectPrettierExtras);
  }

  createEslintrcJs() {
    const contents = 'module.exports = {};';

    return writeFile('.eslintrc.js', contents);
  }

  async updateEslintrcJs() {
    const text = await readFile('.eslintrc.js');
    const newText = updateEslintrcJs(text);

    return writeFile('.eslintrc.js', newText);
  }

  addPrettierCommand(args) {
    return modifyJson('package.json',
      set('scripts.prettier', `prettier --write ${args}`));
  }

  runPrettier(command) {
    return cmd(command);
  }

  commitChanges() {
    return cmd('git commit --all --edit --message "Installed prettier"')
  }
}

module.exports = Client;
