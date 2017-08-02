'use strict';
const { last } = require('lodash/fp');
const { defineSupportCode } = require('cucumber');
const { expect } = require('chai');

defineSupportCode(({ When, Then }) => {
  Then('installer must print {stringInDoubleQuotes}', function (message) {
    expect(this.stdout.buffer).to.have.string(message);
  });

  Then('installer must print:', function (message) {
    expect(this.stdout.buffer).to.have.string(message);
  });

  Then('installer must ask:', function (message) {
    expect(this.stdout.buffer).to.have.string(message);
  });

  When('I answer {stringInDoubleQuotes}', async function (answer) {
    this.stdin.write(answer);

    await last(this.feedback.prompt.returnValues)
  })
});
