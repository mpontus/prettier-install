#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util')
const which = promisify(require('which'));
const { spawn } = require('child_process');

function exec(command) {
  let executable, args;

  if (Array.isArray(command)) {
    [executable, ...args] = command;
  } else {
    executable = '/bin/sh';
    args = ['-c', command];
  }

  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { stdio: 'inherit' });

    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();

        return;
      }

      const error = new Error();

      Object.assign(error, { code, signal });
      reject(error);
    })
  })
}

class PrettierInstall {
  async run() {
    const useGit = await this.detectGit();

    if (useGit) {
      await this.ensureNoUncommitedChanges();
    }

    let useYarn;
    const prettierInstalled = this.isPrettierInstalled();

    if (!prettierInstalled) {
      useYarn = this.detectYarn();
      await this.installPrettier(useYarn);
    }

    await this.runPrettier();

    if (useGit) {
      await this.commitChanges(prettierInstalled, useYarn);
    }
  }

  async detectGit() {
      try {
        which('git')
      } catch (error) {
        return false;
      }

      const gitDirectoryPath = path.resolve(
        process.cwd(),
        '.git',
      )
      const gitDirectoryExists = await promisify(fs.exists)(gitDirectoryPath);

      if (!gitDirectoryExists) {
        return false;
      }

      return true;
  }

  async ensureNoUncommitedChanges() {
    try {
      await exec('git diff-index --quiet HEAD --')
    } catch (error) {
      console.error('Commit changes in your current tree before proceeding')

      process.exit(1);
    }
  }

  isPrettierInstalled() {
    try {
      const packageJsonPath = path.resolve(process.cwd(), 'package.json');
      const metadata = require(packageJsonPath);
      const { dependencies, devDependencies } = metadata;

      return 'prettier' in Object.assign({}, dependencies, devDependencies);
    } catch (error) {
      return false;
    }
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

  async installPrettier(useYarn) {
      console.log('Installing prettier');

      await exec(
        useYarn
          ? 'yarn add --dev prettier'
          : 'npm install --save-dev prettier'
      )
  }

  async runPrettier() {
    console.log('Running prettier');

    const prettierCmd = path.resolve(
      process.cwd(),
      'node_modules/.bin/prettier'
    );

    const globPatterns = process.argv.length > 2
      ? process.argv.slice(2)
      : ['**/*.js'];

    await exec(
      [prettierCmd, '--write', ...globPatterns],
    )
  }

  async commitChanges(wasPrettierInstalled, useYarn) {
    if (!wasPrettierInstalled) {
      await exec('git add package.json');

      if (useYarn) {
        await exec('git add yarn.lock')
      } else {
        await exec('git add package-lock.json');
      }
    }

    await exec(
      'git commit --all --edit --message "Installed prettier"'
    )
  }
}

const install = new PrettierInstall();

install.run();
