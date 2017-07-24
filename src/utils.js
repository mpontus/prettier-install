'use strict';
const { promisify } = require('util');
const fs = require('fs');
const detectIndent = require('detect-indent');
const stat = promisify(fs.stat);

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

function modifyJson(filename, cb) {
  return new Promise((resolve, reject) => {
    const originalText = fs.readFile(filename, (err, data) => {
      if (err) {
        reject(err);

        return;
      }

      try {
        const originalJson = JSON.parse(data);
        const resultJson = cb(originalJson);
        const indent = detectIndent(data).indent || '  ';
        const resultText = JSON.stringify(resultJson, null, indent);

        fs.writeFile(filename, resultText, (err) => {
          if (err) {
            reject(err);

            return;
          }

          resolve();
        });
      } catch (error) {
        reject(error);

        return;
      }
    });
  })

}

module.exports = {
  cmd,
  modifyJson,
};
