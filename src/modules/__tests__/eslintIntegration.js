import fs from 'fs';
import childProcess from 'child_process';
import dedent from 'dedent';
import eslintIntegration from '../eslintIntegration';

jest.mock('fs');
jest.mock('child_process');

describe('eslint integration', () => {
  beforeAll(() => {
    fs._mockFileAccess('/usr/bin/npm', fs.constants.X_OK);
  });

  beforeEach(() => {
    fs.writeFile.mockClear();
    childProcess.exec.mockClear();
  })

  it('installs and inject prettier plugin and config', async () => {
    childProcess.exec.mockImplementationOnce((command, callback) => callback());

    const context = {
      environment: {
        getProjectDependencies: () => Promise.resolve({}),
        eslintPresets: () => Promise.resolve([]),
        eslintPlugins: () => Promise.resolve([]),
      },
      options: {},
      feedback: {},
    };

    await eslintIntegration(context);

    expect(childProcess.exec).toHaveBeenCalledWith(
      'npm install --save-dev eslint-config-prettier eslint-plugin-prettier',
      expect.any(Function),
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      '.eslintrc.json',
      dedent`{
        "extends": [
          "prettier"
        ],
        "plugins": [
          "prettier"
        ],
        "rules": {
          "prettier/prettier": "warn"
        }
      }`,
      expect.any(Function),
    );
  });

  it('skips installing eslint-config-prettier when it is already installed', async () => {
    childProcess.exec.mockImplementationOnce((command, callback) => callback());

    const context = {
      environment: {
        getProjectDependencies: () => Promise.resolve({
          'eslint-config-prettier': '^0.4.3',
        }),
        eslintPresets: () => Promise.resolve([]),
        eslintPlugins: () => Promise.resolve([]),
      },
      options: {},
      feedback: {},
    };

    await eslintIntegration(context);

    expect(childProcess.exec).toHaveBeenCalledWith(
      'npm install --save-dev eslint-plugin-prettier',
      expect.any(Function),
    );
  });

  it('skips installing eslint-plugin-prettier when it is already installed', async () => {
    childProcess.exec.mockImplementationOnce((command, callback) => callback());

    const context = {
      environment: {
        getProjectDependencies: () => Promise.resolve({
          'eslint-plugin-prettier': '^0.4.3',
        }),
        eslintPresets: () => Promise.resolve([]),
        eslintPlugins: () => Promise.resolve([]),
      },
      options: {},
      feedback: {},
    };

    await eslintIntegration(context);

    expect(childProcess.exec).toHaveBeenCalledWith(
      'npm install --save-dev eslint-config-prettier',
      expect.any(Function),
    );
  });

  it('skips installing any modules when preset and plugin are already installed', async () => {
    const context = {
      environment: {
        getProjectDependencies: () => Promise.resolve({
          'eslint-plugin-prettier': '^0.4.3',
          'eslint-config-prettier': '^1.2.3',
        }),
        eslintPresets: () => Promise.resolve([]),
        eslintPlugins: () => Promise.resolve([]),
      },
      options: {},
      feedback: {},
    };

    await eslintIntegration(context);

    expect(childProcess.exec).toHaveBeenCalledTimes(0);
  });

  it('ensures prettier preset is the last in the list', async () => {
    fs._mockFileAccess('.eslintrc.json');
    fs._mockFileContents('.eslintrc.json', dedent`{
      "extends": [
        "prettier",
        "foo"
      ],
      "plugins": [
        "prettier"
      ],
      "rules": {
        "prettier/prettier": "warn"
      }
    }`);

    const context = {
      environment: {
        getProjectDependencies: () => Promise.resolve({
          'eslint-config-prettier': '^0.4.3',
          'eslint-plugin-prettier': '^1.2.3',
        }),
        eslintPresets: () => Promise.resolve(['prettier', 'foo']),
        eslintPlugins: () => Promise.resolve(['prettier']),
      },
      options: {},
      feedback: {},
    };

    await eslintIntegration(context);

    expect(fs.writeFile).toHaveBeenCalledWith(
      '.eslintrc.json',
      dedent`{
        "extends": [
          "foo",
          "prettier"
        ],
        "plugins": [
          "prettier"
        ],
        "rules": {
          "prettier/prettier": "warn"
        }
      }`,
      expect.any(Function),
    );
  });
})
