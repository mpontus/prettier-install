const { Client } = require('../client');
const { modifyJson } = require('../utils');
const { addPrettierCommand } = Client;

jest.mock('../utils');

describe('Client', () => {
  describe('Client#addPrettierCommand', () => {
    it('must add prettier command to package.json', () => {
      expect(modifyJson).toHaveBeenCalledWith(
        'package.json',
        addPrettierCommand,
      )
    });
  });
});
