'use strict';
const tty = jest.genMockFromModule('tty');
const setRawMode = jest.fn();

module.exports = tty;

Object.assign(module.exports, {
  setRawMode,
})
