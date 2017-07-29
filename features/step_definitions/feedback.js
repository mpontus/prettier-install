'use strict';
const { defineSupportCode } = require('cucumber');
const { expect } = require('chai');

defineSupportCode(({ When, Then }) => {
  Then('installer must print {stringInDoubleQuotes}', function (message) {
    expect(this.feedback.messages).to.have.string(message);
  });

  Then('installer must print:', function (message) {
    expect(this.feedback.messages).to.have.string(message);
  });
});
