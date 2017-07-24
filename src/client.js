'use strict';
const which = require('which');
const { set } = require('lodash/fp');
const { cmd, isDirectory } = require('./utils');

const addPrettierCommand = set('scripts.prettier', 'prettier --write **/*.js');

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
    cmd(command);
  }

  addPrettierCommand() {
    modifyJson('./package.json', addPrettierCommand);
  }

  runPrettier(command) {
    cmd(command);
  }

  commitChanges() {
    cmd('git commit --all --edit --message "Installed prettier"')
  }
}

module.exports = Client;

Object.assign(module.exports, {
  addPrettierCommand,
});
