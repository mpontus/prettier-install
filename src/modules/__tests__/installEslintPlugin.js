import fs from 'fs';
import childProcess from 'child_process';
import dedent from 'dedent';
import installEslintPlugin from '../installEslintPlugin';

jest.mock('fs');
jest.mock('child_process');

describe('installEslintPlugin', () => {
  it('installs eslint plugin', async () => {
    process.env.PATH = '/usr/bin';
    fs._mockFileAccess('/usr/bin/npm', fs.constants.X_OK);
    fs._mockFileAccess('.eslintrc.json', fs.constants.F_OK);
    fs._mockFileContents('.eslintrc.json', '{}');
    childProcess.exec.mockImplementationOnce((command, callback) => callback());

    await installEslintPlugin();

    expect(childProcess.exec).toHaveBeenCalledWith(
      'npm install --save-dev eslint-plugin-prettier',
      expect.any(Function)
    );
  });

  it('injects plugin into eslint configuration', async () => {
    fs._mockFileAccess('.eslintrc.json', fs.constants.F_OK);
    fs._mockFileContents('.eslintrc.json', dedent`{
      "plugins": ["react"]
    }`);
    childProcess.exec.mockImplementationOnce((command, callback) => callback());

    await installEslintPlugin();

    expect(fs.writeFile).toHaveBeenCalledWith(
      '.eslintrc.json',
      dedent`{
        "plugins": [
          "react",
          "prettier"
        ],
        "rules": {
          "prettier/prettier": "warn"
        }
      }`,
      expect.any(Function)
    );
  })
})
