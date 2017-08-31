describe('gitCommit', () => {
  it('runs git commit', async () => {
    expect(childProcess.exec).toHaveBeenCalledWith(
      'git commit --all --edit --message "Installed prettier"',
      { stdio: 'inherit' },
      expect.any(Function),
    );
  });
});
