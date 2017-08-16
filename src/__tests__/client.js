const fs = require('fs');
const childProcess = require('child_process');
const Client = require('../client');
const dedent = require('dedent');

jest.mock('fs');
jest.mock('child_process');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

const processWillSucceed = () => ({
  on: (event, listener) => event === 'exit' && listener(0),
});

const processWillFail = () => ({
  on: (event, listener) => event === 'exit' && listener(1),
});

describe('Client', () => {
  beforeEach(() => {
    fs.__resetMocks();
    childProcess.spawn.mockClear();
    childProcess.spawn.mockReturnValue(processWillSucceed());
  });

  describe('detectUncommittedChanges', () => {
    it('must run shell snippet', () => {
      const client = new Client();

      client.detectUncommittedChanges();

      expect(childProcess.spawn).toHaveBeenCalledWith(
        '/bin/sh',
        ['-c', 'git diff-index --quiet HEAD --'],
        { stdio: 'inherit' },
      );
    });

    it('must return false when process exits successfuly', async () => {
      const client = new Client();

      childProcess.spawn.mockImplementationOnce(
        () => ({
          on: (event, callback) => event === 'exit' && callback(0),
        })
      )

      const result = await client.detectUncommittedChanges();

      expect(result).toBe(false);
    });

    it('must return true when process exits with non-zero exit code',
      async () => {
        const client = new Client();

        childProcess.spawn.mockImplementationOnce(
          () => ({
            on: (event, callback) => event === 'exit' && callback(1),
          })
        )

        const result = await client.detectUncommittedChanges();

        expect(result).toBe(true);
      }
    );
  })

  describe('detectEslint', () => {
    it('should resolve to true when eslint is installed in devDependencies', async () => {
      const client = new Client();

      const packageJson = dedent`{
        "devDependencies": {
          "eslint": "^4.3.0"
        }
      }`

      fs.__setMockFile('package.json', packageJson);

      const result = await client.detectEslint();

      expect(result).toBe(true);
    });

    it('should resolve to true when eslint is installed in depdendencies', async () => {
      const client = new Client();

      const packageJson = dedent`{
        "dependencies": {
          "eslint": "^4.3.0"
        }
      }`

      fs.__setMockFile('package.json', packageJson);

      const result = await client.detectEslint();

      expect(result).toBe(true);
    });

    it('should resolve to false when eslint is not installed', async () => {
      const client = new Client();

      const packageJson = dedent`{
        "dependencies": {
          "lodash": "^4.17.4"
        },
        "devDependencies": {
          "jest": "^20.0.4"
        }
      }`

      fs.__setMockFile('package.json', packageJson);

      const result = await client.detectEslint();

      expect(result).toBe(false);
    })
  });

  describe('installPrettier', () => {
    it('must be able to install prettier using npm', async () => {
      const client = new Client();

      await client.installPrettier('npm');

      expect(childProcess.spawn).toHaveBeenCalledWith(
        '/bin/sh',
        ['-c', 'npm install --save-dev prettier'],
        { stdio: 'inherit' },
      );
    });

    it('must be able to install prettier using yarn', async () => {
      const client = new Client();

      await client.installPrettier('yarn');

      expect(childProcess.spawn).toHaveBeenCalledWith(
        '/bin/sh',
        ['-c', 'yarn add --dev prettier'],
        { stdio: 'inherit' },
      );
    });

    it('must resolve when the installation is successful', () => {
      const client = new Client();

      childProcess.spawn.mockReturnValueOnce(processWillSucceed());

      return expect(client.installPrettier('npm')).resolves.toBe(undefined);
    });

    it('must reject when the installation fails', () => {
      const client = new Client();

      childProcess.spawn.mockReturnValueOnce(processWillFail());

      return expect(client.installPrettier('npm')).rejects.toEqual(expect.any(Error));
    })
  });


  describe('installEslintExtras', () => {
    it('must install extra eslint packages using npm', async () => {
      const client = new Client();

      await client.installEslintExtras('npm');

      expect(childProcess.spawn).toHaveBeenCalledWith(
        '/bin/sh',
        ['-c', 'npm install --save-dev eslint-config-prettier eslint-plugin-prettier'],
        { stdio: 'inherit' },
      );
    });

    it('must install extra eslint packages using yarn', async () => {
      const client = new Client();

      await client.installEslintExtras('yarn');

      expect(childProcess.spawn).toHaveBeenCalledWith(
        '/bin/sh',
        ['-c', 'yarn add --dev eslint-config-prettier eslint-plugin-prettier'],
        { stdio: 'inherit' },
      );
    });

    it('must resolve when process succeeds', () => {
      const client = new Client();

      childProcess.spawn.mockReturnValueOnce(processWillSucceed());

      return expect(client.installEslintExtras('npm')).resolves.toBe(undefined);
    });


    it('must reject when process fails', () => {
      const client = new Client();

      childProcess.spawn.mockReturnValueOnce(processWillFail());

      return expect(client.installEslintExtras('npm')).rejects.toEqual(expect.any(Error));
    });

    it('must update .eslintrc.json when it exists', async () => {
      const client = new Client();

      fs.__setMockFile(
        '.eslintrc.json',
        dedent`{
          "extends": ["foo"],
          "plugins": ["bar"],
          "rules": {
            "baz": "warning"
          }
        }`
      );

      await client.installEslintExtras('npm');

      expect(fs.writeFile).toHaveBeenCalledWith(
        '.eslintrc.json',
        dedent`{
          "extends": [
            "foo",
            "prettier"
          ],
          "plugins": [
            "bar",
            "prettier"
          ],
          "rules": {
            "baz": "warning",
            "prettier/prettier": "error"
          }
        }`,
        expect.any(Function),
      )
    });

    it('must update .eslintrc.yaml when it exists', async () => {
      const client = new Client();

      fs.__setMockFile(
        '.eslintrc.yaml',
        dedent`
          extends:
            - foo
          plugins:
            - bar
          rules:
            baz: warning
        `
      );

      await client.installEslintExtras('npm');

      expect(fs.writeFile).toHaveBeenCalledWith(
        '.eslintrc.yaml',
        dedent`
          extends:
            - foo
            - prettier
          plugins:
            - bar
            - prettier
          rules:
            baz: warning
            prettier/prettier: error
        `+'\n',
        expect.any(Function),
      )
    });

    it('must update .eslintrc.js when it exists', async () => {
      const client = new Client();

      fs.__setMockFile(
        '.eslintrc.js',
        dedent`
          module.exports = {
            extends: ["foo"],
            plugins: ["bar"]
          };
        `
      );

      await client.installEslintExtras('npm');

      expect(fs.writeFile).toHaveBeenCalledWith(
        '.eslintrc.js',
        dedent`
          module.exports = {
            extends: ["foo", "prettier"],
            plugins: ["bar", "prettier"],\n
            rules: {
              "prettier/prettier": "error"
            }
          };
        `,
        expect.any(Function),
      )
    });

    it('must create .eslintrc.js when no other configuration file exists', async () => {
      const client = new Client();

      await client.installEslintExtras('npm');

      expect(fs.writeFile).toHaveBeenCalledWith(
        '.eslintrc.js',
        dedent`
          module.exports = {
            extends: ["prettier"],
            plugins: ["prettier"],\n
            rules: {
              "prettier/prettier": "error"
            }
          };
        `,
        expect.any(Function),
      )
    })
  });

  describe('addPrettierCommand', () => {
    it('must add prettier command to package.json', async () => {
      const client = new Client();

      fs.__setMockFile(
        'package.json',
        dedent`{
          "name": "foo-package",
          "scripts": {
            "test": "jest"
          }
        }`
      );

      await client.addPrettierCommand('foo');

      expect(fs.writeFile).toHaveBeenCalledWith(
        'package.json',
        dedent`{
          "name": "foo-package",
          "scripts": {
            "test": "jest",
            "prettier": "prettier --write foo"
          }
        }`,
        expect.any(Function),
      )
    });

    it('must preserve indentation', async () => {
      const client = new Client();

      fs.__setMockFile(
        'package.json',
        dedent`{
            "name": "foo-package",
            "scripts": {
                "test": "jest"
            }
        }`
      );

      await client.addPrettierCommand('foo');

      expect(fs.writeFile).toHaveBeenCalledWith(
        'package.json',
        dedent`{
            "name": "foo-package",
            "scripts": {
                "test": "jest",
                "prettier": "prettier --write foo"
            }
        }`,
        expect.any(Function),
      )
    });
  });

  describe('runPrettier', () => {
    it('must run prettier using supplied command', async () => {
      const client = new Client();

      await client.runPrettier('foo bar');

      expect(childProcess.spawn).toHaveBeenCalledWith(
        '/bin/sh',
        ['-c', 'foo bar'],
        { stdio: 'inherit' },
      );
    })
  });

  describe('commitChanges', () => {
    it('must run prettier using supplied command', async () => {
      const client = new Client();

      await client.commitChanges();

      expect(childProcess.spawn).toHaveBeenCalledWith(
        '/bin/sh',
        ['-c', 'git commit --all --edit --message "Installed prettier"'],
        { stdio: 'inherit' },
      );
    })
  });
});
