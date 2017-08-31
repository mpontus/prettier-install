describe('installEslintPreset', () => {
  it('installs eslint preset', async () => {
    await installEslintPreset();

    expect(childProcess.exec).toHaveBeenCalledWith(
      'npm install --save-dev eslint-plugin-prettier',
    );
  });

  it('injects preset into eslint configuration', () => {
    fs._mockFileCOntents('.eslintrc.json', dedent`{
      "plugins": ["react"]
    }`)

    await installEslintPreset();

    expect(fs.writeFile).toHaveBeenCalledWith('.eslintrc.json', dedent`{
      "plugins": ["react", "prettier"],
      "rules": {
        "prettier/prettier": "warn"
      }
    }`);
  })
})
