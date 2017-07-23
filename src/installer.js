class Installer {
  constructor(client) {
    this.client = client;
  }

  run() {
    this.client.installPrettier();
  }
}

module.exports = Installer;
