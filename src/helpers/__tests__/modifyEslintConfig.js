import fs from 'fs';
import dedent from 'dedent';
import modifyEslintConfig from '../modifyEslintConfig';

jest.mock('fs');

describe('modifyFile', () => {
  beforeEach(() => {
    fs._mockReset();
  });

  it('must throw an error when no eslint config file exsits', () => {
    const modifier = () => {};
    const result = modifyEslintConfig(modifier);

    return expect(result).rejects.toEqual(expect.any(Error));
  });

  it('must throw an error when no supported eslint config file exsits', async () => {
    fs._mockFileAccess('.eslintrc.js');

    const modifier = () => {};
    const result = modifyEslintConfig(modifier);

    return expect(result).rejects.toEqual(expect.any(Error));
  });

  it('must alter .eslintrc.json when it exists', async () => {
    fs._mockFileAccess('.eslintrc.json');
    fs._mockFileContents('.eslintrc.json', dedent`{
      "foo": "bar"
    }`);

    const modifier = (input) => {
      expect(input).toEqual({ foo: 'bar' });

      return { bar: 'baz' };
    }

    await modifyEslintConfig(modifier);

    expect(fs.writeFile).toHaveBeenCalledWith(
      '.eslintrc.json',
      dedent`{
        "bar": "baz"
      }`,
      expect.any(Function),
    );
  });

  it('must alter package.json when it exists', async () => {
    fs._mockFileAccess('package.json');
    fs._mockFileContents('package.json', dedent`{
      "eslintConfig": {
        "foo": "bar"
      }
    }`);

    const modifier = (input) => {
      expect(input).toEqual({ foo: 'bar' });

      return { bar: 'baz' };
    }

    await modifyEslintConfig(modifier);

    expect(fs.writeFile).toHaveBeenCalledWith(
      'package.json',
      dedent`{
        "eslintConfig": {
          "bar": "baz"
        }
      }`,
      expect.any(Function),
    );
  });
});
