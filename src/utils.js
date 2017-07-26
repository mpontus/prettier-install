'use strict';
const { promisify } = require('util');
const fs = require('fs');
const { spawn } = require('child_process');
const detectIndent = require('detect-indent');
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

function cmd(command) {
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
      if (code !== 0) {
        const error = new Error();

        Object.assign(error, { code, signal });

        return reject(error);
      }

      resolve();
    });
  });
};

async function directoryExists(path) {
  try {
    const stats = await stat(path);

    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

async function modifyJson(filename, cb) {
  const data = await readFile(filename);
  const content = data.toString();
  const original = JSON.parse(content);
  const result = cb(original);
  const { indent } = detectIndent(content);
  const string = JSON.stringify(result, null, indent);

  return writeFile(filename, string);
}

module.exports = {
  cmd,
  modifyJson,
  directoryExists,
};
