#!/usr/bin/env node

const Installer = require('../src/installer');
const Client = require('../src/client');

const client = new Client();
const installer = new Installer(client);

installer.run()
  .catch(error => {
    console.error(error);

    process.exit(1);
  })
