#!/usr/bin/env node

const path = require('path');
const { promisify } = require('util')
const which = promisify(require('which'));
const { exec } = require('child_process');

class PrettierInstall {
  async run() {
    const useYarn = await this.detectYarn();
    await this.installPrettierIfNeeded(useYarn);
    // await this.runPrettier();
    // await this.commitChanges();
  }

  async detectYarn() {
    let useYarn, useNpm;

    try {
      useYarn = await which('yarn');
    } catch(error) {
      useYarn = false;
    }

    if (!useYarn) {
      try {
        useNpm = await which('npm');
      } catch (error) {
        useNpm = false;
      }
    }

    if (useYarn) {
      console.log('Yarn detected');
    } else if (useNpm) {
      console.log('NPM detected');
    } else {
      console.error('No packager detected');
      process.exit(1);
    }

    return useYarn;
  }

  async installPrettierIfNeeded(useYarn) {
    if (this.isPrettierInstalled()) {
      console.log('Prettier is already installed.')

      return;
    }

    console.log('Installing prettier');

    await promisify(exec)(
      useYarn
        ? 'yarn add --dev prettier'
        : 'npm install --save-dev prettier'
    )

    console.log('Prettier installed');
  }

  isPrettierInstalled() {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const metadata = require(packageJsonPath);
    const { dependencies, devDependencies } = metadata;

    return 'prettier' in Object.assign({}, dependencies, devDependencies);
  }
}

const install = new PrettierInstall();

install.run();
