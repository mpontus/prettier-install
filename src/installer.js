'use strict';

class Installer {
  constructor(client, feedback) {
    this.client = client;
    this.feedback = feedback;
  }

  async run(options) {
    const glob = options.getGlobPatterns();
    const prettierArguments = options.getPrettierArguments();
    const useYarn = await this.client.detectYarn();

    if (useYarn) {
      this.feedback.say('Yarn detected');
    } else {
      this.feedback.say('NPM detected');
    }

    const useGit = await this.client.detectGit();

    if (useGit) {
      this.feedback.say('Git detected');

      const uncommittedChanges = await this.client.detectUncommittedChanges();

      if (uncommittedChanges) {
        const proceedAnyway = await this.feedback.prompt(
          'Working tree contains uncommitted changes. Proceed anyway?',
        );

        if (!proceedAnyway) {
          this.feedback.say('Aborting');

          throw new Error('Aborting due to uncommitted changes.');
        }
      }
    }

    this.feedback.say('Installing prettier');

    await this.client.installPrettier(useYarn ? 'yarn' : 'npm');

    this.feedback.say('Adding prettier script');

    await this.client.addPrettierCommand(
      [prettierArguments].concat(
        glob.length ? glob : ['**/*.js']
      ).filter(Boolean).join(' ')
    );

    if (await this.client.detectEslint()) {
      this.feedback.say('Integrating eslint');

      await this.client.installEslintExtras(useYarn ? 'yarn' : 'npm');
    }

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
