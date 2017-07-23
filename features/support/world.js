const chai = require('chai');
const sinonChai = require('sinon-chai');
const { defineSupportCode } = require('cucumber');
const { spy, createStubInstance } = require('sinon');
const Client = require('../../src/client');
const Installer = require('../../src/installer');

chai.use(sinonChai);

defineSupportCode(({ setWorldConstructor, Before, After }) => {
  setWorldConstructor(function () {
    this.client = createStubInstance(Client);
    this.installer = new Installer(this.client);
  });

  Before(function () {
    const { client } = this;

    client.installPrettier.onCall().resolves(true);
    spy(client.installsPrettier);
  });
})
