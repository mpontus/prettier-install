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

    spy(client.detectYarn);
    client.detectYarn.returns(new Promise((resolve, reject) => {
      Object.assign(client.detectYarn, { resolve, reject });
    }));

    spy(client.detectGit);
    client.detectGit.returns(new Promise((resolve, reject) => {
      Object.assign(client.detectGit, { resolve, reject });
    }));

    spy(client.installPrettier);
    client.installPrettier.returns(new Promise((resolve, reject) => {
      Object.assign(client.installPrettier, { resolve, reject });
    }));

    spy(client.addPrettierCommand);
    client.addPrettierCommand.returns(new Promise((resolve, reject) => {
      Object.assign(client.addPrettierCommand, { resolve, reject });
    }));

    spy(client.writePrettierRc);
    client.writePrettierRc.returns(new Promise((resolve, reject) => {
      Object.assign(client.writePrettierRc, { resolve, reject });
    }));

    spy(client.runPrettier);
    client.runPrettier.returns(new Promise((resolve, reject) => {
      Object.assign(client.runPrettier, { resolve, reject });
    }));

    spy(client.commitChanges);
    client.commitChanges.returns(new Promise((resolve, reject) => {
      Object.assign(client.commitChanges, { resolve, reject });
    }));
  });
})
