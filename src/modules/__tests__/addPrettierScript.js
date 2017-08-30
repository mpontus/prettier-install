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
