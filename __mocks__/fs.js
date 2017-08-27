'use strict';

const fs = jest.genMockFromModule('fs');

const access = jest.fn();
const stat = jest.fn();
const readFile = jest.fn();
const readDir = jest.fn();

module.exports = fs;

Object.assign(module.exports, {
  access,
  stat,
  readFile,
  readDir,
});
