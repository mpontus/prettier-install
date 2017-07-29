const fs = require('fs');
const childProcess = require('child_process');
const Client = require('../client');
const dedent = require('dedent');

jest.mock('fs');
jest.mock('child_process');

describe('Client', () => {
  beforeEach(() => {
    fs.__resetMocks();
  });

  describe('installPrettier', () => {
    it('must run the supplied shell command', async () => {
      const client = new Client();

      await client.installPrettier('foo bar');

      expect(childProcess.spawn).toHaveBeenCalledWith(
        '/bin/sh',
        ['-c', 'foo bar'],
        { stdio: 'inherit' },
      );
    });
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

      await client.addPrettierCommand();

      expect(fs.writeFile).toHaveBeenCalledWith(
        'package.json',
        dedent`{
          "name": "foo-package",
          "scripts": {
            "test": "jest",
            "prettier": "prettier --write **/*.js"
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

      await client.addPrettierCommand();

      expect(fs.writeFile).toHaveBeenCalledWith(
        'package.json',
        dedent`{
            "name": "foo-package",
            "scripts": {
                "test": "jest",
                "prettier": "prettier --write **/*.js"
            }
        }`,
        expect.any(Function),
      )
    });

    it('allows specifying custom glob pattern', async () => {
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

      await client.addPrettierCommand('{src,__tests__}/**/.js **/*.jsx');

      expect(fs.writeFile).toHaveBeenCalledWith(
        'package.json',
        dedent`{
            "name": "foo-package",
            "scripts": {
                "test": "jest",
                "prettier": "prettier --write {src,__tests__}/**/.js **/*.jsx"
            }
        }`,
        expect.any(Function),
      )
    })
  });

  describe('writePrettierRc', () => {
    it('should create .prettierrc file when it does not exist', async () => {
      fs.readFile.mockImplementationOnce((filename, cb) => {
        expect(filename).toBe('.prettierrc');

        cb(Object.assign(
          new Error('no such file or directory'),
          {
            errno: -2,
            code: 'ENOENT',
          },
        ));
      });

      const client = new Client();

      await client.writePrettierRc({
        foo: 'bar',
      });

      expect(fs.writeFile).toHaveBeenCalledWith(
        '.prettierrc',
        dedent`{
          "foo": "bar"
        }`,
        expect.any(Function),
      )
    });

    it('should merge with existing configuration', async () => {
      const client = new Client();

      fs.__setMockFile(
        '.prettierrc',
        dedent`{
          "foo": "bar"
        }`
      )

      await client.writePrettierRc({
        bar: 'baz',
      });

      expect(fs.writeFile).toHaveBeenCalledWith(
        '.prettierrc',
        dedent`{
          "bar": "baz",
          "foo": "bar"
        }`,
        expect.any(Function),
      )
    });

    it.only('should override existing configuration', async () => {
      const client = new Client();

      fs.__setMockFile(
        '.prettierrc',
        dedent`{
          "bar": "baz",
          "foo": "bar"
        }`,
        expect.any(Function),
      )

      await client.writePrettierRc({
        bar: 'foo',
      });

      expect(fs.writeFile).toHaveBeenCalledWith(
        '.prettierrc',
        dedent`{
          "bar": "foo",
          "foo": "bar"
        }`,
        expect.any(Function),
      )
    })
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
