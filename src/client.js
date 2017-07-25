'use strict';
const which = require('which');
const { set } = require('lodash/fp');
const { cmd, isDirectory } = require('./utils');
const { modifyJson } = require('./utils');

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
      which('git')
    } catch (error) {
      return false;
    }

    return isDirectory('.git');
  }

  installPrettier(command) {
    return cmd(command);
  }

  addPrettierCommand() {
    return modifyJson('package.json',
      set('scripts.prettier', 'prettier --write **/*.js'));
  }

  runPrettier(command) {
    return cmd(command);
  }

  commitChanges() {
    return cmd('git commit --all --edit --message "Installed prettier"')
  }
}

module.exports = Client;
