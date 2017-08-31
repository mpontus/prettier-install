const mockError = (command, options, callback) => {
  const error = new Error();

  error.code = 1;

  callback(error);
};

describe('ensureSafeChanges', () => {
  it('checks if working tree is clean', async () => {
    expect(childProcess.exec).toHaveBeenCalledWith(
      'git diff-index --quiet HEAD --'
    );
  });

  it('prompts the user when working tree is not clean', async () => {
    childProcess.exec.mockImplementationOnce(mockError);

    expect(feedback.prompt).toHaveBeenCalledWith(
      'Working tree is not clean. Proceed anyway?',
    );
  });

  it('continues with execution when user agrees to proceed', async () => {
    process.exit = jest.fn();
    childProcess.exec.mockImplementationOnce(mockError);
    feedback.prompt.mockReturnValueOnce(Promise.resolve(true));

    await ensureSafeChanges(context);

    expect(process.exit).toHaveBeenCalledTimes(0);
  });

  it('continues with execution when user agrees to proceed', async () => {
    process.exit = jest.fn();
    childProcess.exec.mockImplementationOnce(mockError);
    feedback.prompt.mockReturnValueOnce(Promise.resolve(false));

    await ensureSafeChanges(context);

    expect(process.exit).toHaveBeenCalledTimes(1);
  });
})
