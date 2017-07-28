'use strict';

class Installer {
  constructor(client, feedback) {
    this.client = client;
    this.feedback = feedback;
  }

  async run(options) {
    const glob = options.getGlobPatterns();
    const useYarn = await this.client.detectYarn();

    if (useYarn) {
      this.feedback.say('Yarn detected');
    } else {
      this.feedback.say('NPM detected');
    }

    const useGit = await this.client.detectGit();

    if (useGit) {
      this.feedback.say('Git detected');
    }

    this.feedback.say('Installing prettier');

    await this.client.installPrettier(
      useYarn
        ? 'yarn add --dev prettier'
        : 'npm install -D prettier'
    );

    this.feedback.say('Adding prettier script');

    await this.client.addPrettierCommand(
      glob.length ? glob.join(' ') : undefined
    );

    this.feedback.say('Running prettier');

    await this.client.runPrettier(
      useYarn
        ? 'yarn prettier'
        : 'npm run prettier'
    )

    if (useGit) {
      this.feedback.say('Committing changes');

      await this.client.commitChanges();
    }
  }
}

module.exports = Installer;
