const which = require('which');
const { cmd } = require('./utils');

class Client {
  installPrettier() {
    cmd('npm install --dev prettier');
  }
}

module.exports = Client;
