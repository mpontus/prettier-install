import childProcess from 'child_process';
import { ensureSafeChanges } from '../ensureSafeChanges';

jest.mock('child_process');

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
})
