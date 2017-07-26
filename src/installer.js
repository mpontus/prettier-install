'use strict';

class Installer {
  constructor(client, feedback) {
    this.client = client;
    this.feedback = feedback;
  }

  async run() {
    const useYarn = await this.client.detectYarn();

    if (useYarn) {
      this.feedback.say('Yarn detected');
    } else {
      this.feedback.say('NPM detected');
    }

    const useGit = await this.client.detectGit();

    await this.client.installPrettier(
      useYarn
        ? 'yarn add --dev prettier'
        : 'npm install -D prettier'
    );

    await this.client.addPrettierCommand();

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
