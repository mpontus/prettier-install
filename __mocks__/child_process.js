'use strict';
const { EventEmitter } = require('events');

const childProcess = jest.genMockFromModule('child_process');

const spawn = jest.fn();

module.exports = childProcess;

Object.assign(module.exports, {
  spawn,
})
