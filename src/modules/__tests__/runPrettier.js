describe('runPrettier', () => {
  it('runs prettier', () => {
    await runPrettier();

    expect(childProcess.exec).toHaveBeenCalledWith(
      './node_modules/.bin/prettier --write **/*.js',
    );
  });
})
