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

  it('should skip when prettier command already exists and custom glob is provided', async () => {
    const contextWithoutGlob = {
      environment: {
        getPackageScripts: () => ({
          'prettier': 'prettier --write **/*.js',
        }),
      },
      options: {
        'glob': null,
      },
      feedback: {
        progress: () => () => undefined,
      },
    };

    const contextWithGlob = {
      ...contextWithoutGlob,
      options: {
        'glob': '**/*.js **/*.jsx **/*.scss',
      },
    };

    const fn = jest.fn();

    await enhance(fn)(contextWithoutGlob);

    expect(fn).toHaveBeenCalledTimes(0);

    await enhance(fn)(contextWithGlob);

    expect(fn).toHaveBeenCalledTimes(1);
  })
});

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
