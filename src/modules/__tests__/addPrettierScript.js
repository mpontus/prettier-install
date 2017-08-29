import fs from 'fs';
import dedent from 'dedent';
import { addPrettierScript, enhance } from '../addPrettierScript';

jest.mock('fs');

describe('enhance', () => {
  it('should skip if --no-command is present in args', async () => {
    const context = {
      environment: {
        getPackageScripts: () => ({}),
      },
      options: {
        'no-command': true,
      },
      feedback: {
        progress: () => () => undefined,
      },
    };
    const fn = jest.fn();

    await enhance(fn)(context);

    expect(fn).toHaveBeenCalledTimes(0);
  });

  it('should skip if prettier script already exists', async () => {
    const context = {
      environment: {
        getPackageScripts: () => ({ prettier: 'prettier --write **/*.js' }),
      },
      options: {},
      feedback: {
        progress: () => () => undefined,
      },
    };

    const fn = jest.fn();

    await enhance(fn)(context);

    expect(fn).toHaveBeenCalledTimes(0);

  })

  it('should skip if --eslint-plugin is present in args', async () => {
    const context = {
      environment: {
        getPackageScripts: () => ({}),
        getProjectDependencies: () => ({}),
      },
      options: {
        'eslint-plugin': true,
      },
      feedback: {
        progress: () => () => undefined,
      },
    };

    const fn = jest.fn();

    await enhance(fn)(context);

    expect(fn).toHaveBeenCalledTimes(0);
  });

  it('should skip if eslint is installed', async () => {
    const context = {
      environment: {
        getPackageScripts: () => ({}),
        getProjectDependencies: () => ({ eslint: '^1.0.0' }),
      },
      options: {},
      feedback: {
        progress: () => () => undefined,
      },
    };
    const fn = jest.fn();

    await enhance(fn)(context);

    expect(fn).toHaveBeenCalledTimes(0);
  });

  it('should pass if eslint is installed and --no-eslint-plugin is present in args', async () => {
    const context = {
      environment: {
        getPackageScripts: () => ({}),
        getProjectDependencies: () => ({ eslint: '^1.0.0', }),
      },
      options: {
        'no-eslint-plugin': true,
      },
      feedback: {
        progress: () => () => undefined,
      },
    };

    const fn = jest.fn();

    await enhance(fn)(context);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should force if --command is present in args', async () => {
    const context = {
      environment: {
        getPackageScripts: () => ({}),
      },
      options: {
        'command': true,
        'eslint-plugin': true,
      },
      feedback: {
        progress: () => () => undefined,
      },
    };

    const fn = jest.fn(() => Promise.resolve(true));

    await enhance(fn)(context);

    expect(fn).toHaveBeenCalledTimes(1);
  });
})

describe('addPrettierScript', () => {
  it('must add prettier script', async () => {
    fs._mockFileContents('package.json', dedent`{
      "name": "foo"
    }`);

    const context = {
      options: {
        glob: null,
      },
    };

    await addPrettierScript(context);

    expect(fs.writeFile).toHaveBeenCalledWith('package.json', dedent`{
      "name": "foo",
      "scripts": {
        "prettier": "prettier --write **/*.js"
      }
    }`, expect.any(Function));
  });
});
