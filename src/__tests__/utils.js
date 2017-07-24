'use strict';
const fs = require('fs');
const { modifyJson } = require('../utils');

const identity = value => value;

jest.mock('fs');

describe('modifyJson', () => {
  beforeEach(() => {
    fs.readFile.mockReset();
    fs.writeFile.mockReset();
  })

  it('must return a promise', () => {
    fs.readFile.mockImplementationOnce((filename, cb) => cb(null, '{"foo":"bar"}'));

    const result = modifyJson('test.json', identity);
    expect(result).toBeInstanceOf(Promise);
  });

  it('must resolve the promise after writing the file', () => {
    fs.readFile.mockImplementationOnce((filename, cb) => {
      cb(null, '{"foo":"bar"}');
    });
    fs.writeFile.mockImplementationOnce((filename, data, cb) => {
      cb(null);
    });

    const result = modifyJson('test.json', identity);

    return expect(result).resolves.toBe(undefined);
  });

  it('must reject when read fails', () => {
    const error = new Error('Write failed');

    fs.readFile.mockImplementationOnce((filename, cb) => {
      cb(error);
    });

    const result = modifyJson('test.json', identity);

    return expect(result).rejects.toBe(error);
  });

  it('must reject when JSON is malformed', () => {
    fs.readFile.mockImplementationOnce((filename, cb) => {
      cb(null, 'foobar');
    });

    const result = modifyJson('test.json', identity);

    return expect(result).rejects.toBeDefined();
  });

  it('must reject when error happens during callback', () => {
    const error = new Error('Failed to produce new object');

    fs.readFile.mockImplementationOnce((filename, cb) => {
      cb(null, '{"foo":"bar"}');
    });

    const result = modifyJson('test.json', () => {
      throw error;
    });

    return expect(result).rejects.toBe(error);
  })

  it('must reject when write fails', () => {
    const error = new Error('Write failed');

    fs.readFile.mockImplementationOnce((filename, cb) => {
      cb(null, '{"foo":"bar"}');
    });
    fs.writeFile.mockImplementationOnce((filename, data, cb) => {
      cb(error);
    });

    const result = modifyJson('test.json', identity);

    return expect(result).rejects.toBe(error);
  })

  it('modifies the structure of the file using callback', async () => {
    const [input, output] = [
      [
        '{',
        '  "foo": "bar"',
        '}',
      ],
      [
        '{',
        '  "bar": "baz"',
        '}',
      ]
    ].map(lines => lines.join('\n'));

    fs.readFile.mockImplementationOnce((filename, cb) => {
      expect(filename).toEqual('test.json');

      cb(null, input);
    });
    fs.writeFile.mockImplementationOnce((filename, content, cb) => {
      cb();
    });

    await modifyJson('test.json', (content) => {
      expect(content).toEqual({
        foo: 'bar',
      });

      return { bar: 'baz' };
    });

    expect(fs.writeFile).toHaveBeenCalledWith(
      'test.json',
      output,
      expect.any(Function)
    );
    
    expect.assertions(3);
  });

  it('preserves the indentation in the original file', async () => {
    const [input, output] = [
      [
        '{',
        '    "foo": "bar"',
        '}',
      ],
      [
        '{',
        '    "bar": "baz"',
        '}',
      ]
    ].map(lines => lines.join('\n'));

    fs.readFile.mockImplementationOnce((filename, cb) => {
      expect(filename).toBe('test.json');

      cb(null, input);
    });
    fs.writeFile.mockImplementationOnce((filename, content, cb) => {
      cb();
    });

    await modifyJson('test.json', (content) => {
      expect(content).toEqual({ foo: 'bar' });

      return { bar: 'baz' }
    });

    expect(fs.writeFile).toHaveBeenCalledWith(
      'test.json',
      output,
      expect.any(Function)
    );
  });
})
