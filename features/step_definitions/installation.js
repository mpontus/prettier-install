'use strict';
const { defineSupportCode } = require('cucumber');
const { expect } = require('chai');

defineSupportCode(({ Given, When, Then }) => {
  Given('yarn is present on the system', function () {
    this.client.detectYarn.resolves(true);
  });

  Given('the project is git controlled', function () {
    this.client.detectGit.resolves(true);
  });

  When('I run prettier-install', function () {
    return this.installer.run();
  });

  Then(/^prettier must be installed using "([^"]+)"$/, function (cmd) {
    expect(this.client.installPrettier).to.have.been.calledWith(cmd);
  });

  Then('changes must be committed', function () {
    expect(this.client.commitChanges).to.have.been.called;
  });

  Then(/^prettier must run using "([^"]+)"$/, function (cmd) {
    expect(this.client.runPrettier).to.have.been.calledWith(cmd);
  });

  Then('prettier script must be added to package.json', function () {
    expect(this.client.addPrettierCommand).to.have.been.called;
  });

  Then(/^I must be told "([^"]+)"$/, function (message) {
    expect(this.feedback.messages).to.have.string(message);
  })
});
