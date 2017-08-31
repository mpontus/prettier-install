import childProcess from 'child_process';
import { enhance, ensureSafeChanges } from '../ensureSafeChanges';
import fs from 'fs';

jest.mock('child_process');
jest.mock('fs');

const mockSuccess = (command, options, callback) => {
  if (!callback) {
    [callback, options] = [options, undefined];
  }

  callback(null);
};

const mockError = (command, options, callback) => {
  if (!callback) {
    [callback, options] = [options, undefined];
  }

  const error = new Error();

  error.code = 1;

  callback(error);
};

describe('ensureSafeChanges', () => {
  beforeEach(() => {
    fs._mockReset();
  })

  describe('decorator', () => {
    it('skips when git is not available', async () => {
      const fn = jest.fn();

      await enhance(fn)();

      expect(fn).toHaveBeenCalledTimes(0);
    });

    it('runs when git is available', async () => {
      fs._mockFileAccess('/usr/bin/git', fs.constants.X_OK);

      const fn = jest.fn();

      await enhance(fn)();

      expect(fn).toHaveBeenCalledTimes(1);
    })
  })

  describe('core', () => {
    it('checks if working tree is clean', async () => {
      childProcess.exec.mockImplementationOnce(mockSuccess);

      await ensureSafeChanges({});

      expect(childProcess.exec).toHaveBeenCalledWith(
        'git diff-index --quiet HEAD --',
        expect.any(Function),
      );
    });

    it('prompts the user when working tree is not clean', async () => {
      childProcess.exec.mockImplementationOnce(mockError);

      const feedback = {
        prompt: jest.fn(() => Promise.resolve(true)),
      };

      await ensureSafeChanges({ feedback });

      expect(feedback.prompt).toHaveBeenCalledWith(
        'Working tree is not clean. Proceed anyway?',
      );
    });

    it('continues with execution when user agrees to proceed', async () => {
      process.exit = jest.fn();
      childProcess.exec.mockImplementationOnce(mockError);

      const feedback = {
        prompt: jest.fn(() => Promise.resolve(true)),
      };

      await ensureSafeChanges({ feedback });

      expect(process.exit).toHaveBeenCalledTimes(0);
    });

    it('continues with execution when user agrees to proceed', async () => {
      process.exit = jest.fn();
      childProcess.exec.mockImplementationOnce(mockError);

      const feedback = {
        prompt: jest.fn(() => Promise.resolve(false)),
      };

      await ensureSafeChanges({ feedback });

      expect(process.exit).toHaveBeenCalledTimes(1);
    });
  });

})

