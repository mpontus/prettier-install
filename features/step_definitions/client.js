'use strict';
const { defineSupportCode } = require('cucumber');
const { expect } = require('chai');

defineSupportCode(({ When, Then }) => {
  When('yarn is found', function () {
    this.client.detectYarn.resolve(true);
  });

  When('yarn is not found', function () {
    this.client.detectYarn.resolve(false)

    return this.client.detectYarn();
  });

  When('project is under git control', function () {
    this.client.detectGit.resolve(true);

    return this.client.detectGit();
  });

  When('project is not under git control', function () {
    this.client.detectGit.resolve(false);

    return this.client.detectGit();
  });

  When('there are no uncommitted changes', function () {
    this.client.detectUncommittedChanges.resolve(false);

    return this.client.detectUncommittedChanges();
  });

  When('there are uncommited changes', function () {
    this.client.detectUncommittedChanges.resolve(true);

    return this.client.detectUncommittedChanges();
  });

  When('prettier has been installed successfully', function () {
    this.client.installPrettier.resolve();

    return this.client.installPrettier();
  });

  When('prettier installation failed', function () {
    this.client.installPrettier.reject(new Error('foo'));

    return this.client.installPrettier().catch();
  });

  When('prettier script is added successfully', function () {
    this.client.addPrettierCommand.resolve();

    return this.client.addPrettierCommand();
  });

  When('prettier script could not be added', function () {
    this.client.addPrettierCommand.reject(new Error('foo'));

    return this.client.addPrettierCommand().catch();
  });

  When('.prettierrc was successfully written', function () {
    this.client.writePrettierRc.resolve();

    return this.client.writePrettierRc();
  });

  When('.prettierrc has failed to write', function () {
    this.client.writePrettierRc.reject(new Error('foo'));

    return this.client.writePrettierRc().catch();
  });

  When('prettier script has finished successfully', function () {
    this.client.runPrettier.resolve();

    return this.client.runPrettier();
  });

  When('prettier script exitted with an error', function () {
    this.client.addPrettierCommand.reject(new Error('foo'));

    return this.client.addPrettierCommand().catch();
  });

  When('git finished successfully', function () {
    this.client.commitChanges.resolve();

    return this.client.addPrettierCommand();
  });

  When('git exitted with an error', function () {
    this.client.addPrettierCommand.reject(new Error('foo'));

    return this.client.addPrettierCommand().catch();
  });

  Then('prettier must be installed with {stringInDoubleQuotes}', function (cmd) {
    expect(this.client.installPrettier).to.have.been.calledWith(cmd);
  });

  Then('prettier script must be added with arguments:',
    function (string) {
      const args = string.split('\n').join(' ');

      expect(this.client.addPrettierCommand).to.have.been.calledWith(args);
    }
  );

  Then('prettier script must be added with arguments {stringInDoubleQuotes}',
    function (string) {
      const args = string.split('\n').join(' ');

      expect(this.client.addPrettierCommand).to.have.been.calledWith(args);
    }
  );

  Then('.prettierrc must be updated with options:', function (string) {
    const expected = JSON.parse(string);

    expect(this.client.writePrettierRc).to.have.been.calledWith(expected);
  });

  Then('prettier script must be executed', function () {
    expect(this.client.runPrettier).to.have.been.called;
  });

  Then('changes must be committed', function () {
    expect(this.client.commitChanges).to.have.been.called;
  });
});
