class Installer {
  constructor(client) {
    this.client = client;
  }

  async run() {
    const useYarn = await this.client.detectYarn();
    const useGit = await this.client.detectGit();

    this.client.installPrettier(
      useYarn
        ? 'yarn add --dev prettier'
        : 'npm install -D prettier'
    );

    if (useGit) {
      this.client.commitChanges();
    }
  }
}

module.exports = Installer;
