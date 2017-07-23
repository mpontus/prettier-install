const which = require('which');
const { cmd, isDirectory } = require('./utils');

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

  commitChanges() {
    cmd('git commit --all --edit --message "Installed prettier"')
  }
}

module.exports = Client;
