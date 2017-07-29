'use strict';
const { defineSupportCode } = require('cucumber');
const { expect } = require('chai');
const Options = require('../../src/options');

function noop() {};

defineSupportCode(({ Given, When, Then }) => {
  When('I run prettier-install', function () {
    const options = new Options(['node', 'prettier-install']);

    this.finished = this.installer.run(options);

    // Prevent unhandled rejection warning.
    this.finished.catch(noop);
  });

  When('I run prettier-install with arguments {stringInDoubleQuotes}',
    function (args) {
      const options = new Options([
        'node',
        'prettier-install',
        ...args.split(/\s+/)
      ]);

      this.finished = this.installer.run(options);

      // Prevent unhandled rejection warning.
      this.finished.catch(noop);
    }
  );

  When('I run prettier-install with arguments:', function (string) {
      const args = string.split("\n").join(" ");
      const options = new Options([
        'node',
        'prettier-install',
        ...args.split(/\s+/)
      ]);

      this.finished = this.installer.run(options);

      // Prevent unhandled rejection warning.
      this.finished.catch(noop);
    }
  );

  Then('installer must finish', function () {
    expect(this.finished).to.be.fulfilled;
  });

  Then('installer must exit', function () {
    expect(this.finished).to.be.rejected
  });
});
