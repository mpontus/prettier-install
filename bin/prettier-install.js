#!/usr/bin/env node

const Installer = require('../src/installer');
const Client = require('../src/client');
const Feedback = require('../src/feedback');
const Options = require('../src/options');

const options = new Options(process.argv);
const client = new Client();
const feedback = new Feedback();
const installer = new Installer(client, feedback);

installer.run(options)
  .catch(() => {
    process.exit(1);
  })
