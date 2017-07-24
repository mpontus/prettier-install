'use strict';

const fs = jest.genMockFromModule('fs');

const readFile = jest.fn();
const writeFile = jest.fn();

fs.readFile = readFile;
fs.writeFile = writeFile;

module.exports = fs;
