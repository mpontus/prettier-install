'use strict';
const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require("chai-as-promised");
const { defineSupportCode } = require('cucumber');
const { spy, createStubInstance } = require('sinon');
const { Writable, Transform } = require('stream');
const Client = require('../../src/client');
const Feedback = require('../../src/feedback');
const Options = require('../../src/options');
const Installer = require('../../src/installer');

chai.use(sinonChai);
chai.use(chaiAsPromised);

class FeedbackMock {
  constructor() {
    this.buffer = '';
  }

  say(message) {
    this.buffer += `${message}\n`;
  }

  setRawMode() {}
}

class StdoutMock extends Writable {
  constructor(options) {
    super(options);

    this.buffer = '';
  }

  _write(data, encoding, callback) {
    this.buffer += `${data}\n`;

    callback();
  }
}

class StdinMock extends Transform {
  _transform(data, encoding, callback) {
    this.push(data);

    callback();
  }

  setRawMode() {}
}

defineSupportCode(({ setWorldConstructor, Before, After }) => {
  setWorldConstructor(function () {
    this.stdout = new StdoutMock();
    this.stdin = new StdinMock();

    this.client = createStubInstance(Client);
    this.feedback = new Feedback(this.stdin, this.stdout);
    this.installer = new Installer(this.client, this.feedback);
  });

  Before(function () {
    const { client, feedback } = this;

    spy(client.detectYarn);
    client.detectYarn.returns(new Promise((resolve, reject) => {
      Object.assign(client.detectYarn, { resolve, reject });
    }));

    spy(client.detectGit);
    client.detectGit.returns(new Promise((resolve, reject) => {
      Object.assign(client.detectGit, { resolve, reject });
    }));

    spy(client.detectUncommittedChanges);
    client.detectUncommittedChanges.returns(new Promise((resolve, reject) => {
      Object.assign(client.detectUncommittedChanges, { resolve, reject });
    }));

    spy(client.installPrettier);
    client.installPrettier.returns(new Promise((resolve, reject) => {
      Object.assign(client.installPrettier, { resolve, reject });
    }));

    spy(client.addPrettierCommand);
    client.addPrettierCommand.returns(new Promise((resolve, reject) => {
      Object.assign(client.addPrettierCommand, { resolve, reject });
    }));

    spy(client.runPrettier);
    client.runPrettier.returns(new Promise((resolve, reject) => {
      Object.assign(client.runPrettier, { resolve, reject });
    }));

    spy(client.commitChanges);
    client.commitChanges.returns(new Promise((resolve, reject) => {
      Object.assign(client.commitChanges, { resolve, reject });
    }));

    spy(feedback, 'prompt');
  });
})
