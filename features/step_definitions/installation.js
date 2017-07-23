const { defineSupportCode } = require('cucumber');
const { expect } = require('chai');

defineSupportCode(({ Given, When, Then }) => {
  When('I run prettier-install', function () {
    return this.installer.run();
  });

  Then('prettier must be installed', function () {
    expect(this.client.installPrettier).to.have.been.calledOnce;
  });
})
