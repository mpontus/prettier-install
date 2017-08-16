'use strict';

const fs = jest.genMockFromModule('fs');

let __mockFiles = {};

function __setMockFile(filename, data) {
  __mockFiles[filename] = Buffer.from(data);
};

const stat = jest.fn((filename, callback) => {
  if (!(filename in __mockFiles)) {
    const error = new Error('no such file or directory');

    error.errno = -2;
    error.code = 'ENOENT';

    return callback(error);
  }

  callback();
});

const readFile = jest.fn(function (filename, options, callback) {
  if (typeof options === 'function') {
    callback = options;
  }

  if (!(filename in __mockFiles)) {
    const error = new Error('no such file or directory');

    error.errno = -2;
    error.code = 'ENOENT';

    return callback(error);
  }

  callback(null, __mockFiles[filename]);
});

const writeFile = jest.fn(function (filename, data, callback) {
  __mockFiles[filename] = data;

  callback();
});

function __resetMocks() {
  __mockFiles = {};
  readFile.mockClear();
  writeFile.mockClear();
}

module.exports = fs;

Object.assign(module.exports, {
  stat,
  readFile,
  writeFile,
  __setMockFile,
  __resetMocks,
})
