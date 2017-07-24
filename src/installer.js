'use strict';

class Installer {
  constructor(client) {
    this.client = client;
  }

  async run() {
    const useYarn = await this.client.detectYarn();
    const useGit = await this.client.detectGit();

    await this.client.installPrettier(
      useYarn
        ? 'yarn add --dev prettier'
        : 'npm install -D prettier'
    );

    await this.client.runPrettier(
      useYarn
        ? 'yarn prettier'
        : 'npm run prettier'
    )

    if (useGit) {
      await this.client.commitChanges();
    }
  }
}

module.exports = Installer;
