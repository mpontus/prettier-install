'use strict';
const { defineSupportCode } = require('cucumber');
const { expect } = require('chai');
const Options = require('../../src/options');

defineSupportCode(({ Given, When, Then }) => {
  When('I run prettier-install',
    function () {
      const options = new Options(['node', 'prettier-install']);

      this.installer.run(options);
    }
  );

  When('I run prettier-install with arguments {stringInDoubleQuotes}',
    function (args) {
      const options = new Options([
        'node',
        'prettier-install',
        ...args.split(/\s+/)
      ]);

      this.installer.run(options);
    }
  );

  When('I run prettier-install with arguments:', function (string) {
      const args = string.split("\n").join(" ");
      const options = new Options([
        'node',
        'prettier-install',
        ...args.split(/\s+/)
      ]);

      this.installer.run(options);
    }
  );
});
