'use strict';

const fs = jest.genMockFromModule('fs');

const readFile = jest.fn();

module.exports = fs;

Object.assign(module.exports, {
  readFile,
});
