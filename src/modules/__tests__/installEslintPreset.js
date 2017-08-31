describe('installEslintPreset', () => {
  it('installs eslint preset', async () => {
    await installEslintPreset();

    expect(childProcess.exec).toHaveBeenCalledWith(
      'npm install --save-dev eslint-config-prettier',
    );
  });

  it('injects preset into eslint configuration', () => {
    fs._mockFileCOntents('.eslintrc.json', dedent`{
      "extends": "airbnb"
    }`)

    await installEslintPreset();

    expect(fs.writeFile).toHaveBeenCalledWith('.eslintrc.json', dedent`{
      "extends": ["airbnb", "prettier"]
    }`);
  })
})
