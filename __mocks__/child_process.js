'use strict';
const { EventEmitter } = require('events');

const childProcess = jest.genMockFromModule('child_process');

const spawn = jest.fn(() => {
  return {
    on: (event, callback) => {
      switch (event) {
        case 'exit':
          callback(0);
        default:
          callback();
      }
    }
  }
});

module.exports = childProcess;

Object.assign(module.exports, {
  spawn,
})
