import fs from 'fs';
import childProcess from 'child_process';
import installModules from '../installModules';

jest.mock('fs');
jest.mock('child_process');

describe('installModule', () => {
  it('throws error when no packager is available', () => {
    const result = installModules(['foo']);

    expect(result).rejects.toEqual(expect.any(Error));
  });

  it('installs given module(s) using npm', async () => {
    process.env.PATH = '/usr/bin';
    fs._mockFileAccess('/usr/bin/npm', fs.constants.X_OK);
    childProcess.exec.mockImplementationOnce((command, callback) => callback());

    await installModules(['foo', 'bar']);

    expect(childProcess.exec).toHaveBeenCalledWith(
      'npm install --save-dev foo bar',
      expect.any(Function),
    );
  });

  it('installs given module(s) using yarn', async () => {
    process.env.PATH = '/usr/bin';
    fs._mockFileAccess('/usr/bin/yarn', fs.constants.X_OK);
    childProcess.exec.mockImplementationOnce((command, callback) => callback());

    await installModules(['foo', 'bar']);

    expect(childProcess.exec).toHaveBeenCalledWith(
      'yarn add --dev foo bar',
      expect.any(Function),
    );
  });
})
