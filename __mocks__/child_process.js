'use strict';
const { EventEmitter } = require('events');

const childProcess = jest.genMockFromModule('child_process');

const exec = jest.fn();

module.exports = childProcess;

Object.assign(module.exports, {
  exec,
})
