'use strict';

const fs = jest.genMockFromModule('fs');

let __mockFiles = {};

function __setMockFile(filename, data) {
  __mockFiles[filename] = Buffer.from(data);
};

const readFile = jest.fn(function (filename, callback) {
  if (filename in __mockFiles) {
    callback(null, __mockFiles[filename]);

    return;
  }

  callback(new Error('File not found'));
});

const writeFile = jest.fn(function (filename, data, callback) {
  callback();
});

function __resetMocks() {
  __mockFiles = {};
  readFile.mockClear();
  writeFile.mockClear();
}

module.exports = fs;

Object.assign(module.exports, {
  readFile,
  writeFile,
  __setMockFile,
  __resetMocks,
})
