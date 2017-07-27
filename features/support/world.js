'use strict';
const chai = require('chai');
const sinonChai = require('sinon-chai');
const { defineSupportCode } = require('cucumber');
const { spy, createStubInstance } = require('sinon');
const Client = require('../../src/client');
const Options = require('../../src/options');
const Installer = require('../../src/installer');

chai.use(sinonChai);

class FeedbackMock {
  constructor() {
    this.messages = '';
  }

  say(message) {
    this.messages += `${message}\n`;
  }
}

defineSupportCode(({ setWorldConstructor, Before, After }) => {
  setWorldConstructor(function () {
    this.client = createStubInstance(Client);
    this.feedback = new FeedbackMock();
    this.installer = new Installer(this.client, this.feedback, this.options);
  });

  Before(function () {
    const { client } = this;

    spy(client.installsPrettier);
    client.detectYarn.resolves(false);

    spy(client.commitChanges);
    client.detectGit.resolves(false);
  });
})
