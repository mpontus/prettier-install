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
});
